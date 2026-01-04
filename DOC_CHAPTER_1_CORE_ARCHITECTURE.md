# Chapter 1: Core System Architecture

## 1.1 Technical Foundation
The FFC (Feeder Fishing Competition) application is built as a highly-performant, mobile-first React 19 Single Page Application (SPA). It utilizes a "Screen Stack" navigation architecture instead of a traditional router to ensure zero-latency transitions and a native-app feel.

### Key Technologies
- **UI Layer:** React 19 (Functional Components, Hooks).
- **Styling Layer:** Tailwind CSS 3.x (Atomic utility classes, customized for Navy/Red branding).
- **Persistence Layer:** Firebase Firestore (Real-time document-based DB).
- **Auth Layer:** Firebase Auth (Identity management).
- **Intelligence Layer:** Google Gemini 3.0 Pro API (Contextual tactical analysis).
- **Environment:** Vite-based ES6 module delivery.

## 1.2 The Navigation Engine (`App.tsx`)
Navigation is managed via an internal `screenStack` array state. 
- **Type:** `Screen[]` (Enum).
- **Behavior:** 
  - `handleNavigate(screen)`: Pushes a new screen onto the stack.
  - `handleBack()`: Pops the current screen.
  - `handleResetStack(screen)`: Clears history and sets a root view (e.g., Main Menu after Login).
- **Logic:** This approach allows for complex overlay flows (like Shop -> Item Detail -> Back) without losing background state.

## 1.3 Application State Lifecycle
1. **Bootstrap:** Check `onAuthStateChanged`.
2. **Profile Sync:** If authenticated, fetch `users/{uid}`.
3. **Migration:** Check for legacy item IDs and update the user's inventory to the modern schema.
4. **Localization:** Apply `locale` from local storage or user profile.
5. **Screen Entry:** If profile exists, go to `MainMenu`. If not, go to `CreateProfile`.

## 1.4 Global CSS & Animation Registry
- **Custom Scrollbar:** `.custom-scrollbar` ensures consistent UI across iOS and Android browsers.
- **Bite Alert:** `.animate-catch-event` uses a 2-second keyframe animation (`catch-fade`) to provide visual feedback for fish captures.
- **Branding:** Primary Navy (`#1e3a8a`) used for authority; Secondary Red (`#dc2626`) used for urgency/competitiveness.