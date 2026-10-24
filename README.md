# СИДИ КАЧАЙСЯ — Oscar Farm Club

Локальная пиксельная фан-игра с общей сетевой комнатой. Пять героев, ручное
прицеливание, лесные волны, тимфайты, Рошан на 30-й волне, лавка предметов.
У каждого героя **5 жизней на весь забег**. Уровни не заканчиваются; забег
заканчивается, когда жизни исчерпаны у всех пятерых.

## Запуск

Одному: открой `../СИДИ-КАЧАЙСЯ.html` или `downloads/СИДИ-КАЧАЙСЯ.html`.
Файл содержит весь код, графику и стили и работает без интернета.
`../oscar-farm-local.zip` можно отправить другу для одиночной игры.

С друзьями из разных стран: ведущему нужен Node.js 20+. В этой папке:

```sh
npm run online
```

Первый запуск загружает официальный cloudflared; зависимости WebSocket уже
включены в проект. Дождись надписи «ВНЕШНЯЯ ССЫЛКА ПРОВЕРЕНА — ИГРА ДОСТУПНА».
Ведущий может открыть localhost из терминала или внешнюю ссылку. Создай комнату
за героя или выбери отдельное шестое место «Ведущий». Кнопка «Ссылка друзьям»
копирует внешний адрес и код комнаты. Друзьям нужен только браузер.

Компьютер ведущего и терминал должны оставаться включёнными. Ctrl+C останавливает
сервер и временную ссылку; после нового запуска адрес изменится. После обновления
кода останови старый процесс, снова выполни `npm run online` и отправь новую ссылку.

Для локальной сети: `npm start` запускает сервер на `127.0.0.1:8787`.
Для постоянного размещения можно запустить `node server.mjs` за HTTPS-прокси.
Внешняя ссылка проверяется по `/health` и идентификатору конкретного процесса.
При DNS-ошибке Firefox можно очистить DNS в `about:networking#dns` или
перезапустить браузер, затем открыть актуальную проверенную ссылку.

## Управление

| Действие | Кнопка |
|---|---|
| Прицел | Мышь; на телефоне касание арены |
| Атака | ЛКМ (можно удерживать) / Пробел |
| Движение | WASD / стрелки / ПКМ; на телефоне стрелки |
| Направленный скилл | Q, кроме Shadowraze |
| Койлы Артура | Z — ближний, X — средний, C — дальний |
| Eul у Артура / Шрапнель у Эмира | E |
| Requiem of Souls | R у Артура |
| Black King Bar | F после покупки |
| Электрический щит Mjollnir | G после покупки |
| Пауза | P; в комнате останавливает только своего героя |

Снаряды летят по прямой и попадают при столкновении: нужно упреждение,
от вражеских атак можно уклониться. Обычные атаки, удержание ЛКМ и «Автоогонь»
используют один таймер скорости атаки. Автоогонь по умолчанию выключен;
он повторяет выстрелы по твоему прицелу. Боты целятся самостоятельно,
но их снаряды тоже не доворачивают. Мана восстанавливается медленно;
между волнами восполняется 20% максимальной маны.

## Герои и скиллы

| Игрок | Герой | Умения |
|---|---|---|
| Оскар | Drow Ranger | Пробивающий ледяной веер Q; талант замедляет и усиливает пробивание стрел |
| Ержан | Timbersaw | Веер пил Q и временная броня; 40% базового снижения входящего урона |
| Артур | Shadow Fiend | Три койла Z/X/C, Eul, Requiem и накопление душ |
| Санжар | Rubick | Прямые пробивающие импульсы Fade Bolt; ослабление врагов |
| Эмир | Sniper | Прицельное добивание Q и Шрапнель E |

Койлы направляются курсором и взрываются на дистанциях 200 / 450 / 700.
У каждого свой КД 8 сек и стоимость 60 MP до улучшений. Предупреждение длится
0.4 сек, после нажатия точка фиксируется. Eul требует навести курсор прямо
на врага в радиусе 560: 75 MP, 23 сек, подъём на 2.5 сек. Requiem стоит 175 MP,
КД 65 сек, требует подготовки и выпускает физические летящие души. Оглушение
и Hex прерывают подготовку; Рошан не поднимается Eul и не боится душ.

