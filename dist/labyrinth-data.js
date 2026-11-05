export const LAB_WIDTH=2400,LAB_HEIGHT=1500,PORTAL_DURATION=1.3,SPAWN_GRACE=.8;
// Labyrinth mode data. Values are initial tuning targets, not live Dota patch data.
export const HEROES = [
 {id:'drow',name:'Drow Ranger',hp:720,mana:360,attack:48,armor:3,speed:235,range:590,color:'#94dbf4',skills:['Frost Arrows','Gust','Multishot','Marksmanship']},
 {id:'timber',name:'Timbersaw',hp:940,mana:380,attack:43,armor:5,speed:215,range:190,color:'#d9ab6b',skills:['Whirling Death','Timber Chain','Reactive Armor','Chakram']},
 {id:'sf',name:'Shadow Fiend',hp:740,mana:380,attack:45,armor:2,speed:235,range:510,color:'#e0665e',skills:['Shadowraze','Necromastery','Presence','Requiem']},
 {id:'rubick',name:'Rubick',hp:680,mana:480,attack:37,armor:2,speed:230,range:540,color:'#a0e864',skills:['Fade Bolt','Telekinesis','Arcane Supremacy','Spell Steal']},
 {id:'sniper',name:'Sniper',hp:650,mana:360,attack:43,armor:2,speed:225,range:680,color:'#ecd478',skills:['Shrapnel','Headshot','Take Aim','Assassinate']},
 {id:'cm',name:'Crystal Maiden',hp:670,mana:500,attack:34,armor:2,speed:215,range:520,color:'#9fcfff',skills:['Crystal Nova','Frostbite','Arcane Aura','Freezing Field']},
 {id:'jugger',name:'Juggernaut',hp:820,mana:330,attack:49,armor:4,speed:245,range:170,color:'#f0bf8e',skills:['Blade Fury','Healing Ward','Blade Dance','Omnislash']},
 {id:'mars',name:'Mars',hp:1000,mana:340,attack:48,armor:6,speed:220,range:180,color:'#f07d64',skills:['Spear of Mars','God’s Rebuke','Bulwark','Arena of Blood']},
 {id:'witch',name:'Witch Doctor',hp:700,mana:460,attack:38,armor:2,speed:225,range:520,color:'#c98de3',skills:['Paralyzing Cask','Voodoo Restoration','Maledict','Death Ward']},
 {id:'magnus',name:'Magnus',hp:980,mana:370,attack:51,armor:5,speed:220,range:190,color:'#b7a3dc',skills:['Shockwave','Empower','Skewer','Reverse Polarity']}
];
export const SKILLS={
 drow:[{mana:45,cd:9},{mana:70,cd:14},{mana:90,cd:16},{mana:125,cd:45}],
 timber:[{mana:60,cd:8},{mana:70,cd:13},{passive:true},{mana:130,cd:35}],
 sf:[{mana:65,cd:7},{passive:true},{passive:true},{mana:150,cd:50}],
 rubick:[{mana:80,cd:10},{mana:90,cd:16},{passive:true},{mana:100,cd:35}],
 sniper:[{mana:75,cd:16},{passive:true},{mana:50,cd:18},{mana:140,cd:40}],
 cm:[{mana:90,cd:10},{mana:80,cd:14},{passive:true},{mana:150,cd:50}],
 jugger:[{mana:90,cd:18},{mana:80,cd:25},{passive:true},{mana:150,cd:55}],
 mars:[{mana:80,cd:13},{mana:75,cd:12},{passive:true},{mana:150,cd:55}],
 witch:[{mana:80,cd:14},{mana:100,cd:20},{mana:100,cd:20},{mana:150,cd:55}],
 magnus:[{mana:75,cd:10},{mana:70,cd:16},{mana:80,cd:17},{mana:150,cd:55}]
};
// Values below describe this prototype, not official Dota numbers.
// Power-scaled effects use basic multipliers 0.85/1.1/1.35/1.6 or ultimate 0.9/1.25/1.6.
export const SKILL_RANK_DETAILS={
 drow:['Frost bonus: base 18 magic damage per shot × basic rank power.','Gust: base 90 magic damage × basic rank power.','Multishot: base 45 physical damage per arrow × basic rank power.','Marksmanship: base 100 bonus damage × ultimate rank power.'],
 timber:['Whirling Death: base 120 pure damage × basic rank power.','Timber Chain: base 100 magic damage × basic rank power.','Reactive Armor: maximum 2 / 4 / 6 / 8 stacks; each gives 0.5 armor and 1 HP/sec.','Chakram: base 80 initial and 70 per tick × ultimate rank power.'],
 sf:['Shadowraze: base 150 magic damage × basic rank power.','Necromastery: up to 5 / 10 / 15 / 20 souls; each adds 2 attack damage.','Presence: reduces nearby enemy armor by 1 / 1.5 / 2 / 2.5.','Requiem: base 130 magic damage per wave × ultimate rank power.'],
 rubick:['Fade Bolt: base 120 magic damage × basic rank power; later targets receive less.','Telekinesis: base 110 magic damage × basic rank power.','Arcane Supremacy: 3 / 6 / 9 / 12% spell power and 3.75 / 7.5 / 11.25 / 15% aimed spell range.','Spell Steal: copied ability damage uses ultimate rank power.'],
 sniper:['Shrapnel: base 35 magic damage per tick × basic rank power.','Headshot: base 75 physical damage every fourth attack × basic rank power.','Take Aim: +55 / 110 / 165 / 220 attack range and 5 / 10 / 15 / 20% attack speed.','Assassinate: base 430 magic damage × ultimate rank power.'],
 cm:['Crystal Nova: base 130 magic damage × basic rank power.','Frostbite: base 125 magic damage × basic rank power.','Arcane Aura: +0.4 / 0.8 / 1.2 / 1.6 party mana per second; Crystal Maiden gets an additional 0.25 per rank.','Freezing Field: base 90 magic damage per tick × ultimate rank power.'],
 jugger:['Blade Fury: base 75 magic damage per second × basic rank power.','Healing Ward: base 30 healing per tick × basic rank power.','Blade Dance: base 75 physical damage every fourth attack × basic rank power.','Omnislash: base 85 physical damage per strike × ultimate rank power.'],
 mars:['Spear: base 175 physical damage × basic rank power.','God’s Rebuke: base 170 physical damage × basic rank power.','Bulwark: reduces frontal physical damage by 10 / 14 / 18 / 22%.','Arena: base 120 magic damage per boundary tick × ultimate rank power.'],
 witch:['Cask: base 80 magic damage per target × basic rank power.','Voodoo Restoration: base 35 healing per second × basic rank power.','Maledict: base 40 initial damage and 350 delayed-damage cap × basic rank power.','Death Ward: base 190 physical damage per tick × ultimate rank power.'],
 magnus:['Shockwave: base 140 magic damage × basic rank power.','Empower: 6.25 / 12.5 / 18.75 / 25% attack bonus and cleave.','Skewer: base 135 physical damage × basic rank power.','Reverse Polarity: base 180 magic damage × ultimate rank power.']
};
export const ENEMIES={
 courier:{name:'Golden Courier',hp:150,attack:0,interval:999,speed:180,range:0,color:'#f0cc66'},
 scout:{name:'Kobold Scout',hp:220,attack:25,interval:1.2,speed:240,range:45,color:'#b98f68'}, satyr:{name:'Satyr Banisher',hp:320,attack:30,interval:1.5,speed:175,range:500,magic:true,color:'#b76591'},
 hellbear:{name:'Hellbear Smasher',hp:650,attack:45,interval:1.5,speed:150,range:50,armor:3,color:'#c17a54'}, archer:{name:'Skeleton Archer',hp:250,attack:35,interval:1.4,speed:170,range:600,color:'#e3ddc2'},
 warrior:{name:'Skeleton Warrior',hp:380,attack:32,interval:1.2,speed:190,range:50,armor:2,color:'#d5ccb4'}, ward:{name:'Venom Ward',hp:240,attack:24,interval:1.2,speed:0,range:450,magic:true,color:'#92c451'},
 ghost:{name:'Ghost',hp:300,attack:28,interval:1.3,speed:210,range:50,magic:true,color:'#a7e2e5'}, ogre:{name:'Ogre Bruiser',hp:800,attack:55,interval:1.7,speed:140,range:50,armor:4,color:'#a18cd5'},
 adept:{name:'Dark Seer Adept',hp:420,attack:28,interval:1.4,speed:175,range:500,magic:true,color:'#c19bf4'}, pudge:{name:'Pudge Abomination',hp:900,attack:50,interval:1.6,speed:145,range:55,armor:3,color:'#c3a57a'},
 construct:{name:'Arcane Construct',hp:550,attack:40,interval:1.5,speed:150,range:500,magic:true,resist:.25,color:'#80bbff'}, mimic:{name:'Labyrinth Mimic',hp:480,attack:45,interval:1.4,speed:200,range:50,color:'#c2a454'}
};
export const ROOMS=[
 {name:'Kobold Warrens',groups:[['scout',8],['satyr',2]]},{name:'The Bone Yard',groups:[['warrior',6],['archer',5]]},
 {name:'Venom Garden',groups:[['ward',6],['scout',4],['hellbear',2]]},{name:'Haunted Gallery',groups:[['ghost',6],['archer',4]]},
 {name:'Ogre Kitchen',groups:[['ogre',4],['satyr',4]]},{name:'The Red Butchery',groups:[['pudge',3],['warrior',5]]},
 {name:'Arcane Workshop',groups:[['construct',4],['adept',4]]},{name:'Hall of False Treasure',groups:[['mimic',3],['ghost',5],['satyr',2]]},
 {name:'Thunder Pit',groups:[['hellbear',5],['scout',4]]},{name:'The Iron Gauntlet',groups:[['ogre',3],['construct',4],['warrior',4]]},
 {name:'Elite Menagerie',elite:'hellbear',groups:[['satyr',3],['scout',4]]},{name:'Elite Butchery',elite:'pudge',groups:[['warrior',4],['ghost',2]]},
 {name:'Elite Workshop',elite:'construct',groups:[['adept',3],['archer',3]]},{name:'Elite Ossuary',elite:'ogre',groups:[['warrior',5],['archer',3]]}
];
export const ELITES=['Armored','Arcane','Swift','Vampiric','Explosive','Summoner','Shielded','Avenger'];
// Prototype adaptations; these are not official Dota rules.
export const ELITE_DETAILS={Armored:'+8 armor',Arcane:'+35% magic resistance',Swift:'+25% movement and attack speed',Vampiric:'Heals for 20% of HP damage dealt',Explosive:'On death: 1.2s warning, then a 180-radius blast',Summoner:'Summons a scout on skill use, up to 20 enemies',Shielded:'On skill use: shield equal to 15% max HP for 4s; refreshes, does not stack',Avenger:'Nearby enemy deaths (500 radius) add 10% basic attack damage, up to 5 stacks'};
export const SHARDS=[
 {id:'spell',name:'Spell Power',desc:'+12% spell damage'}, {id:'attack',name:'Deadly Aim',desc:'+15% basic attack damage'}, {id:'speed',name:'Quick Hands',desc:'+15% attack speed'},
 {id:'mana_cost',name:'Arcane Efficiency',desc:'−12% mana cost'}, {id:'cooldown',name:'Quickening',desc:'−10% ability cooldown'}, {id:'hp',name:'Vitality',desc:'+180 HP'},
 {id:'mana',name:'Mana Reservoir',desc:'+120 mana'}, {id:'move',name:'Fleet Feet',desc:'+8% movement speed'}, {id:'armor',name:'Stone Skin',desc:'+3 armor'},
 {id:'resist',name:'Magic Ward',desc:'+10% magic resistance'}, {id:'regen',name:'Restoration',desc:'+3 HP/sec and +1 mana/sec'}, {id:'reach',name:'Reach',desc:'+12% aimed cast and ranged projectile range; combined bonus capped at 35% (not melee attacks)'},
 {id:'healing',name:'Battle Medic',desc:'+20% source-applied healing and shields per shard (not regeneration or potions)'}, {id:'last',name:'Last Stand',desc:'Once per room: 180 base shield below 30% HP',unique:true},
 {id:'execution',name:'Execution',desc:'+12% damage to enemies below 30% HP'}, {id:'giant',name:'Giant Slayer',desc:'+10% damage to elites and bosses'}
];
// Hero legendaries have implemented effects; both boss choices are unique.
export const LEGENDARY={
 drow:[['Glacial Volley','Multishot slows; +15 magic per arrow'],['Silencing Gale','Gust is wider and silences longer'],['Ranger’s Precision','Marksmanship triggers every second attack'],['Winter’s Embrace','Frost Arrows shields a nearby ally']],
 timber:[['Twin Saws','Chakram creates a second saw'],['Steel Momentum','Timber Chain cooldown −4 sec'],['Living Armor','Reactive Armor maximum stacks +4'],['Whirling Harvest','Whirling Death heals per enemy hit']],
 sf:[['Triple Raze','Three Shadowraze explosions'],['Soul Furnace','Maximum souls +10 and spell power'],['Dread Presence','More armor reduction and slow nearby enemies (350 radius)'],['Echoing Requiem','Requiem fires an additional wave']],
 rubick:[['Forked Bolt','Fade Bolt gains two jumps'],['Grand Lift','Telekinesis deals more damage in a larger area'],['Arcane Theft','Spell Steal grants two casts'],['Shared Supremacy','Allies gain spell power nearby']],
 sniper:[['Shrapnel Storm','Shrapnel gains a second charge'],['Perfect Shot','Assassinate pierces targets'],['Concussive Headshot','Headshot deals more damage'],['Mobile Marksman','Take Aim grants movement speed']],
 cm:[['Frozen Ground','Crystal Nova leaves a damage field'],['Chain Frostbite','Frostbite damages and roots another nearby target; bosses are slowed'],['Brilliant Aura','Arcane Aura is stronger'],['Walking Blizzard','Move slowly while channeling Freezing Field']],
 jugger:[['Blade Storm','Blade Fury is larger and longer'],['Wandering Ward','Healing Ward follows and heals more'],['Flurry','Blade Dance triggers every third attack'],['Long Omnislash','Omnislash gains three strikes']],
 mars:[['Twin Spears','Spear fires two projectiles'],['Shield Wall','Bulwark reduces frontal magic damage'],['Unbreakable Arena','Arena lasts longer and protects allies'],['Rebuke Recovery','God’s Rebuke heals per enemy hit']],
 witch:[['Bouncing Madness','Cask gains three jumps'],['Restorative Ritual','Voodoo Restoration gives magic resistance'],['Deep Curse','Maledict delayed damage is stronger'],['Mobile Ward','Move slowly while channeling Death Ward']],
 magnus:[['Double Wave','Shockwave returns'],['Battle Horn','Empower affects nearby allies'],['Skewer Mastery','Skewer moves farther and has shorter cooldown'],['Polar Collapse','Reverse Polarity is larger and stronger']]
};
export const ITEMS=[
 {id:'boots',name:'Boots of Speed',cost:350,desc:'+12% movement'}, {id:'bracer',name:'Bracer',cost:500,desc:'+180 HP, +2 HP/sec'}, {id:'null',name:'Null Talisman',cost:500,desc:'+100 mana, +6% spell damage'},
 {id:'wraith',name:'Wraith Band',cost:500,desc:'+12 attack, +10% attack speed'}, {id:'blade',name:'Blade Mail',cost:900,desc:'+3 armor; reflect damage'}, {id:'blink',name:'Blink Dagger',cost:1000,desc:'Blink to cursor'},
 {id:'force',name:'Force Staff',cost:1100,desc:'Push toward cursor'}, {id:'mek',name:'Mekansm',cost:1400,desc:'+150 HP; heal nearby allies'}, {id:'maelstrom',name:'Maelstrom',cost:1500,desc:'+15 attack; chain lightning'},
 {id:'bkb',name:'Black King Bar',cost:1800,desc:'+200 HP; resist magic and control'}, {id:'lens',name:'Aether Lens',cost:1600,desc:'+200 mana, +15% aimed cast and ranged projectile range; combined bonus capped at 35%'}, {id:'daedalus',name:'Daedalus',cost:2000,desc:'+30 attack; every fourth hit stronger'},
 {id:'heart',name:'Heart of Tarrasque',cost:2200,desc:'+500 HP and regeneration'}, {id:'octarine',name:'Octarine Core',cost:2200,desc:'+150 mana, spell power, cooldown reduction'}, {id:'shiva',name:'Shiva’s Guard',cost:2000,desc:'+6 armor; damaging slowing pulse'},
 {id:'healing',name:'Healing Potion',cost:100,consumable:true,desc:'Instantly restore 40% of maximum HP'}, {id:'mana_potion',name:'Mana Potion',cost:100,consumable:true,desc:'Instantly restore 40% of maximum mana'}, {id:'clarity',name:'Clarity Flask',cost:200,consumable:true,desc:'Restore 120 HP and 100 mana'}
];
export const SCHEDULE=['combat','shard','choice','eliteShard','boss','shop','combat','choiceShard','elite','choiceShard','shop','boss','event','shard','elite','choiceShard','shop','final'];
export const BOSS={5:{name:'Primal Beast',hp:5000,armor:5,resist:.2,attack:85},12:{name:'Arcane Warden',hp:11000,armor:7,resist:.25,attack:100},18:{name:'Aghanim, Apex Mage',hp:20000,armor:10,resist:.3,attack:120}};
export const TRAPS=[{name:'Spike Corridor',reward:'200 gold',pattern:'spikes'},{name:'Laser Maze',reward:'250 gold',pattern:'laser'},{name:'Falling Ceiling',reward:'item token',pattern:'rocks'},{name:'Poison Crossing',reward:'200 gold + healing',pattern:'poison'}];
export const SKILL_DETAILS={
 drow:['Empower 5 attacks: bonus frost damage and slow.','Aimed burst damages and slows enemies.','Three waves of three physical arrows.','Eight seconds of attack speed and periodic bonus damage.'],
 timber:['Pure damage around you.','Move toward the cursor and damage enemies at the end.','Taking hits grants stacking armor and health regeneration.','A spinning saw damages enemies in an area for four seconds.'],
 sf:['Explosion in front of you.','Nearby enemy deaths grant souls and attack damage.','Nearby enemies lose armor.','Release radial waves of damaging soul projectiles.'],
 rubick:['Arcane bolt jumps between nearby enemies.','Damage and briefly disable a targeted enemy and nearby foes.','Passive spell damage and aimed spell range (combined range bonus capped at 35%).','Copy the last nearby eligible Satyr, Hellbear, Adept or Pudge ability. Press again to cast it.'],
 sniper:['Damage and slow enemies in a targeted area.','Every fourth attack deals bonus physical damage.','Temporarily increase attack range and speed.','Fire a powerful long-range projectile.'],
 cm:['Area damage and slowing frost.','Damage and root a target; bosses are slowed.','Passive party mana regeneration.','Channel a damaging snowstorm around yourself.'],
 jugger:['Spin and damage nearby enemies over time.','Create an area that heals nearby allies.','Every fourth attack deals bonus damage.','Become briefly invulnerable and strike nearby enemies.'],
 mars:['Fire a damaging spear.','Damage enemies in front of you.','Reduce frontal incoming attack damage.','Create a damaging arena boundary.'],
 witch:['Damage and briefly stun several nearby enemies.','Heal allies around you over time.','Curse enemies; delayed damage scales with damage taken.','Channel a ward that attacks the nearest enemy.'],
 magnus:['Fire a piercing shockwave.','Temporarily empower an ally or yourself.','Dash toward the cursor and damage enemies.','Damage and briefly stun enemies around you.']
};
