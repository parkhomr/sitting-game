# Aghanim’s Labyrinth

Playable 2D prototype: solo or up to six players, 20 rooms, ten heroes, traps, bosses, shops, shards and local progression. Mechanics and balance remain incomplete; this is not a production-secure game.

## Start

- **Offline:** extract `oscar-farm-local.zip`, keep its two HTML files together, and select Labyrinth from the main menu. Or open `downloads/labyrinth.html` directly. Saves are local to the browser/origin.
- **Online:** in the project directory run `npm start` (Node 20+); open `http://localhost:8787/` and select Labyrinth. The host creates a separate Labyrinth room, shares the invite and starts once everyone selects a unique hero. For friends outside the local network, run `npm run online`, wait for the verified public link, then use Labyrinth’s Copy link button. A Farm party or run does not automatically transfer to the Labyrinth lobby. Keep the server and tunnel running.

## Controls and progression

WASD/arrows move; mouse aims; hold click/Space for a basic attack. Z/X/C/R cast; Ctrl+Z/X/C/R or the gold + spend a skill point. Q revives a fallen ally after 4 seconds standing still; 1 uses a Healing Potion and 2 a Mana Potion; V uses any retained Clarity Flask; F/G use active items. Healing and Mana Potions cost 100 gold each, stack up to 99 per type and instantly restore 40% of maximum HP or mana. They are usable while alive in combat. Basics have four ranks; ultimate ranks require hero levels 6, 12 and 18. Each completed room grants 1.5 hero levels, fractions carried. The shop puts READY and purchased inventory before the store.

Party difficulty is available if **any participating player** has unlocked it on their device. Any player may select an available difficulty; only the host starts. An unqualified player's own unlock is unchanged. If the last qualifying player leaves before starting, the selected difficulty is reduced to what remains available. Progress is browser-local and client-reported, not an account or anti-cheat system.

## Testing console

Host opens the console or presses backtick (`). In the **lobby**, `unlock 4` temporarily opens Ascension IV (values 0–4) for the party's testing run. After starting, `clear` completes the current room and preserves its normal reward/route choice; use it during prep, combat, shop or event, not during an already pending choice. `level 1`–`level 18` jumps to an original schedule room (not the displayed 20-room numbering; clear original room 6 or 9 to test the following fog room) and `damage 10` multiplies party damage (`damage 1` resets it). These commands mark the run as a test: it grants no permanent fragments or difficulty unlocks. `unlock` does not modify the saved profile and expires with the run.

## Fog and sound

Two mandatory combat rooms appear after displayed rooms 6 and 10 (fog rooms 7 and 11), worth 225 gold and 25 fragments instead of normal 150 gold and 20 fragments, plus the usual level progression. Each player sees a separate 390-unit radius around their own hero, including while fallen; outside is dark. This is a rendering effect only: the server still sends the full state, so fog is not anti-cheat. Observer hosts see the full map. Old saves are migrated without replaying fog rooms already passed.

Short procedural death cues distinguish normal, elite, and boss enemies; shop and fog entrances have 3-second cues. Browsers require a click or keypress to enable audio; use Sound to mute.

## Current arena

Arena 2400 × 1500; normal wave totals are increased by 30% with rounded integer totals. Enemy movement is 15% slower than the earlier build; Golden Flock couriers are 25% faster than that version. Blue/light-green spawn portals last 1.3 seconds, followed by 0.8 seconds of inactivity; enemies become targetable on emergence. Trap warnings use circles with 25% less radius, appear twice as often, and each wave randomly selects two distinct line/cross/semicircle/circle patterns.

For architecture, verification and limitations see `labyrinth/HANDOFF.md`.
