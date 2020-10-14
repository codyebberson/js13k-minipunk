minipunk
========

A short 3D action game for the 2020 js13kGames Competition.

The evil 404 Megacorp threatens to take over the internet.  You must stop them!

Play here: https://js13kgames.com/entries/minipunk

Controls:
WASD - move
Left click - attack
Right click - zoom
Spacebar - jump
Tip: Try zoom + attack

![screenshot-1](https://cody.ebberson.com/minipunk/screenshots/minipunk4.gif "screenshot-1")
![screenshot-2](https://cody.ebberson.com/minipunk/screenshots/minipunk5.gif "screenshot-2")
![screenshot-3](https://cody.ebberson.com/minipunk/screenshots/minipunk6.gif "screenshot-3")
![screenshot-4](https://cody.ebberson.com/minipunk/screenshots/minipunk7.gif "screenshot-4")

Tested on Chrome, Firefox, and Edge on Mac and Windows.

## Branches

`submission` branch is what was submitted for the competition

`master` branch includes post competition bug fixes

## Development

The source is all vanilla JavaScript which can be run directly by the browser.

Use a simple static HTTP server (i.e., [Python http.server](https://docs.python.org/3/library/http.server.html) or [NPM http-server](https://www.npmjs.com/package/http-server)) to serve the directory.

Open `index.html` in your browser, such as `http://localhost:8000/index.html`

## Building

Requirements:
* [wget](https://www.gnu.org/software/wget/) (to download Google Closure Compiler)
* [Java 7+](https://sdkman.io/) (to execute Google Closure Compiler)
* [Efficient-Compression-Tool](https://github.com/fhanau/Efficient-Compression-Tool)

Run:

```bash
./build.sh
```

Which does the following:
* Produces a self contained index file at `dist/index.html`
* Produces a ready-to-go zip file at `public.zip`

To test, open `dist/index.html` in your browser, such as `http://localhost:8000/dist/index.html`

## Postmortem

The project is done!  Here are some notes and reflections for any future time travellers who are looking for lessons, tips, tricks, or explanations.

### Context

This project is derived from my 2018 js13k entry, [Battlegrounds](https://github.com/codyebberson/js13k-battlegrounds), a small PUBG clone.  I wrote a [postmortem](https://github.com/codyebberson/js13k-battlegrounds#postmortem) for that project, which might be useful context for this project and this postmortem.

The biggest takeaway from 2018 was the importance of fast good impressions.  If the player is not engaged in the first minute, you're losing.  In particular:

1. Multiplayer games are hard for game jams.  Waiting in a server lobby for other internet strangers is not fun.
2. Let the player jump into fun interactions (AI, puzzles, etc) as fast as possible.

In 2019, I started an entry based on those ideas.  It was bright, cartoony, somewhat Mario-esque:

![screenshot-2019](https://cody.ebberson.com/minipunk/screenshots/u3-2018.gif "screenshot-2019")

In that project, there were three architectural changes:

1. All of the server/multiplayer code was ripped out
2. All of the texture code was ripped out, replaced with flat shading
2. The old map generator was replaced with a proper voxel engine

Unfortunately, life was busy in 2019, and I didn't have time to submit 😢

Those changes sat in a folder collecting dust for a year.

### Choosing the project

The theme of "404" + ongoing debates about internet censorship + the upcoming release of Cyberpunk 2077 = conjured ideas of a small cyberpunk themed game about an evil megacorp trying to take over the internet.

I imagined a game that was dark, gritty, with bright neon lights.

![cyberpunk-screenshot](https://cody.ebberson.com/minipunk/screenshots/cyberpunk-screenshot.jpg "cyberpunk-screenshot")
![neon-screenshot](https://cody.ebberson.com/minipunk/screenshots/neon-screenshot.jpg "neon-screenshot")

### Tools

I continue to be a [Google Closure Compiler](https://github.com/google/closure-compiler) fanboy.  Closure is showing its age and fading in popularity.  I love it though for a few reasons:

1. It produces the best minification results possible
2. It uses pure vanilla javascript, so you can run the code directly in the browser without transpiling
3. I don't have a GB node_modules folder 🤣

I use a simple bash script `build.sh` to download and run the compiler.

This year I switched from [7-Zip](https://www.7-zip.org/) to [ECT](https://github.com/fhanau/Efficient-Compression-Tool) for building the final zip file.  This was purely a pragmatic choice, as ECT produces smaller zips.

### WebGL and 3D Basics

The key 3D rendering philosophy is based on [Brandon Jones' WebGL advice](https://blog.tojicode.com/2010/08/rendering-quake-3-maps-with-webgl-tech.html): offload as much work to the GPU as possible. For each frame, there are just a handful of draw calls:

1. Render static geometry (voxels and skybox)
2. Render dynamic geometry (player, enemies, projectiles, etc)
3. Post-processing (bloom effect)

The result is decent runtime performance with low code.

3D math is done with a stripped down version of [glMatrix](http://glmatrix.net/), only `vec3` and `mat4`.

### Voxel Engine

The game uses a simple voxel engine similar to Minecraft.  Like Minecraft, a voxel unit is 1 meter.  Unlike Minecraft, voxels are not square.  Instead, voxels are 4 meters wide, 4 meters deep, and 1 meter tall, like a lego brick:

![lego-brick](https://cody.ebberson.com/minipunk/screenshots/lego-brick.jpg "lego-brick")

This creates a more blocky world, but it has several performance benefits.  This speeds up procedural generation (because it processes 1/16th as many voxels) and rendering (because it renders fewer triangles).

In a real voxel engine, you would have "chunks" to keep polygon counts low.  In Minipunk, there is only one big chunk and one big vertex buffer.  By using 4x4x1 voxels, it kept the total triangles per frame under 1 million.

The world itself is 512 meters wide, 512 meters deep, and 256 meters tall.  Or, in voxels, 128 voxels wide, 128 voxels deep, and 256 voxels tall.

For performance and simplicity reasons, the voxel world is constructed on page load, and static for the rest of the session.  Procedural generation builds a giant `Uint8Array(512 * 512 * 256)`.  Then all of the voxels are converted into triangles.  Invisible faces are discarded.

It does not do span optimization, which would have helped with runtime performance, but would have cost time and bytes.  Perhaps something for next time.

### Bloom Effect

To achieve the neon glow effect, I spent way too much time implementing a [Bloom](https://en.wikipedia.org/wiki/Bloom_(shader_effect)) shader.

![bloom](https://cody.ebberson.com/minipunk/screenshots/bloom.png "bloom")

The short version is:

1. Render the scene normally
2. Filter the image to keep lights and discard everything else
3. Blur blur blur
4. Alpha blend the blurred lights back on top of the normal scene

I hacked together a version of [this OpenGL tutorial](https://learnopengl.com/Advanced-Lighting/Bloom) and ported it to WebGL.

I am pleased with the results, despite spending a lot of time and a lot of bytes on the implementation.

### Procedural generation

There is a pretty simple block of code that generates a few city blocks.

![procgen-screenshot](https://cody.ebberson.com/minipunk/screenshots/procgen-screenshot.jpg "procgen-screenshot")

The "city" is roughly 4 city blocks by 4 city blocks.  Each city block has 4 buildings.  Originally I had hoped that buildings would be more varied in size, shape, and color, but frankly it didn't matter that much.

The player starts underground, and navigates a few obstacles.  Then the player ascends to ground level, and navigates to the boss building.  The city blocks underground and above ground are the same.

The boss building has more details and complexity.  It is a 3 tier building, big entrance, pillars inside, checkerboard floor, back stairway, etc.  There is also a big glowing "404" to emphasize 404 Megacorp and the 404 theme.

The hardest part about managing procedural generation was juggling all of the hardcoded constants.  The code is ugly, and would never pass code review 🤣

### Character rendering and animation

Characters are Minecraft-ish:

1. One cube for a head
2. One cube for the body
3. Two cubes for arms
4. Two cubes for legs
5. Optional cube for sword or knife

The cubes are slightly skewed to have different dimensions at top vs bottom.

![running](https://cody.ebberson.com/minipunk/screenshots/minipunk-running.gif "running")
![swinging](https://cody.ebberson.com/minipunk/screenshots/minipunk-swinging.gif "swinging")

The animation is all done algorithmically using sine waves and simple transformations.  I'm quite pleased with how this turned out.  Early versions were un-animated boxes, which was deeply unsatisfying.  I started down the path of extracting key frames from [Mixamo](https://www.mixamo.com/#/) models, but early prototypes took way too much space.  I looked into [PhobosLab's Voidcall](https://phoboslab.org/log/2019/09/voidcall-making-of) system, which was impressive, but I ultimately wanted more control, so I settled on the algorithmic approach.

### Enemies

There are three enemy types in the game:

![punk](https://cody.ebberson.com/minipunk/screenshots/punk.jpg "punk")
![soldier](https://cody.ebberson.com/minipunk/screenshots/soldier.jpg "soldier")
![boss](https://cody.ebberson.com/minipunk/screenshots/boss.jpg "boss")

Punks are fast and simple.  Their primary purpose is to teach the player the basics of the game, and provide a warm up for the bigger challenges.  In early versions of the game, the punks were slower than the player, so you could run right by them.  If you play Soulsborne games, then this strategy might sound normal and acceptable.  However, it was one of the most disliked aspects in early playtesting, so I made them faster and easier.

Soldiers shoot projectiles.  They move slowly.  They lock onto a target and shoot one second later.  This gives the player a chance to dodge and evade.  In early encounters, packs only have one soldier.  This was done to teach the player basic mechanics.  In the boss room, things get more chaotic.

And then there's the final boss.  Aesthetically, I wanted something like Wolfenstein 3D Hitler and Into the Spider-Verse Kingpin:

![hitler](https://cody.ebberson.com/minipunk/screenshots/boss-hitler.png "hitler")
![kingpin](https://cody.ebberson.com/minipunk/screenshots/boss-kingpin.jpg "kingpin")

The goal was an epic boss fight with interesting mechanics.  Due to byte and time constraints, the end result is hardly epic, but still a satisfying challenge.  The boss is slow and dangerous (one shot kills).  He is surrounded by soldiers, which requires the player to keep moving.  He has a knockback effect which turned out annoying more than challenging, but still added variety to the experience.

My original plans included a 3rd phase of the boss fight, that involved jumping from building to building.  I still think it would have been fun, but I simply ran out of time and bytes.

### Dash effect

The basic sword attack is a basic sword attack:  moderately effective but becomes boring quickly.  To make things more interesting, I added a "dash attack" based on the Halo Energy Sword.  If you haven't played Halo, the sword operates on a fun little mechanic: if the cursor is focused on an enemy, it turns red, and you can perform a high speed dash attack.  I love this mechanic, and I'm very satisfied with how it turned out.

![dash](https://cody.ebberson.com/minipunk/screenshots/minipunk-dash.gif "dash")

### Audio

I used a stripped down version of [Sonant-X](https://github.com/nicolas-van/sonant-x) to generate all sound effects and music.  Specifically, I further stripped down [Phoboslab's version](https://phoboslab.org/log/2018/09/underrun-making-of) from their 2018 entry, Underrun.

I am not musically gifted, but I was able to slap something together that sounds ok.  I caught my wife humming the tune, which suggested the music would be ok 🤣

In addition to Phoboslab's impressive modifications, I went a few steps further:

1. Converted 2-channel stereo to 1-channel mono
2. Replaced the 4 basic oscillators with 1 custom oscillator
3. Removed LFO
4. Use a single global `AudioContext`
5. Manually mangled all of the variable names

The custom oscillator was a fun deep dive into [overdrive and distortion](https://en.wikipedia.org/wiki/Distortion_(music)#Overdrive/distortion_pedals).  I feel like I was just scratching the surface here, and I would love to find the time to go deeper.  Music like [Cyberpunk 2077's Hyper](https://www.youtube.com/watch?v=9ayYeLLT8bs) should be possible without much additional code.

Manual mangling was unfortunate, because maintenance became virtually impossible afterward.  Google Closure Compiler could not minify the JSON properties without heavy refactoring, so manual was the only option.  It saved about 250 bytes post-minification and post-zip though, which was well worth it.

### Space saving

Other space saving tips:

1. Flattening classes into globals.  Find a balance between code quality and size.  During most of development, the project had additional classes for `Game` state, but all of those `this.x` add up compared to `x`.  I found it easier to keep the classes for hygiene until the very end, and then flatten into globals as necessary for space.
2. Replacing all `const` with `let`.  Minor change which yielded healthy savings.
3. Shader strings.  I did it manually, but check out [Elliot Nelson's blog post](https://7tonshark.com/2019-03-02-add-shaders-to-your-gulp-build/#) on automated tooling.
4. Google Closure Compiler annotations.  Aggressively add the JSDoc comments for `@type` and `@const` to help Closure do its magic.

One other idea that I hoped to look into was building a more industrial strength version of [RegPack](https://github.com/Siorki/RegPack).  RegPack is intended for js1k.  It technically works with files up to 4kb, but in my experience it becomes slow and unstable.  Maybe something for next year!

### Conclusion

In the end, I am pleased with how the game turned out.  As with any project, there are things that I wish I could have added, things I wish I wouldn't have wasted time on, etc.  Now it's time to wait for voting, judges, and results.  As I look at the entries submitted so far, I can't help but admire how far the competition has come, and how much the quality of the results improves every year.
