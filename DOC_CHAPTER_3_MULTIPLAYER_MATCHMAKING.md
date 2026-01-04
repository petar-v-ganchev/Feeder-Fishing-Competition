# Chapter 3: Live Multiplayer & Matchmaking

## 3.1 Session Window Logic
Live matches do not start on-demand. They are scheduled in fixed 15-minute intervals globally.
- **Formula:** `Math.ceil(Date.now() / 900000) * 900000`.
- **Result:** Every player in the world is looking at the same countdown timer.

## 3.2 Firestore Synchronization
- **Collection Path:** `/live_sessions/{session_id}/participants/{user_id}`.
- **Enrolment:** On mounting `LiveMatchmakingScreen`, the user adds their profile to the sub-collection.
- **Cleanup:** On unmount or app close, the user is removed via `leaveLiveSession`.

## 3.3 The "Waitlist" System
- **Hard Limit:** 15 players per match.
- **Ordering:** Determined by the `joinedAt` server timestamp.
- **User Feedback:** Players at index 16+ see an "Opacity 40" UI state with a "Waitlisted" badge. If a player in the top 15 leaves, the waitlisted players move up automatically via the `onSnapshot` listener.

## 3.4 Start Conditions
1. Timer reaches `00:00`.
2. System checks `participants.length >= 2` (Humans only).
3. If true: Proceed to `LoadoutScreen`.
4. If false: Reschedule for +15 minutes and notify the user.

## 3.5 Match Stability
Once the match starts, participants are "locked in". The `participantsOverride` prop is passed to `MatchUIScreen`, and the internal simulation now uses these real human profiles instead of bots.