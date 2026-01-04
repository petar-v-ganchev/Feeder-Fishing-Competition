# Chapter 5: UI/UX Component Specifications

## 5.1 The "Match Table" View
The most complex UI element in the game.
- **Headers:** Sticky top row. Displays Name and Weight.
- **Sticky Column:** The first column (Labels/Player Tactics) is `sticky left-0` with a higher `z-index` and a slight shadow to indicate depth.
- **Visual Feedback:**
  - If `isUser`: The cell border is `border-primary/40`.
  - If `isCatching`: The header background flashes `bg-green-100`.
- **Table Cell Layout:**
  - Floating Label: Absolute positioned at `-top-1.5` with `text-[6px]`.
  - Input: Select dropdown with custom SVG arrow.

## 5.2 Standings Diagram
- **Animation:** `transform-gpu will-change-[height]`. This ensures the bar animations are handled by the GPU, preventing frame drops during the match simulation.
- **Interaction:** Tapping a bar triggers `scrollToParticipant`, which uses `scrollIntoView` or manual `scrollLeft` calculation to focus on that player's tactics.

## 5.3 Modals & Overlays
- **ConfirmationModal:** Standardized for critical actions (Delete Account, Logout).
- **Appearance:** `backdrop-blur-sm` and `bg-black/70` for high contrast.

## 5.4 Localization Support
- **Currency Formatting:** `formatCurrency` in `LanguageContext.tsx` handles regional symbol placement.
- **Translations:** Every item ID has a corresponding key in `i18n/translations.ts`. Descriptions use a "Default" fallback to prevent empty UI states.