Эмир не может добивать крипов даже с чужим скиллом или предметом. Шрапнель и
молнии оставляют крипу минимум 1 HP. Начальный порог добивания героев: обычная
атака 20%, Q 32%; у Рошана 4% / 8%. Каждый купленный ранг скилла прибавляет
1 процентный пункт. Пределы: 45% / 60% для героев и 20% / 25% для Рошана.
Снаряд должен попасть, а порог проверяется при попадании.

## Лавка и экономика

Лавка находится сразу под ареной. Можно купить по одному предмету каждого вида;
инвентарь и золото личные, предметы не занимают слот умения. Продажи жизней нет.

| Предмет | Цена | Эффект |
|---|---:|---|
| BKB | 2200 G | +200 HP, +8% атаки. F: 6 сек иммунитета к контролю и −75% магического урона; КД 35 сек |
| Heart of Tarrasque | 2800 G | +800 HP, +15% базового HP. Дополнительный реген +0.5% HP/сек в бою, +2% спустя 4 сек без урона |
| Daedalus | 2600 G | +35% атаки. 25% шанс крита ×2.2 обычного попадания. Эмиру вместо критов +3 п.п. к стилу до общего лимита |
| Mjollnir | 2400 G | +18% атаки, +35% скорости. 30% шанс молнии по 3 врагам после попадания. G: щит на 8 сек, КД 24 сек |

Молния наносит 60 + 7 × уровень магического урона, прыгает к противникам в
радиусе 380 и не запускает новые молнии сама от себя. Щит отвечает атакующему
на 80% этого урона с внутренним КД 0.75 сек. У Эмира предметный урон не
превращается в мгновенное добивание героя выше порога. Даедалус не критует скиллы;
прибавка предметов к обычной атаке не умножает урон всех заклинаний.

Три ветки скиллов имеют по 20 рангов: мощь от 160 G, мастерство от 220 G,
талант от 280 G. Цена следующего ранга растёт ×1.35; у Эмира цены ×3.
Мощь даёт +18% урона магии, мастерство сокращает базовый КД на 4.5% за ранг
(минимум 40%) и стоимость основной магии на 1.5% (максимум 30%). Таланты
разные для каждого героя. Старые купленные характеристики сохраняются.

Боты используют обычные награды и покупают предметы и улучшения за золото.
Под лавкой есть рекомендация следующей покупки. В проверенных сценариях
с этой стратегией первый предмет покупался на 8-й волне, все четыре — на 15-й.
Только качать скиллы и откладывать защитные предметы опасно при пяти жизнях.

## Пять жизней и прогресс

Первое появление входит в пять жизней: первые четыре смерти возвращают героя
через 8 сек, пятая оставляет наблюдателем до нового забега. После возрождения
2.5 сек защиты от урона и контроля. Волны, уровни, предметы и переподключение
не возвращают потраченные жизни. У выбывшего героя сохраняются предметы и статистика.

Когда все пятеро исчерпали жизни, бой останавливается. В соло доступен «Новый
забег», в сетевой комнате его запускает только ведущий. Комната, код, места
и сессии игроков сохраняются; уровни, золото, предметы и жизни начинают заново.
Сохранение старой версии получает пять новых жизней; дальнейшие сохранения
запоминают остаток. Предметы и их перезарядки тоже сохраняются.

Каждая волна содержит больше крипов, чем предыдущая. Они усиливаются и
появляются чаще, но одновременно на арене максимум 20; остальные ждут очереди.
Между волнами 4 секунды на покупки, возвращение в лагерь и восстановление
20% HP/MP. Каждые три волны — бой против пяти случайных героев из 12.
Перед ним оставшиеся в игре герои получают полное HP/MP, запас жизней прежний.
Здоровье врагов зависит от волны, а не от покупок и текущего урона отряда.

