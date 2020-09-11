minipunk
========

A short 3D action game for the 2020 js13kGames Competition.

The evil 404 Megacorp threatens to take over the internet.  You must stop them!

Controls:
WASD - move
Left click - attack
Right click - zoom
Spacebar - jump
Tip: Try zoom + attack

![screenshot-1](https://cody.ebberson.com/minipunk/screenshots/minipunk4.gif "screenshot-1") ![screenshot-2](https://cody.ebberson.com/minipunk/screenshots/minipunk5.gif "screenshot-2")
![screenshot-3](https://cody.ebberson.com/minipunk/screenshots/minipunk6.gif "screenshot-3") ![screenshot-4](https://cody.ebberson.com/minipunk/screenshots/minipunk7.gif "screenshot-4")

Tested on Chrome, Firefox, and Edge on Mac and Windows.

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
