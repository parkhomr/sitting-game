# Arcade balance audit

All seats controlled by built-in bots, manual ballistic aiming with small error, purchases, normal cooldown/mana and PVE life rules. Pudge explicitly enables ten bots and plays thirty one-hit elimination rounds with Phase Shift and Blade Mail. 0.1s ticks, maximum 5400 simulated seconds. This measures deterministic balance and completion, not human playtesting or internet latency.

Source SHA-256: `268cdd820edcb96beaf9c2d96224e15eb79419bdefbdc529c790c48091942e67`

| Mode | Seed | Finished | Wave / round | Simulated seconds | First PVE life lost | Duels |
|---|---:|---|---:|---:|---:|---:|
| pudge | 40 | true | 30 | 359 | — | 0 |
| pudge | 41 | true | 30 | 294 | — | 0 |
| pudge | 42 | true | 30 | 322 | — | 0 |
| pudge | 58 | true | 30 | 344 | — | 0 |
| chaos | 40 | true | 38 | 1730 | 27 | 18 |
| chaos | 41 | true | 36 | 1526 | 26 | 17 |
| chaos | 42 | true | 36 | 1651 | 5 | 17 |
| chaos | 58 | true | 34 | 1600 | 12 | 16 |

Pudge uses exactly thirty rounds, immediate hook executions, optional bots explicitly enabled by this audit, 60-second round limits, five-second breaks, and timed Phase Shift / Blade Mail. Scores count round wins, not kills.

The Chaos opening has a gentle curve. After wave 15, enemy HP gains an additional 6.5% per wave and damage 4.5%, so late matches resolve rather than leaving successful builds alive forever. Every tenth wave trades the full pack for an ancient and two guards. Equipment, six-slot limits, five PVE lives, magic-resistance/armor waves, and fixed cast costs apply throughout.

Bots have an advantage in movement consistency; novice humans may lose lives sooner. This audit does not establish that all 111 spells are equally strong: support-only spells and risky combinations are intentionally possible, and skill replacement tokens provide a recovery route.