После крипов 30-й волны появляется Рошан: 240 000 HP, 35% защиты, регенерация,
Bash, Thunder Clap и ярость при 35% HP. На бой 180 сек. При поражении −10%
непотраченного золота и повтор через 5 сек с прежним запасом жизней.
Победа даёт каждому 1500 G и 1800 базового XP, убийце ещё 500 G.
Дальше идут 31-я волна и бесконечный режим с плавным усилением врагов.

## Проверка баланса и разработка

[Отчёт по 19 сценариям](balance/REPORT.md) содержит стадии 1–90, цены,
число жизней, время боёв и ограничения моделей управления.
[Подробные результаты](balance/report.json) содержат покупки, смерти и статистику.
Это детерминированные симуляции, а не гарантия результата для реальных игроков.

```sh
npm test
npm run balance -- --waves=60 --seeds=1,5,17 --mode=casual
npm run balance:audit
npm run package
```

`dist/engine.js` — общие правила соло и сервера, `game.js` — управление и Canvas,
`effects.js` — локальные эффекты, `netcode.js` — компактные снимки и интерполяция.
Сервер авторитетно проверяет деньги, предметы, жизни, права ведущего и порядок
команд; повторные команды не применяются. WebSocket передаёт 20 обновлений/сек.
Урон в статистике считается после защиты и без оверкилла; K/D/A относится к
героям, ЛХ к крипам. Ассист — урон или Eul за 12 сек до убийства героя.

Свободные герои управляются ботами. Через 15 сек без связи игрока подменяет
бот, место резервируется на 90 сек. Выбывший герой остаётся выбывшим и у бота.
Комнаты хранятся в памяти до остановки сервера или часа без обращений.
Одиночный прогресс хранится в браузере; соло и сетевой прогресс раздельные.

Панель ведущего видит только создатель комнаты. Он может менять и перемешивать
скиллы, включать большие головы, оглушение, ускорение и золотой дождь.
Даже чужой скилл не позволяет Эмиру добивать крипов.

Сборка создаёт одиночный HTML, `oscar-farm-local.zip` и `oscar-farm-multiplayer.zip`
рядом с проектом и копии в `downloads/`. Архив сервера содержит необходимые
исходники и WebSocket, без секретов, Git-истории и скачанного cloudflared.

Неофициальная фан-игра; числа и механики адаптированы к этому режиму.
Dota 2 и персонажи принадлежат Valve.

## New modes: Pudge Wars and Custom Hero Chaos

The home page now has three mode cards. The original **СИДИ КАЧАЙСЯ** campaign is
still available. Select the mode **before** creating a multiplayer room.

1. Run `npm run online` and wait for the terminal to confirm that the external
   link is ready. Open the printed localhost address on the hosting computer.
2. Choose **Pudge Wars** or **Custom Hero Chaos** on the home page.
3. Set your name and seat. A host may play a hero or use the observer seat.
   Pudge score targets (25/50/75/100) are set before room creation.
4. Click **Создать комнату в этом режиме**, then **Скопировать приглашение**.
5. Friends open the invite and take a free seat. They need only a browser.
   Chaos players choose their hero and first spell before the host starts.
6. The host clicks **Начать матч**. Empty seats use bots. The host can switch to
   an unoccupied seat using the seat selector, including after the match starts.

Invites point to `/arcade.html#room=CODE`. The server resolves and locks the
room's mode. An incorrect `?mode=` query cannot override it. Guest UI has no mode
selector, room creation, or start button. Start/restart and seat possession are
also checked on the server. Reconnecting uses the same session, hero, draft and
progress. A host restart after victory retains names and seat reservations but
starts a fresh match in the same mode.

For offline play, open `../СИДИ-КАЧАЙСЯ.html` or the copy in `downloads/`.
All three games, sprites, spell icons and rules are embedded in that one file.
No installation, fonts, CDN, or network is required. Local progress is saved
separately for each mode. Opening another mode pauses the original local farm.
Mid-wave saves replay the unfinished wave with lives and purchases preserved.
Reloading during a duel refunds unresolved stakes and restarts its countdown.

### Pudge Wars

- Ten seats, five Radiant versus five Dire, plus an optional observer host.
- Uncrossable river; straight outgoing hooks catch the first body or rune and
  physically return. Enemy hits damage and pull; allied hooks rescue without
  damage. A hooked player may land on the opposite bank.
