# Browser recreations: research and rule decisions

References checked 2026-10-24; Pudge rules updated 2026-10-27 at the user’s request. These are independently implemented fan modes, not the original
Dota engine, maps, models, workshop scripts, or exact patch balance.

## Primary and firsthand references

- [Custom Hero Chaos Workshop listing, EOM Studio](https://steamcommunity.com/sharedfiles/filedetails/?id=1999002498): freely mixed heroes/abilities, last survivor wins, original solo / paired / team variants.
- [Dota 2 Pudge Wars developer group](https://steamcommunity.com/groups/d2pudgewars): classic 5v5, a river that cannot be walked across, Meat Hook, first team to 50 kills.
- [Pudge Wars one-hook variant Workshop listing](https://steamcommunity.com/sharedfiles/filedetails/?id=470524658): a distinct one-hit variant with selectable score targets. The initial build used the classic damage variant; the user now explicitly requested one-hit hooks and thirty elimination rounds.
- [Custom Hero Chaos firsthand account, August 2024](https://tarmrening.com/2024/08/21/custom-hero-chaos-the-biggest-game-inside-dota-2/): four heroes, a reroll retaining the first choice, 16-skill offers, five normal ability slots, more frequent native skills, wave racing, duels, 15-second betting, replacement tokens and catch-up rewards. This is a player's account, not a current authoritative specification.
- [Chaos Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2971173666): additional community description of skill acquisition, duels, items, and useful versus situational builds. Exact timings differ between versions.
- Official hero references: [Tinker](https://www.dota2.com/hero/tinker), [Ogre Magi](https://www.dota2.com/hero/ogremagi), [Terrorblade](https://www.dota2.com/hero/terrorblade). Ability names and signatures inform independently written descriptions; numeric values are adapted to the browser arena.

## Explicit browser rules

- All multiplayer room modes are chosen at creation and immutable. Invitees get
  the server's room mode; URL mode hints cannot override it. Only the host can
  start or restart the new modes. Free seats use bots.
- Pudge Wars: up to 10 player seats (5 per team), optional observer host,
  pre-match team choice, first-body hooks and allied rescues. **One hostile hook
  executes its target. Exactly 30 elimination rounds**, no respawn within a
  round. A double wipe or 60-second standoff draws; breaks last 5 seconds.
  Final equal scores draw. These round rules are user-specified adaptation rules,
  not a claim about the classic Workshop map.
- Pudge has no automatic bots. The host explicitly adds/removes bots; reserved
  human seats cannot be displaced. Mid-round additions wait until the next round.
- Pudge Phase Shift: free, 3 seconds, 15-second cooldown, cancellable with the
  same button. Intangible while active, purple sparkles replace the body.
  Blade Mail: 900 game gold, 2-second active window, 18-second cooldown. A hostile
  hook during the window kills both target and hooker, with atomic non-recursive
  reflection and visible body spikes. Only timings requested by the user are
  mandatory; Blade Mail's cost/cooldown are local balance decisions.
- Damage upgrades and obsolete HP/hook-blocking items were removed from Pudge;
  range/speed/width upgrades, Boots, Blink and utility runes remain.
- Chaos: 8 competitors and optional spectator host; four distinct random hero
  options, one free reroll that preserves the first hero, 16 distinct ability
  options per offer, five main skill slots and a purchasable sixth. All main
  skills of the included roster are represented; Invoker's invoked spells and
  selected historical/secondary spells are also included. Innates, facets,
  every Shard/Scepter interaction and all Dota heroes are not claimed.
- Native-skill weighting is **4× the weight of a non-native skill**, with sampling
  without replacement. No verified official percentage was found. This is an
  explicit recreation value, not a claim about the original map.
- Chaos retains this project's user-requested **five PVE lives per competitor**.
  A failed wave costs one; duels do not spend those lives. Duels alternate with
  pairs of PVE rounds. Duel countdown is 15 seconds and bets use game gold only.
- Ability/item numbers, wave pace, gold rewards, creep resistances, damage caps,
  summon limits, and control protection are tuned for short browser sessions.
  No monetization, real-money gambling, external accounts, or asset downloads.
