# Changelog

All notable changes to MM4E are documented here.

---

## [Unreleased] — 2026-04-23

### Fixed

**Pairing logic — rounds 3 & 4 forbidden-pair bug**
- Replaced the simple `(i + 1) % 4` cyclic shift used for round 3/4 pairings with an exclusion-aware randomised backtracking search (`findAlternativePermutation`). The old shift could produce a pairing that violated an exclusion constraint; the new algorithm guarantees every A gets a different B than in rounds 1/2 **and** that no excluded pair is formed.

**Props conflict — missing Reject option**
- The non-submitting participant in the props & furniture phase previously had only a Confirm button. A **Reject** button has been added so they can send the proposal back and the pair can try again. The organizer Override button has been removed entirely from this phase.

**Round 4 song selection — redundant step**
- By round 4, exactly one song remains available per pair. Song voting is now **skipped** automatically; the sole available song is auto-selected when the draw animation completes and play advances directly to props & furniture.

### Changed

**Display — pairing reveal removed before animation**
- The TV/display no longer shows a "The Pairs" splash screen during the `pairing_computed` phase. Pairings for rounds 1 and 3 are now first revealed through the slot-machine draw animation, preserving suspense.

**Standing / Seated — text labels replaced with icons**
- The text labels "Standing" and "Seated" have been replaced with 🧍 and 💺 icons everywhere they appear: the slot-machine draw animation and the performance screen.

**Props & furniture — emoji icons throughout**
- Props and furniture are now displayed as emoji icons with labels (🧹 Mop, 🎀 Sash Ribbon, 👟 Belt · 🪑 Chair, 🪵 Table, 🛋️ Wide Couch) in the proposal, confirmation, and performance screens, replacing plain text.

**Performance screen — participant cue text**
- The participant phone message during a live performance has changed from `"Waiting for organizer to advance…"` to `"Let's go!"`.

---

## [1.0.0] — 2026-04-22

### Added

- Initial full release: 8-participant constrained round-robin performance game
- Setup, song submission, exclusion setting, role selection, pairing computation phases
- 4 rounds × 4 pairs per round with full sub-phase flow: Draw → Song → Props → Perform
- Slot-machine draw animation with Framer Motion
- Real-time WebSocket state sync (server → all clients on every change)
- Organizer PIN gate; participant PIN authentication with bcrypt
- Display (TV/projector) view with QR code for participant onboarding
- Participant QR code reconnect flow
- Disk persistence (`state.json`) with automatic server-restart recovery
- Exclusion feasibility check (Hall's theorem via backtracking) with live organizer warning
- Song pool management: songs retired after use, unavailable to the submitting pair
- Song tie-breaking by organizer in song selection phase
