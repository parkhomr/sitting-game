// Independently written, arena-scaled main kits. Shared verbatim by server/client.
export const CHAOS_HEROES=[
 {id:'tinker',name:'Tinker',color:'#e5bf62',type:'int',hp:680,mana:460,damage:39,range:530,move:225,role:'Machines · cooldown resets'},
 {id:'ogre',name:'Ogre Magi',color:'#7ab5dc',type:'str',hp:960,mana:340,damage:49,range:170,move:205,role:'Two heads · multicast'},
 {id:'terrorblade',name:'Terrorblade',color:'#7edeb3',type:'agi',hp:710,mana:360,damage:48,range:180,move:240,role:'Illusions · Metamorphosis · Sunder'},
 {id:'pudge',name:'Pudge',color:'#b7b27a',type:'str',hp:1000,mana:340,damage:47,range:170,move:205,role:'Hooks · flesh stacks'},
 {id:'sf',name:'Shadow Fiend',color:'#ef786a',type:'agi',hp:740,mana:380,damage:45,range:510,move:235,role:'Three razes · souls'},
 {id:'rubick',name:'Rubick',color:'#b4eb84',type:'int',hp:680,mana:480,damage:37,range:540,move:230,role:'Spell theft · amplification'},
 {id:'timber',name:'Timbersaw',color:'#e2b076',type:'str',hp:940,mana:380,damage:43,range:190,move:215,role:'Saws · chain · reactive armor'},
 {id:'drow',name:'Drow Ranger',color:'#a9e2f0',type:'agi',hp:720,mana:360,damage:48,range:590,move:235,role:'Frost · multishot · marksmanship'},
 {id:'sniper',name:'Sniper',color:'#e9d493',type:'agi',hp:650,mana:360,damage:43,range:680,move:225,role:'Range · shrapnel · assassination'},
 {id:'cm',name:'Crystal Maiden',color:'#a7dcf0',type:'int',hp:670,mana:500,damage:34,range:520,move:205,role:'Frost · mana aura'},
 {id:'lion',name:'Lion',color:'#c58dcc',type:'int',hp:720,mana:450,damage:38,range:500,move:225,role:'Stun · Hex · mana drain'},
 {id:'lina',name:'Lina',color:'#f7aa6b',type:'int',hp:710,mana:460,damage:42,range:550,move:235,role:'Fire lines · stun · Fiery Soul'},
 {id:'jugger',name:'Juggernaut',color:'#e7d2b0',type:'agi',hp:820,mana:330,damage:49,range:170,move:245,role:'Spin · healing ward · Omnislash'},
 {id:'pa',name:'Phantom Assassin',color:'#78b7b7',type:'agi',hp:730,mana:350,damage:53,range:170,move:250,role:'Dagger · evasion · critical hits'},
 {id:'void',name:'Faceless Void',color:'#b9a0df',type:'agi',hp:820,mana:370,damage:46,range:180,move:230,role:'Time Walk · Chronosphere'},
 {id:'enigma',name:'Enigma',color:'#9b9ee3',type:'int',hp:760,mana:460,damage:39,range:500,move:210,role:'Eidolons · Black Hole'},
 {id:'furion',name:'Nature’s Prophet',color:'#96bc79',type:'int',hp:760,mana:430,damage:42,range:540,move:230,role:'Trees · teleport · treants'},
 {id:'lifestealer',name:'Lifestealer',color:'#d8a18a',type:'str',hp:940,mana:300,damage:54,range:175,move:240,role:'Rage · Feast · Infest'},
 {id:'undying',name:'Undying',color:'#9abb80',type:'str',hp:1040,mana:380,damage:42,range:180,move:210,role:'Decay · zombies · Flesh Golem'},
 {id:'techies',name:'Techies',color:'#dcbb89',type:'int',hp:760,mana:450,damage:37,range:570,move:225,role:'Bombs · mines · Blast Off'},
 {id:'io',name:'Io',color:'#c9f1eb',type:'uni',hp:740,mana:420,damage:40,range:500,move:245,role:'Tether · spirits · support'},
 {id:'magnus',name:'Magnus',color:'#b5a5d0',type:'str',hp:980,mana:370,damage:51,range:190,move:220,role:'Empower · Skewer · Reverse Polarity'},
 {id:'shaman',name:'Shadow Shaman',color:'#d9bd82',type:'int',hp:730,mana:460,damage:40,range:500,move:220,role:'Hex · Shackles · serpent wards'},
 {id:'invoker',name:'Invoker',color:'#ebc2e5',type:'uni',hp:730,mana:480,damage:40,range:540,move:230,role:'Quas / Wex / Exort · ten invoked spells'}
];
const chcSkills=[];
function chcAdd(owner,id,name,kind,stats={},hint=''){chcSkills.push({owner,id,name,kind,mana:70,cd:10,range:650,power:90,radius:180,duration:3,ultimate:false,passive:false,maxRank:4,...stats,hint});}
function chcPassive(owner,id,name,kind,stats={},hint=''){chcAdd(owner,id,name,kind,{mana:0,cd:0,passive:true,...stats},hint);}
function chcUlt(owner,id,name,kind,stats={},hint=''){chcAdd(owner,id,name,kind,{mana:160,cd:45,ultimate:true,maxRank:3,...stats},hint);}
chcAdd('tinker','laser','Laser','beam',{power:130,mana:85,cd:9,blind:2},'Aimed pure beam; blinds physical attackers.');
chcAdd('tinker','march','March of the Machines','robots',{power:38,mana:100,cd:17,radius:240,duration:6},'An army of robots sweeps the chosen area.');
chcAdd('tinker','matrix','Defense Matrix','shield',{power:180,mana:70,cd:16,duration:10},'A damage barrier; protects the caster or an aimed friendly summon.');
chcUlt('tinker','rearm','Rearm','rearm',{mana:130,cd:12,duration:1.6},'Channel to refresh basic spells; cannot refresh itself, ultimates or BKB.');
chcAdd('tinker','missile','Heat-Seeking Missile','missile',{power:140,mana:90,cd:11},'Historical kit: an aimed rocket with an explosive impact.');
chcAdd('tinker','turret','Deploy Turrets','turret',{power:30,mana:100,cd:18,duration:14},'A mechanical turret fires at nearby enemies.');
chcAdd('ogre','fireblast','Fireblast','bolt',{power:115,stun:1,mana:75,cd:9,speed:650},'A flaming projectile that stuns on impact.');
chcAdd('ogre','ignite','Ignite','ignite',{power:28,duration:5,mana:70,cd:12,slow:3},'A burning bottle: damage over time and slow.');
chcAdd('ogre','bloodlust','Bloodlust','bloodlust',{power:.3,mana:60,cd:14,duration:9},'Attack and movement speed for the caster and nearby summons.');
chcUlt('ogre','multicast','Multicast','multicast',{mana:0,cd:0,passive:true},'Chance to repeat offensive basic spells 2–4 times without extra mana.');
chcAdd('ogre','unrefined','Unrefined Fireblast','unrefined',{power:170,mana:0,cd:14,stun:1},'Costs 35% of current mana; poor when the tank is empty.');
chcAdd('terrorblade','reflection','Reflection','reflection',{power:.25,mana:80,cd:17,radius:250,duration:5},'Hostile reflections attack their originals and slow them.');
chcAdd('terrorblade','conjure','Conjure Image','illusion',{power:.35,mana:65,cd:12,duration:15,count:1},'A controlled illusion of your hero; takes extra damage.');
chcAdd('terrorblade','metamorphosis','Metamorphosis','metamorphosis',{power:.6,mana:100,cd:35,duration:15},'Become a ranged demon with stronger attacks; illusions transform too.');
chcUlt('terrorblade','sunder','Sunder','sunder',{mana:130,cd:40,range:550},'Swap HP percentages with the aimed enemy; minimum HP and boss caps apply.');
chcAdd('pudge','hook','Meat Hook','hook',{power:155,mana:80,cd:9,range:800,speed:750},'A physical hook catches the first enemy and pulls them toward you.');
chcAdd('pudge','rot','Rot','rot',{power:30,mana:0,cd:.5,radius:180,toggle:true},'Toggle a toxic cloud: hurts enemies and yourself.');
chcPassive('pudge','flesh','Flesh Heap','flesh',{power:30},'Permanent HP stacks from real kills; temporary damage block while low.');
chcUlt('pudge','dismember','Dismember','dismember',{power:65,mana:130,cd:28,duration:2.5,range:220},'Channel on an aimed nearby enemy, draining life. Interruptible.');
for(const [id,name,d] of [['raze_near','Shadowraze · Near',200],['raze_mid','Shadowraze · Medium',450],['raze_far','Shadowraze · Far',700]])chcAdd('sf',id,name,'raze',{power:145,mana:60,cd:8,range:d,radius:145,delay:.4},'A fixed-distance explosion in the direction of the cursor.');
chcPassive('sf','necromastery','Necromastery','souls',{power:3},'Kills collect souls and increase attack damage; bounded stacks.');
chcPassive('sf','presence','Presence of the Dark Lord','armor_aura',{power:.12},'Nearby enemies lose a portion of physical armor.');
chcUlt('sf','requiem','Requiem of Souls','requiem',{power:90,mana:175,cd:45,duration:1.4,range:650},'Channel, then release real radial soul projectiles with fear.');
chcAdd('rubick','telekinesis','Telekinesis','lift',{power:60,stun:1.1,mana:75,cd:12},'Lift the aimed enemy, then slam and stun nearby enemies.');
chcAdd('rubick','fade_bolt','Fade Bolt','chain',{power:125,mana:80,cd:10,count:4},'An aimed first hit then weakening bounces.');
chcPassive('rubick','supremacy','Arcane Supremacy','spell_amp',{power:.12},'Increases magic damage and spell range, including borrowed skills.');
chcUlt('rubick','spell_steal','Spell Steal','steal',{mana:100,cd:20,duration:60},'Copy the aimed enemy’s last spell into V. No valid spell: no mana spent.');
chcAdd('timber','whirling','Whirling Death','whirling',{power:145,mana:70,cd:8,radius:210},'A spinning toothed saw around you; weakens enemy attack damage.');
chcAdd('timber','timber_chain','Timber Chain','chain_dash',{power:130,mana:60,cd:8,range:600},'Fire a chain and zip toward the cursor, cutting through enemies.');
chcPassive('timber','reactive','Reactive Armor','reactive',{power:.04},'Being hit builds armor and HP regeneration, up to 12 stacks.');
chcUlt('timber','chakram','Chakram','chakram',{power:45,mana:110,cd:18,radius:180,duration:7},'A flying saw settles into a cutting, slowing area.');
chcAdd('drow','frost','Frost Arrows','frost',{mana:0,cd:.5,toggle:true,power:.15},'Toggle: attacks spend 5 mana to add frost damage and slow.');
chcAdd('drow','gust','Gust','gust',{power:45,mana:60,cd:12,range:650,radius:80,duration:2.5},'A wide cone silences and pushes enemies away.');
chcAdd('drow','multishot','Multishot','fan',{power:65,mana:80,cd:12,count:7,pierce:2},'A piercing fan of ice arrows follows the direction you choose.');
chcUlt('drow','marksmanship','Marksmanship','marksmanship',{mana:0,cd:0,passive:true,power:.25},'A chance for armor-piercing attacks; weaker when enemies are too close.');
chcAdd('sniper','shrapnel','Shrapnel','shrapnel',{power:30,mana:70,cd:14,radius:210,duration:6},'A rain of bullets slows and damages a fixed area.');
chcPassive('sniper','headshot','Headshot','headshot',{power:70},'A chance for bonus physical damage and a short knockback.');
chcAdd('sniper','take_aim','Take Aim','take_aim',{mana:35,cd:15,duration:6,power:.25},'Passive attack range; activate for stronger Headshot and accuracy.');
chcUlt('sniper','assassinate','Assassinate','snipe',{power:330,mana:140,cd:25,range:1200,duration:.8},'Channel an aimed rifle shot; the projectile can be intercepted.');
chcAdd('cm','nova','Crystal Nova','nova',{power:120,mana:80,cd:11,radius:220,slow:3},'A blast of ice at the cursor; slows enemies.');
chcAdd('cm','frostbite','Frostbite','root',{power:40,mana:75,cd:10,duration:2.3},'Root and damage the aimed enemy; does not stop spell casts.');
chcPassive('cm','brilliance','Arcane Aura','mana_aura',{power:1.5},'Mana regeneration for you and your own summons; not every arena.');
chcUlt('cm','freezing_field','Freezing Field','freezing',{power:65,mana:180,cd:40,duration:5,radius:300},'Channel an ice storm around you; movement or stuns interrupt it.');
chcAdd('lion','earth_spike','Earth Spike','spikes',{power:110,mana:75,cd:10,stun:1.1,range:650},'A line of earth spikes; aim where enemies will move.');
chcAdd('lion','hex','Hex','hex',{mana:80,cd:14,duration:2.2,power:0},'Turn the aimed enemy into a harmless frog.');
chcAdd('lion','mana_drain','Mana Drain','mana_drain',{power:45,mana:0,cd:13,duration:3},'Channel to steal mana. Ineffective against empty-mana creeps.');
chcUlt('lion','finger','Finger of Death','finger',{power:350,mana:170,cd:35},'Aimed burst damage; real hero kills add bounded permanent damage.');
chcAdd('lina','dragon_slave','Dragon Slave','fire_wave',{power:130,mana:75,cd:9,range:800,pierce:8,radius:45},'A dragon-shaped wave of fire travels in a straight line.');
chcAdd('lina','light_strike','Light Strike Array','stun_area',{power:125,mana:80,cd:11,stun:1.2,delay:.65,radius:180},'An orange warning circle erupts into a delayed stun.');
chcPassive('lina','fiery_soul','Fiery Soul','fiery',{power:.08},'Spell casts build temporary attack/movement speed, up to 5 stacks.');
chcUlt('lina','laguna','Laguna Blade','laguna',{power:380,mana:175,cd:35},'A powerful electric strike on the aimed target.');
chcAdd('jugger','blade_fury','Blade Fury','spin',{power:55,mana:90,cd:20,duration:4,radius:200},'Move while spinning: area damage and resistance to magic/control.');
chcAdd('jugger','healing_ward','Healing Ward','healing_ward',{power:.015,mana:80,cd:20,duration:12},'A fragile ward heals nearby allies and summons. Enemies can destroy it.');
chcPassive('jugger','blade_dance','Blade Dance','crit',{power:.75,chance:.25},'25% chance for a critical ordinary attack.');
chcUlt('jugger','omnislash','Omnislash','omnislash',{power:1.1,mana:150,cd:35,count:7,range:450},'Blinking sword strikes; invulnerable during the sequence.');
chcAdd('pa','dagger','Stifling Dagger','dagger',{power:40,mana:45,cd:7,slow:2.5},'A slowing physical dagger carries attack bonuses.');
chcAdd('pa','phantom_strike','Phantom Strike','phantom_strike',{power:.6,mana:50,cd:12,duration:4},'Blink to the aimed enemy and gain attack speed.');
chcAdd('pa','blur','Blur','blur',{mana:40,cd:18,duration:5,power:.15},'Passive evasion; activate to fade, especially strong against ranged attacks.');
chcUlt('pa','coup','Coup de Grace','crit',{mana:0,cd:0,passive:true,power:1.4,chance:.18},'18% chance for a large critical ordinary attack.');
chcAdd('void','time_walk','Time Walk','time_walk',{mana:60,cd:13,range:550,duration:2},'Blink and undo the actual damage taken over the last 2 seconds.');
chcAdd('void','dilation','Time Dilation','dilation',{power:.2,mana:75,cd:15,radius:280,duration:4},'Slow nearby enemies and extend their running spell cooldowns.');
chcPassive('void','time_lock','Time Lock','bash',{power:55,chance:.2},'A bonus time hit and brief stun, with an internal cooldown.');
chcUlt('void','chrono','Chronosphere','chrono',{mana:190,cd:50,radius:250,duration:4,delay:.45},'A delayed sphere freezes everyone inside except its owner’s units.');
chcAdd('enigma','malefice','Malefice','malefice',{power:45,mana:80,cd:12,duration:4,stun:.35},'Three pulses of damage and short stuns on the aimed enemy.');
chcAdd('enigma','eidolons','Demonic Conversion','eidolons',{power:.3,mana:85,cd:18,count:2,duration:18},'Eidolons can split after six attacks, subject to the summon cap.');
chcAdd('enigma','midnight','Midnight Pulse','midnight',{power:.016,mana:95,cd:17,radius:230,duration:6},'Percentage-HP magic damage in an area; capped against bosses.');
chcUlt('enigma','black_hole','Black Hole','black_hole',{power:70,mana:200,cd:50,radius:250,duration:3.5,range:550},'An interruptible channel pulls and traps enemies at the cursor.');
chcAdd('furion','sprout','Sprout','sprout',{power:25,mana:65,cd:12,radius:125,duration:3},'A tree ring roots enemies and deals modest damage.');
chcAdd('furion','teleport','Teleportation','teleport',{mana:55,cd:18,duration:.7,range:1600},'Channel to reposition within your current arena; does not clear waves by itself.');
chcAdd('furion','treants','Nature’s Call','treants',{power:.35,mana:85,cd:18,count:3,duration:18},'Three treants fight for you.');
chcUlt('furion','wrath','Wrath of Nature','wrath',{power:120,mana:150,cd:30,count:10},'A growing burst bounces through enemies in your arena.');
chcAdd('lifestealer','rage','Rage','rage',{mana:65,cd:19,duration:4,power:.25},'Attack speed, control immunity and strong magic resistance.');
chcPassive('lifestealer','feast','Feast','feast',{power:.01},'Attacks steal a bounded portion of target max HP and heal you.');
chcAdd('lifestealer','open_wounds','Open Wounds','wounds',{power:.15,mana:65,cd:13,duration:5},'Slow the aimed enemy; damage to it heals the attacker.');
chcUlt('lifestealer','infest','Infest','infest',{power:190,mana:130,cd:32,duration:2.5,radius:220},'Hide inside your own summon, heal, then burst out. Requires a host.');
chcAdd('undying','decay','Decay','decay',{power:75,mana:65,cd:8,radius:220,duration:10},'Steal temporary strength from enemies in an area; HP steals are capped.');
chcAdd('undying','soul_rip','Soul Rip','soul_rip',{power:20,mana:70,cd:10},'Damage an aimed enemy or heal yourself; scales with nearby units.');
chcAdd('undying','tombstone','Tombstone','tombstone',{mana:110,cd:24,duration:14,power:.2},'A destructible tomb spawns pursuing zombies; bounded population.');
chcUlt('undying','golem','Flesh Golem','golem',{mana:150,cd:35,duration:14,power:.35},'Grow larger: bonus HP, slowing attacks and damage amplification.');
chcAdd('techies','sticky','Sticky Bomb','sticky',{power:130,mana:65,cd:9,delay:1,radius:190},'An aimed bomb lands, slows and explodes after a warning.');
chcAdd('techies','tazer','Reactive Tazer','tazer',{power:75,mana:60,cd:17,duration:5,radius:220},'A defensive charge disarms attackers and explodes when it ends.');
chcAdd('techies','blast_off','Blast Off!','blast_off',{power:190,mana:85,cd:17,range:550,radius:220,silence:2.5},'Leap and explode, spending some HP; self damage cannot kill you.');
chcUlt('techies','mines','Proximity Mines','mines',{power:240,mana:100,cd:12,duration:30,radius:190},'Place a mine: arms after 1.5 seconds, detonates on enemies; max 4.');
chcAdd('io','tether','Tether','tether',{mana:40,cd:12,duration:12,power:.15},'Link to an aimed friendly summon: share healing and movement. Situational alone.');
chcAdd('io','spirits','Spirits','spirits',{power:70,mana:80,cd:16,duration:8,count:5,radius:220},'Five orbiting spirits explode on contact.');
chcAdd('io','overcharge','Overcharge','overcharge',{power:.35,mana:60,cd:15,duration:7},'Attack speed and regeneration; also buffs your tethered ally.');
chcUlt('io','relocate','Relocate','relocate',{mana:100,cd:30,duration:5,range:1200},'Teleport within the arena and return; bring your tethered summon.');
chcAdd('magnus','shockwave','Shockwave','shockwave',{power:120,mana:70,cd:10,range:800,pierce:8,radius:45},'A straight shockwave slows and drags enemies a short distance.');
chcAdd('magnus','empower','Empower','empower',{power:.22,mana:60,cd:13,duration:10},'Bonus attack damage and cleave for you and your summons.');
chcAdd('magnus','skewer','Skewer','skewer',{power:110,mana:70,cd:13,range:550},'Charge toward the cursor, carrying enemies hit along the path.');
chcUlt('magnus','rp','Reverse Polarity','rp',{power:170,mana:160,cd:40,radius:300,stun:2},'Pull enemies to you and stun them.');
chcAdd('shaman','ether','Ether Shock','ether',{power:115,mana:75,cd:10,count:5},'An aimed target and a cone of nearby enemies receive lightning damage.');
chcAdd('shaman','shaman_hex','Hex · Shaman','hex',{mana:75,cd:14,duration:2.2,power:0},'Transform the aimed target; poor as your only farming skill.');
chcAdd('shaman','shackles','Shackles','shackles',{power:55,mana:85,cd:15,duration:2.5},'Channel to bind and drain a single aimed enemy.');
chcUlt('shaman','wards','Mass Serpent Ward','wards',{power:28,mana:160,cd:35,count:5,duration:12},'Five destructible wards attack nearby targets.');
for(const [id,name,kind,hint] of [['quas','Quas','quas','Regen orb. Three active orbs contribute to Invoke.'],['wex','Wex','wex','Speed orb. Three active orbs contribute to Invoke.'],['exort','Exort','exort','Damage orb. Three active orbs contribute to Invoke.']])chcAdd('invoker',id,name,kind,{mana:0,cd:.2,power:1},hint);
chcUlt('invoker','invoke','Invoke','invoke',{mana:40,cd:8},'Your last three learned orb casts invoke a spell into Z/C. Requires those orbs.');
chcAdd('invoker','cold_snap','Cold Snap','cold_snap',{power:25,mana:70,cd:15,duration:5},'Damage triggers brief freezes, with an internal cooldown.');
chcAdd('invoker','ghost_walk','Ghost Walk','ghost_walk',{mana:65,cd:22,duration:6,power:.2},'Fade and gain movement speed; attacking ends the fade.');
chcAdd('invoker','ice_wall','Ice Wall','ice_wall',{power:30,mana:80,cd:18,radius:250,duration:7},'A fixed wall of ice slows and damages enemies.');
chcAdd('invoker','emp','EMP','emp',{power:150,mana:75,cd:17,radius:230,delay:1.8},'A delayed pulse burns mana; damage is based on mana actually removed.');
chcAdd('invoker','tornado','Tornado','tornado',{power:100,mana:85,cd:16,range:850,stun:1.2,pierce:8,radius:45},'A travelling tornado lifts enemies along its path.');
chcAdd('invoker','alacrity','Alacrity','alacrity',{mana:70,cd:14,duration:8,power:.35},'Attack speed and physical damage, useful on any body.');
chcAdd('invoker','sun_strike','Sun Strike','sun_strike',{power:260,mana:100,cd:18,range:1600,radius:150,delay:1.5},'A delayed pure strike at the cursor. Enemies can leave the warning.');
chcAdd('invoker','forge','Forge Spirit','forge',{power:.4,mana:80,cd:18,count:2,duration:18},'Two fiery summons reduce armor as they attack.');
chcAdd('invoker','meteor','Chaos Meteor','meteor',{power:55,mana:120,cd:22,radius:200,duration:6},'A rolling meteor burns enemies in its path.');
chcAdd('invoker','deafening','Deafening Blast','deafening',{power:140,mana:110,cd:19,range:750,pierce:8,radius:65,duration:2},'A wide travelling blast knocks back and disarms enemies.');
export const CHAOS_ABILITIES=chcSkills;
export const CHAOS_SKILL_BY_ID=Object.fromEntries(CHAOS_ABILITIES.map(s=>[s.id,s]));
export const CHAOS_HERO_BY_ID=Object.fromEntries(CHAOS_HEROES.map(h=>[h.id,h]));
export const CHAOS_NATIVE_WEIGHT=4;
export const CHAOS_INVOKES={qqq:'cold_snap',qqw:'ghost_walk',eqq:'ice_wall',www:'emp',qww:'tornado',eww:'alacrity',eee:'sun_strike',eeq:'forge',eew:'meteor',eqw:'deafening'};
export const ARCADE_ITEMS=[
 {id:'boots',name:'Power Treads',cost:650,hint:'+16% attack speed, +12% movement.',kind:'passive'},
 {id:'maelstrom',name:'Maelstrom',cost:1700,hint:'+16% attack damage; 25% chain lightning on hits.',kind:'passive'},
 {id:'bkb',name:'Black King Bar',cost:2200,hint:'+250 HP. B: 5s control immunity and 70% magic resistance; 35s cooldown.',kind:'active'},
 {id:'heart',name:'Heart of Tarrasque',cost:2800,hint:'+650 HP, +10% base HP and increased regeneration.',kind:'passive'},
 {id:'daedalus',name:'Daedalus',cost:2600,hint:'+30% physical attack; 25% chance for ×2 critical hits.',kind:'passive'},
 {id:'mjollnir',name:'Mjollnir',cost:2900,hint:'+30% attack speed, +20% damage; stronger chain lightning. M: static shield.',kind:'active'},
 {id:'octarine',name:'Octarine Core',cost:2400,hint:'+250 mana, +2 mana/sec, −20% spell cooldown, 10% spell lifesteal.',kind:'passive'},
 {id:'bloodstone',name:'Bloodstone',cost:2300,hint:'+200 HP, +200 mana, +18% magic damage and 12% spell lifesteal.',kind:'passive'},
 {id:'assault',name:'Assault Cuirass',cost:2400,hint:'+20% attack speed, physical armor and stronger summons.',kind:'passive'},
 {id:'scepter',name:'Aghanim’s Scepter',cost:3200,hint:'+15% spell power, +150 HP/mana. Each owned spell gains one effective rank.',kind:'passive'},
 {id:'shard',name:'Aghanim’s Shard',cost:1400,hint:'+12% spell power and +12% summon damage; an arena-scaled universal upgrade.',kind:'passive'},
 {id:'random_token',name:'Random Skill Token',cost:1200,hint:'Replace a random learned skill with a fresh 16-skill offer.',kind:'token'},
 {id:'chosen_token',name:'Chosen Skill Token',cost:2900,hint:'Choose which skill to replace. New choice keeps its earned ranks.',kind:'token'},
 {id:'sixth_slot',name:'Sixth Ability Slot',cost:13000,hint:'Unlock one additional draft slot; maximum six learned skills.',kind:'token'}
];
export const PUDGE_UPGRADES=[
 {id:'hookDamage',name:'Hook damage',base:100,step:32,max:10,hint:'+32 damage per rank'},
 {id:'hookRange',name:'Hook distance',base:100,step:70,max:10,hint:'+70 travel distance per rank'},
 {id:'hookSpeed',name:'Hook speed',base:100,step:65,max:10,hint:'+65 projectile speed per rank'},
 {id:'hookRadius',name:'Hook radius',base:100,step:3,max:10,hint:'+3 hook collision radius per rank'}
];
