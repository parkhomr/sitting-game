# Arcade validation — 2026-10-27

- Full suite: **131 passing tests**, including the existing 78 farm regressions.
- The full suite also passes from a fresh extraction of the multiplayer ZIP.
- Chaos: four distinct hero choices, first-preserving reroll, 16 unique offers,
  measured native first-draw weighting, skill gates, rank-preserving tokens,
  six slots, typed restore, five lives and immediate last-survivor victory.
- All **97 active abilities** execute and render in a real browser. All **111
  skill icons** and **24 hero sprites** render without Canvas exceptions.
  Focused tests cover Rearm/interrupts, Multicast/mana, illusions/Metamorphosis/
  Sunder, Spell Steal, all ten Invoker orb combinations, lift/fear and invisibility.
- Pudge: first-body one-hit executions, allied rescue, river bounds, optional
  bots, pre-match team selection, 30 complete elimination rounds, no respawn
  within a round, crossing-hook double wipes, timeout draws and final tied scores.
- Pudge v1.1.1: full cooldown reset on deaths (including both Blade Mail victims),
  outbound-only walking lock with spells/items allowed, prediction lock/release,
  distinct nonoverlapping own-bank spawns across 30 rounds and 16 seeded games,
  and typed save restoration of spawns and dead players’ cleared cooldowns.
- Phase Shift: three seconds, early cancellation, unchanged 15-second cooldown,
  intangibility, movement/cast lock and hooks hitting an enemy behind the shifter.
- Blade Mail: one purchase, two-second window, exactly two credited deaths,
  expiration, cooldown, no recursive reflection, drawn double-wipe round.
- Real authoritative WebSocket sessions: ten Pudge clients and eight Chaos
  clients. Shared movement and states agree. Compact deltas reconstruct state;
  representative bot sequences were 88–92% smaller than full snapshots.
- Server checks reject guest start, mode changes, host impersonation and taking
  another player's reserved seat. A host can possess a free seat. Host-only
  restart retains names, room mode, 30-round limit and session seats.
- Real two-browser workflow: host creates room, a guest opens an invite with an
  intentionally wrong `?mode=` hint, joins the server-selected mode, drafts,
  starts with the host, and reconnects with the same hero and learned ability.
- Offline browser check blocks network access: all three modes work inside the
  single HTML with **zero HTTP requests**. Verified hero/skill drafting, keyboard
  movement, the hook button, returning to the original farm, and 390px layout.
- Pudge browser check: zero default bots, host-only bot buttons, guest team
  selection/switching, shared phase/cancellation, reconnect cooldowns, Blade Mail
  purchase/hotkey, visible spikes and purple sparkles, desktop and 390px layouts.
- Duel browser check: preparation cards, legal game-gold stake, reload refund,
  restarted countdown, live duel and spectator camera.
- Both ZIP archives pass CRC checks. The multiplayer archive includes all
  modules, vendored WebSocket code, tests, research, balance audit and packager.

See [the campaign audit](../balance/ARCADE-REPORT.md) for reproducible seeded
matches. These tests do not constitute human playtesting of all builds or a
real multi-country latency measurement. Exact current Dota/Workshop parity is
not claimed; deliberate differences are listed in [MODES.md](MODES.md).
