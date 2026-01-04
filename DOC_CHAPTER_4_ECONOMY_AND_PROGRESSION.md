# Chapter 4: Economy, Shop & Progression

## 4.1 Shop Architecture (`ShopScreen.tsx`)
The shop is the primary source of equipment.
- **Permanent Items:** Rods, Reels, Seat Boxes, Landing Nets. Once bought, they are marked as "Owned" and cannot be repurchased.
- **Consumables:** Baits, Groundbaits, Additives. These can be bought multiple times (tracked in the `inventory` array).

## 4.2 Prize Pool Scaling
Winning a match rewards "Euros" (Game Currency).
- **Practice Match:** 
  - 1st: 100€
  - 2nd: 60€
  - 3rd: 40€
- **Live Match (High Stakes):**
  - 1st: 500€
  - 2nd: 300€
  - 3rd: 200€
- **Logic:** Rank is determined by `totalWeight` descending.

## 4.3 Daily Challenges
Managed by `dailyChallengeService.ts`.
- **Cycle:** 10 deterministic challenges that rotate daily.
- **Rewards:** Varying from 100€ to 1000€ depending on difficulty (e.g., "Win 5 matches in a row").
- **State:** Progress is checked against local stats and must be manually "Claimed" by the user.

## 4.4 Stats Tracking
Stored in `users/{uid}/stats`.
- `matchesPlayed`: Total competitive matches.
- `wins`: Total 1st place finishes.
- **Win Ratio:** Dynamically calculated as `wins / matchesPlayed`.