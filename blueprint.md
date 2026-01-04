# FFC: Feeder Fishing Competition - Technical Blueprint

This document serves as the absolute "Source of Truth" for the FFC application. It is designed to be parsed by an AI to recreate the application with perfect fidelity.

---

## 1. Global Project Standards

### 1.1 UI Design Language (Tailwind Config)
- **Primary Color:** `#1e3a8a` (Navy) - Header backgrounds, primary buttons, active user highlights.
- **Secondary Color:** `#dc2626` (Red) - Alerts, daily challenge highlights, countdown warnings.
- **Surface Color:** `#ffffff` (White).
- **Background Color:** `#f1f5f9` (Slate 100).
- **Text Primary:** `#0f172a` (Slate 900).
- **Text Secondary:** `#64748b` (Slate 500).
- **Border Radius:** `small: 4px`, `medium: 8px`, `large: 16px`.
- **Layout:** Mobile-first, max-width `480px`, centered.

### 1.2 State Management
- **Navigation:** Managed via `screenStack: Screen[]` in `App.tsx`. The last element in the array is the active view.
- **User State:** Persisted in Firestore and local React state.
- **Locales:** Supported languages: `bg, cz, de, en, es, fr, it, hu, pl, pt, ro`.

---

## 2. Authentication & User Onboarding

### 2.1 Login Screen (`LoginScreen.tsx`)
- **Components:** Language selector, Email/Password inputs, "Remember Me" toggle.
- **Logic:** 
  - Uses Firebase Auth.
  - `rememberMe` persists session via `browserLocalPersistence`.
  - Handles `auth/invalid-credential` and `auth/email-already-in-use`.

### 2.2 Create Profile (`CreateProfileScreen.tsx`)
- **Requirement:** Triggered if UID has no Firestore document.
- **Functionality:** 
  - `displayName` (3-15 chars).
  - Global uniqueness check for `displayName` via Firestore `displayNames` collection transaction.
  - Initialization: 1000 Euros + `MOCK_INVENTORY_ITEMS`.

---

## 3. Preparation & Economy

### 3.1 Loadout Screen (`LoadoutScreen.tsx`)
- **Venue Logic:** Randomly selects 1 Dominant and 1 Secondary fish species from `MOCK_FISH_SPECIES`.
- **Selection:** 11 dropdowns filtering only owned items from `user.inventory`.
- **Persistence:** Saves loadout to `ffc_active_match_loadout` in `localStorage`.

### 3.2 Shop Screen (`ShopScreen.tsx`)
- **Categories:** Groundbaits, Bait, Additives, Rods, Reels, Lines, Hooks, Feeders, Accessories.
- **Logic:**
  - Consumables vs. Permanent: Rods/Reels/Accessories check `isOwned` and disable purchase.
  - Price Validation: Checks `user.euros >= item.price`.

---

## 4. The Match Engine (`MatchUIScreen.tsx`)

### 4.1 Catch Efficiency Algorithm (`calculateEfficiency`)
- **Total Points System:**
  - `Bait` (4), `Groundbait` (4)
  - `Hook` (3)
  - `Distance` (2)
  - `Interval`, `Feeder`, `Tip`, `Rod`, `Reel`, `Line`, `Additive` (1 each)
- **Calculation:** `(Sum of matched parameter weights) / (Total possible weight 20)`.

### 4.2 Probability Simulation
- **Interval:** 2500ms (Practice) / 1200ms (Live).
- **Formula:** `baseChance + (Math.pow(efficiency, 1.5) * bonusChance)`.
- **Base Chance:** Player: 0.06 | Bot: 0.04.
- **Bonus Chance:** Player: 0.18 | Bot: 0.14.

### 4.3 UI Visuals
- **Standings Diagram:**
  - Bar height = `(p.weight / maxWeight) * 100`.
  - Background Color Transition: `duration-300` ease. `bg-blue-50/40` (Idle) -> `bg-green-100/40` (Catch active).
- **Tactics Table:**
  - Sticky Left Column (Labels).
  - Sticky First Player Column (User).
  - Real-time dropdown updates update the efficiency in the running simulation.

---

## 5. Live Multiplayer (`LiveMatchmakingScreen.tsx`)

### 5.1 Session Scheduling
- **Windows:** 15-minute intervals (calculated via `Math.ceil(now / 15min) * 15min`).
- **Multitenancy:** Firestore collection `/live_sessions/{timestamp}/participants`.

### 5.2 Waitlisting
- **Limit:** 15 participants per session.
- **Logic:** Players at indices 16+ are displayed with `opacity-40` and "Waitlisted" badge.
- **Start Condition:** Human count >= 2. If not met at T=0, the session is rescheduled +15m.

---

## 6. AI Tactical Assistant (`geminiService.ts`)

### 6.1 Prompt Engineering
- **Model:** `gemini-3-pro-preview`.
- **Context:** User Loadout + Venue Dominant Species + Venue Conditions.
- **Constraint:** "Expert feeder fishing consultant. 15 words max. Technical only. Localized."

---

## 7. Leaderboard & Stats (`leaderboardService.ts`)

### 7.1 Aggregation Scopes
- **Daily/Weekly/Monthly:** Queries `matchHistory` collection within timestamp range.
- **All-Time:** Queries `users` collection sorted by `stats.wins`.
- **Tie-Breaker:** Fewer `matchesPlayed` ranks higher for the same number of `wins`.

---

## 8. Data Schema

### 8.1 User Document (`users/{uid}`)
```typescript
{
  id: string,
  displayName: string,
  euros: number,
  inventory: GameItem[],
  stats: { matchesPlayed: number, wins: number },
  country: string,
  language: string,
  avatar: string
}
```

### 8.2 Match History (`matchHistory/{id}`)
```typescript
{
  userId: string,
  country: string,
  isWin: boolean,
  rank: number,
  timestamp: ServerTimestamp
}
```
