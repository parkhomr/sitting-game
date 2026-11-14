Hero attack sounds — optional drop-in slot
==========================================

The game ships with built-in original synth sounds for every hero's basic
attack. You can optionally replace a hero's sound with your own audio file:
drop a file named after the hero id into this folder and it is used instead
whenever the game is served by server.mjs / npm run online:

  drow.mp3    timber.mp3    sf.mp3      rubick.mp3    sniper.mp3
  cm.mp3      jugger.mp3    mars.mp3    witch.mp3     magnus.mp3

.mp3, .ogg and .wav are accepted (mp3 preferred). If a hero has no file here,
the built-in synth plays for that hero. No restart is needed — the client
fetches these on first user input.

These audio files are NOT part of the repository or the distributed zips.
Only use audio you have the right to use. For example, sounds extracted from
your own copy of Dota 2 are Valve's copyrighted material: keep them for your
personal use, do not commit or redistribute them.
