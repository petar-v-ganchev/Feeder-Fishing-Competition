# Chapter 2: The Tactical Simulation Engine

This is the most critical logic module. It determines who wins and why.

## 2.1 The Efficiency Algorithm (`calculateEfficiency`)
Efficiency is a decimal value (0.0 to 1.0) calculated for every participant.

### Parameter Weighting (Total 20 Points)
- **Primary (4 pts each):** `Bait`, `Groundbait`. (Crucial for attracting the target species).
- **Secondary (3 pts):** `Hook Size`. (Determines hook-up rate vs fish size).
- **Tertiary (2 pts):** `Casting Distance`. (Determines if the player is hitting the "feeding zone").
- **Utility (1 pt each):** `Rod`, `Reel`, `Line`, `Feeder Type`, `Feeder Tip`, `Additive`, `Casting Interval`.

### Logic Loop
1. Fetch `dominant` species for the venue.
2. Cross-reference participant's current `Loadout` against `MOCK_FISH_SPECIES.preferred_X`.
3. For every match, add the corresponding weight to `currentPoints`.
4. Result: `currentPoints / 20`.

## 2.2 Bite Frequency Probability
The system runs a simulation tick every 1200ms (Live) or 2500ms (Practice).

### The Catch Formula
`P(Catch) = baseChance + (Efficiency^1.5 * bonusChance)`

- **Standard Base:** 0.06 (6% per tick).
- **Bonus Scaling:** 0.18 max.
- **Power Curve:** Raising `Efficiency` to the power of 1.5 creates an exponential reward for perfect tactics, making "90% accuracy" significantly better than "50% accuracy".

## 2.3 Catch Dynamics
When a catch occurs:
1. **Weight Generation:** `Random(minWeight, maxWeight)` from species data.
2. **Trend Analysis:** Tracks catch timestamps in a 60-second sliding window.
   - `Rising`: More catches in the last 60s than the previous 60s.
   - `Falling`: Fewer catches.
   - `Stable`: Equal rate.

## 2.4 Real-time Tactical Adjustments
The `MatchUIScreen` allows the player to change tactics *during* the match.
- **Impact:** Changing a tactic updates the efficiency for the *next* simulation tick immediately. 
- **Strategy:** If the "Trend" is falling, players should rotate baits or additives to find what the fish currently desire.