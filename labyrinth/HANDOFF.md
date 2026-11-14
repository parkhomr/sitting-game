# Labyrinth — current handoff

## Status and scope

Playable 2D canvas prototype embedded in Oscar Farm Club. Ten heroes, solo/1–6 online, 20-room route, four traps, three event types, shops, shards, elite encounters and three bosses. Two mandatory fog combat rooms follow displayed rooms 6 and 10 (rooms 7 and 11). Original schedule indices still drive admin `level 1–18`, bosses and shops; displayed bosses are 5, 14, 20, shops 6, 13, 19. Route choices can replace scheduled encounters. This is a simplified fan adaptation, not a complete Dota implementation or validated production game; review IP rights before public distribution.

## Run and verify

Node 20+. `npm start` serves the main menu and `/labyrinth.html`; `npm run online` runs the existing public-link workflow. `npm run package` builds sibling offline HTML files, the local ZIP and full project ZIP. Keep the main HTML and `labyrinth.html` together so the menu link works. `downloads/labyrinth.html` is self-contained. `npm test`, `node --test test/labyrinth*.test.mjs`, and `npm run balance:labyrinth` run regression tests or deterministic diagnostic bots; bots are not human balance evidence.

## Current rules

- Arena 2400 × 1500 with obstacle-aware paths. Base waves have 30% more enemies, total rounded once and distributed proportionally; up to 20 simultaneous. Enemy movement speed ×0.85; Golden Flock courier speed ×1.25 relative to that earlier movement speed.
- Spawn and summons use 1.3 s shard portals (blue normal, green elite); invulnerable/unselectable during the portal, then targetable but inactive 0.8 s. Bosses do not use wave portals. Timers use the authoritative world clock.
- Every trap warning wave independently chooses two distinct seeded patterns: line, cross, semicircle or circle. Trap radii ×0.75; intervals are rocks 1 s, poison 1.5 s, laser/spikes 2 s. Damage and warning duration are unchanged. Shapes are placed around living heroes inside the arena. Falling Ceiling switches and party exit remain.
- Each clear grants 1.5 hero levels (fraction carried); one skill point per level, 3 basics rank 0–4, ultimate rank 0–3 gated at hero levels 6/12/18. Z/X/C/R cast; Ctrl+key or + levels; Q revive. Heal/Mana potions cost 100, stack to 99 each and restore 40% max instantly on 1/2 in combat; legacy Clarity remains on V. Shards, legendaries, fragments and shop items have prototype effects.
- Any participant’s browser-local unlock enables that difficulty for the party in the lobby; any player can select it, host starts. The server validates the shared reported max but profiles are client-controlled and not secure. On leave, an unavailable selection is lowered. `unlock 0–4` is a host-only, lobby-only, temporary testing override; test runs have no permanent rewards. `clear` completes the room through normal reward and route choices; `level`/`damage` work after start. Saves v1–v4 migrate to v5 without replaying already-passed fog rooms; v3 ranks are preserved and queued old waves remain until next room.

## Code map and caveats

`dist/labyrinth-data.js` holds content/constants; `labyrinth-engine.js` is authoritative deterministic rules and save migration; `labyrinth-art.js` renders; `labyrinth-audio.js` synthesizes local audio; `labyrinth-client.js/html/css` is the UI; `server.mjs` owns online sessions and full snapshots; `package-local.mjs` bundles. Offline progress is per browser/origin; online runs are in server memory, not durable accounts. The Labyrinth lobby is separate from Farm; its invite uses the server’s verified public tunnel origin when available. Current version still has simplified/unimplemented hero/item effects and no comprehensive full-run human, multiplayer, mobile or balance validation. Fog is per-player rendering only; full authoritative snapshots are visible to clients, not anti-cheat. Observer host sees the full arena. Audio needs an initial browser gesture. Fog, sounds, map density, faster traps and courier tuning need playtesting; avoid claims of balance or production security.