- Four hook upgrade branches (damage/range/speed/width), gold, experience,
  item shop, runes, four-second respawns and first-to-score victory.
- **WASD / arrows / right click:** move. **Left click / Space / Q:** hook toward
  the cursor. **B:** Hook Guard. **E:** Blink (bought items required).
- Respawns are unlimited, as in the classic team mode; the five-life rule
  applies to Chaos and the original farm campaign.

### Custom Hero Chaos

- Eight competitors, private creep arenas, five PVE lives, last survivor wins.
- Four distinct random hero options; one free reroll keeps the first hero and
  changes the other three. Each native spell has **4× the sampling weight** of
  each foreign spell. This is our explicit adaptation value, not a verified
  original-map percentage.
- **24 heroes and 111 abilities**, covering the selected heroes' main kits,
  Invoker's ten combinations, and historical/secondary Tinker/Ogre spells.
  Tinker, Ogre Magi, Terrorblade, Pudge, Shadow Fiend, Rubick, Timbersaw,
  Drow Ranger, Sniper, Crystal Maiden, Lion, Lina, Juggernaut, Phantom Assassin,
  Faceless Void, Enigma, Nature's Prophet, Lifestealer, Undying, Techies, Io,
  Magnus, Shadow Shaman, and Invoker.
- Sixteen unique skill offers, five normal slots (initial / after waves
  1, 3, 5, 8); sixth slot for 13,000 gold. Level points upgrade skills. Basic
  ranks cap at four; ultimate ranks cap at three, with rank 2/3 at levels 6/12.
- Random replacement token: 1,200 gold. Chosen replacement: 2,900. A replacement
  retains the old rank up to the new skill's rank cap. Weaker economies can
  receive a free catch-up replacement after every tenth wave.
- Duels after every two waves: 15-second preparation, full HP/MP, existing
  cooldowns retained, 50-second fight. Duels do not consume PVE lives.
  Nonparticipants may bet game gold, once, up to half their available gold.
  Winners proportionally split the pool; draws refund stakes.
- Shops include attack, magic, defense and summon options. Maelstrom upgrades
  into Mjollnir for the difference. Scepter/Shard use disclosed universal
  arena bonuses, rather than every Dota-specific upgrade interaction.
- Real interactions include Rearm, Multicast, Metamorphosis/illusions/Sunder,
  Spell Steal, channels and interrupts, damageable summons, mines, Time Walk,
  Chronosphere, Black Hole and Invoker orbs/Invoke. Tether and Infest need an
  owned summon, so awkward and support-heavy random builds are possible.
- **WASD / arrows / right click:** move. **Left click / Space:** aimed attack.
  **Q E R F G T:** learned spell slots. **Z / C:** invoked spells.
  **V:** stolen spell. **B:** BKB. **M:** Mjollnir. **P:** local pause.
  Unit-target spells require pointing at a valid unit; projectiles travel
  straight and can be dodged. Spell buttons show mana, cooldown and rank.

Both modes use authoritative 20 Hz WebSockets, compact entity deltas, motion
interpolation and display-only movement prediction. Damage, casts, bets,
upgrades, slot permissions and cooldowns remain server controlled. Internet
latency still depends on the host and route; the client cannot remove distance.
No third-party relay service or account is required beyond the existing
Cloudflare tunnel launcher.

### Research and validation

See [research/MODES.md](research/MODES.md) for source links and deliberate
adaptations. These are independent browser recreations, not full Dota-engine
ports or claims of exact current Workshop balance. Facets, all innates, the
entire Dota roster and every Aghanim-specific interaction are outside this build.

Run `npm test` for both original and arcade mechanics, complete active-spell
smoke coverage, native draft odds, netcode reconstruction, permission checks
and real 8-/10-seat WebSocket sessions. Run `npm run balance:arcade` for
reproducible campaigns and [balance/ARCADE-REPORT.md](balance/ARCADE-REPORT.md).
The audit records bot matches, not human playtesting. `npm run package`
regenerates the offline HTML and both ZIPs, including the new source files.
