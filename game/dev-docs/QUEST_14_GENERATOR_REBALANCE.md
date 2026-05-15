# Quest 14 - Generator Difficulty Rebalance

## Problem

The validation pass made generation fair but too safe. Easy and recovery patterns dominated because selection favored preferred next patterns, most preference lists pointed back to safe/recovery/medium content, hard patterns were gated too late, and fallback logic moved to safe/recovery too quickly.

## Changes

- Added score-tier weighted difficulty selection:
  - early: 40% easy, 35% medium, 10% hard, 15% recovery
  - mid: 20% easy, 40% medium, 25% hard, 15% recovery
  - high: 10% easy, 35% medium, 40% hard, 15% recovery
- Changed fallback order:
  - selected hard fails -> try other hard patterns, then medium, then easy, then recovery
  - recovery is used first only when the rhythm budget explicitly forces it
- Recovery rules:
  - no repeated recovery sections
  - recovery usually requires prior hard or sustained medium/hard challenge
- Added hard pattern contracts:
  - minimum obstacle count
  - minimum reward value
  - risk/reward path required
  - jump or pump requirement required when declared
- Strengthened hard pattern bodies:
  - Ramp Reward Arc now has two ground obstacles after the launch/gap sequence
  - Downhill Pump now puts a jumpable obstacle on the main survival bridge and keeps deeper red-ramp routes as higher reward/higher danger
- Debug overlay now shows active budget and hard/challenge streaks.

## Safety invariant

Safe path still means at least one reasonable survival path. It does not mean every route is low-risk or every reward is easy.
