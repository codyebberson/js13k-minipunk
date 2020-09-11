
/**
 * All of the canvases in the DOM.
 * The JS code expects there to be 2 canvases.
 * @const {!NodeList<!Element>}
 */
let canvases = document.querySelectorAll('canvas');

/**
 * The webgl canvas.
 * This is in the background.
 * @const {!HTMLCanvasElement}
 */
let canvas = /** @type {!HTMLCanvasElement} */ (canvases[0]);

/**
 * The overlay canvas.
 * This is in the foreground.
 * @const {!HTMLCanvasElement}
 */
let overlayCanvas = /** @type {!HTMLCanvasElement} */ (canvases[1]);

/**
 * The overlay canvas rendering context.
 * This is used for all GUI controls.
 * @const {!CanvasRenderingContext2D}
 */
let overlayCtx = /** @type {!CanvasRenderingContext2D} */ (overlayCanvas.getContext('2d'));

/**
 * The screen rendering target.
 * In practice, this is the null framebuffer.
 * @const {!ScreenTarget}
 */
let screenTarget = new ScreenTarget();

/**
 * Number of bloom iterations.
 * @const {number}
 */
let bloomIterations = 5;

/**
 * Number of webgl draw calls per frame.
 * Only updated if DEBUG=true.
 * @type {number}
 */
let drawCount = 0;

/**
 * Number of triangles rendered per frame.
 * Only updated if DEBUG=true.
 * @type {number}
 */
let triangleCount = 0;

/**
 * The webgl rendering context.
 * @const {!WebGLRenderingContext}
 */
let gl = /** @type {!WebGLRenderingContext} */ (canvas.getContext('webgl', { alpha: false }));

window.addEventListener('resize', handleResizeEvent, false);
handleResizeEvent();

initMouse();

/**
 * List of game entities.
 * @type {!Array.<!GameEntity>}
 */
let entities = [];

/**
 * The player entity.
 * @type {?GameEntity}
 */
let player = null;

/**
 * The boss entity.
 * @type {?GameEntity}
 */
let boss = null;

/**
 * List of cars.
 * @const {!Array.<!Car>}
 */
let cars = [];
for (let i = 0; i < 20; i++) {
    cars.push(new Car(Math.random() * 512, 150, 128, 120, 0));
    cars.push(new Car(Math.random() * 512, 160, 384, -120, 0));
    cars.push(new Car(128, 170, Math.random() * 512, 0, -120));
    cars.push(new Car(384, 180, Math.random() * 512, 0, 120));
}

/**
 * Voxel engine.
 * @const {!VoxelEngine}
 */
let voxels = new VoxelEngine();

/**
 * Current real world time in seconds.
 * This is updated by the requestAnimationFrame handler.
 * @type {number}
 */
let time = Date.now() * 0.001;

/**
 * Game time in seconds.
 * This is updated only when the game is not paused.
 * @type {number}
 */
let gameTime = 0;

/**
 * Delta time since last frame.
 * Use this in all physics calculations.
 * @type {number}
 */
let dt = 0.0167;

/**
 * Whether the game has started or not.
 * @type {boolean}
 */
let started = false;

/**
 * Whether the game is paused or not.
 * @type {boolean}
 */
let paused = true;

/**
 * Whether the camera is zoomed in or not.
 * @type {boolean}
 */
let zoom = false;

/**
 * When zooming, the start of the zoom line segment.
 * @const {!vec3}
 */
let zoomStart = vec3.create();

/**
 * When zooming, the end of the zoom line segment.
 * @const {!vec3}
 */
let zoomEnd = vec3.create();

/**
 * Index of the target entity when zooming.
 * If there is an entity in the zoom target, then this is the index.
 * If there is not an entity in the zoom target, then this is -1.
 * @type {?GameEntity}
 */
let targetEntity = null;

/**
 * 3D graphics engine
 * @const {!Engine}
 */
let engine = new Engine();

/**
 * Adds a OS13K trophy.
 * @param {string} name
 */
function addTrophy(name) {
    localStorage['OS13kTrophy,⚔️,MINIPUNK,' + name] = '';
}

initWorld();

initAudio();

/**
 * Handles an animation frame event.
 * @param {number} now Time in milliseconds
 */
function handleAnimationFrame(now) {
    started = started || mouse.pointerLocked;

    if (!mouse.pointerLocked) {
        paused = true;
    }

    // convert to seconds
    now *= 0.001;

    // Calculate time delta per frame
    // Clamp to 0.004 seconds (250 fps)
    dt = Math.max(0.004, now - time);
    time = now;

    if (!paused) {
        gameTime += dt;
    }

    if (DEBUG) {
        drawCount = 0;
        triangleCount = 0;
    }

    updateKeys();
    updateMouse();
    mainRenderLoop();
    requestAnimationFrame(handleAnimationFrame);
}
requestAnimationFrame(handleAnimationFrame);

/**
 * Handles new game menu callback.
 */
function newGame() {
    initGame();
    paused = false;
    menu = new IntroStory();
    overlayCanvas.requestPointerLock();
}

/**
 * Handles "Continue Game" menu callback.
 */
function continueGame() {
    paused = false;
    menu = null;
    overlayCanvas.requestPointerLock();
}

/**
 * Handles "Music" slider callback.
 * @param {number} p Percent (0.0-1.0)
 */
function setMusicVolume(p) {
    musicGain.gain.value = p;
}

/**
 * Handles "Sound" slider callback.
 * @param {number} p Percent (0.0-1.0)
 */
function setSoundVolume(p) {
    soundGain.gain.value = p;
}

/**
 * Handles "Mouse" slider callback.
 * @param {number} p Percent (0.0-1.0)
 */
function setMouseSensitivity(p) {
    mouse.sensitivity = 0.002 * p;
}

/**
 * Camera flies over the city.
 */
function flyoverCamera() {
    let theta = ((time / 100.0) % 1) * 2 * Math.PI;
    let x = 200 - 200 * Math.cos(theta);
    let y = 300;
    let z = 256 + 256 * Math.sin(theta);
    let pitch = 0.3 * Math.PI;
    let yaw = 0.5 * Math.PI + theta;
    engine.camera.set(x, y, z, pitch, yaw);
}

/**
 * Draws a transparent black overlay.
 * Used for menus.
 */
function drawDarkBackground() {
    overlayCtx.fillStyle = 'rgba(0,0,0,0.5)';
    overlayCtx.fillRect(0, 0, screenTarget.width, screenTarget.height);
}

/**
 * Draws the game title.
 * Used for menus.
 */
function drawTitle() {
    overlayCtx.font = "bold 80px 'Arial Black'";
    drawShadowText('MINIPUNK', 10, 10);
}

class MenuItem {
    /**
     *
     * @param {string} str
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {!Function} cb Click callback.
     */
    constructor(str, x, y, w, h, cb) {
        this.str = str;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cb = cb;
        this.enabled = true;
        this.hover = false;
    }

    /**
     * Updates the menu item.
     * Checks for hover and clicks.
     */
    update() {
        this.hover = false;
        if (this.enabled &&
            mouse.x > this.x &&
            mouse.y > this.y &&
            mouse.x < this.x + this.w &&
            mouse.y < this.y + this.h) {
            this.hover = true;
            if (
                mouse.buttons[0].upCount === 1) {
                this.cb();
            }
        }
    }

    /**
     * Renders the menu item.
     */
    render() {
        drawShadowText(
            this.str,
            this.x,
            this.y,
            this.enabled ? (this.hover ? OVERLAY_COLOR_YELLOW : OVERLAY_COLOR_WHITE) : OVERLAY_COLOR_GRAY);
    }
}

class Slider {
    /**
     * Creates a new slider control.
     * @param {number} x Left edge
     * @param {number} y Top edge
     * @param {number} w Width
     * @param {number} h Height
     * @param {number} p Percentage value
     * @param {!Function} cb Click callback.
     */
    constructor(x, y, w, h, p, cb) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.p = p;
        this.cb = cb;
    }

    /**
     * Updates the slider.
     * Checks for mouse movement and value updates.
     */
    update() {
        if (mouse.buttons[0].down &&
            mouse.x > this.x &&
            mouse.y > this.y &&
            mouse.x < this.x + this.w &&
            mouse.y < this.y + this.h) {
            let p2 = (mouse.x - this.x) / this.w;
            if (Math.abs(this.p - p2) > 0.01) {
                this.p = p2;
                this.cb(p2);
            }
        }
    }

    /**
     * Draws a slider control.
     */
    render() {
        let w1 = (this.w * this.p) | 0;
        let w2 = this.w - w1;
        overlayCtx.fillStyle = OVERLAY_COLOR_WHITE;
        overlayCtx.fillRect(this.x, this.y, w1, this.h);
        overlayCtx.fillStyle = OVERLAY_COLOR_GRAY;
        overlayCtx.fillRect(this.x + w1, this.y, w2, this.h);
    }
}

class ClickToStart {
    /**
     * On first click, transitions to main menu.
     */
    update() {
        if (mouse.buttons[0].upCount === 1) {
            menu = new MainMenu();
        }
        if (!started) {
            flyoverCamera();
        }
    }

    /**
     * Renders the main menu.
     */
    render() {
        drawDarkBackground();
        drawTitle();

        overlayCtx.font = "bold 40px 'Arial Black'";
        drawShadowText('CLICK TO START', 60, 150);
    }
}

class MainMenu {
    constructor() {
        this.items = [
            new MenuItem('NEW GAME', 60, 150, 300, 40, newGame),
            new MenuItem('CONTINUE', 60, 210, 300, 40, continueGame)
        ];

        this.sliders = [
            new Slider(220, 318, 200, 20, musicGain.gain.value, setMusicVolume),
            new Slider(220, 358, 200, 20, soundGain.gain.value, setSoundVolume),
            new Slider(220, 398, 200, 20, mouse.sensitivity / 0.002, setMouseSensitivity),
        ];
    }

    /**
     * Updates the main menu.
     * Checks for hover, clicks, and slider updates.
     */
    update() {
        this.items[1].enabled = started;
        this.items.forEach(i => i.update());
        this.sliders.forEach(s => s.update());

        if (!started) {
            flyoverCamera();
        }
    }

    /**
     * Renders the main menu.
     */
    render() {
        drawDarkBackground();
        drawTitle();

        overlayCtx.font = "bold 40px 'Arial Black'";
        this.items.forEach(i => i.render());
        drawShadowText('SETTINGS', 60, 270);
        drawShadowText('KEY GUIDE', 60, 450);

        overlayCtx.font = "20px 'Arial Black'";
        drawShadowText('MUSIC', 110, 320);
        drawShadowText('SOUND', 110, 360);
        drawShadowText('MOUSE', 110, 400);
        this.sliders.forEach(s => s.render());

        drawShadowText('WASD - MOVE', 110, 500);
        drawShadowText('LEFT CLICK - ATTACK', 110, 540);
        drawShadowText('RIGHT CLICK - ZOOM', 110, 580);
        drawShadowText('SPACEBAR - JUMP', 110, 620);
        drawShadowText('TIP: TRY ZOOM + ATTACK', 110, 680);
    }
}

class IntroStory {

    constructor() {
        /**
         * @const {number}
         */
        this.startTime = time;
    }

    /**
     * Updates the cutscene.
     */
    update() {
        if (mouse.buttons[0].upCount === 1) {
            // Skip cutscene
            menu = null;
        }

        let t = Math.max(0, Math.min(20, time - this.startTime - 1.0));
        let x = 450 - 20 * t;
        let y = 54 + 0.25 * t * t;
        let z = 256;
        let pitch = t * 0.005 * Math.PI;
        let yaw = 0.5 * Math.PI;
        engine.camera.set(x, y, z, pitch, yaw);
    }

    /**
     * Renders the cutscene.
     */
    render() {
        overlayCtx.font = "bold 32px 'Arial Black'";
        drawShadowText('THE EVIL 404 MEGACORP', 20, screenTarget.height - 300);
        drawShadowText('THREATENS TO TAKE OVER THE INTERNET', 20, screenTarget.height - 250);
        drawShadowText('YOU MUST STOP THEM', 20, screenTarget.height - 175);

        if (time - this.startTime > 21) {
            drawShadowText('CLICK TO CONTINUE', 20, screenTarget.height - 100);
        }

        if (DEBUG) {
            drawShadowText('T = ' + (time - this.startTime), 10, 100);
            drawShadowText('X = ' + engine.camera.position[0], 10, 150);
            drawShadowText('Y = ' + engine.camera.position[1], 10, 200);
            drawShadowText('Z = ' + engine.camera.position[2], 10, 250);
        }
    }
}

class DeathScreen {

    /**
     * Creates a new death screen.
     */
    constructor() {
        /**
         * The time the screen started.
         * @const {number}
         */
        this.startTime = time;
    }

    /**
     * Listen for mouse clicks.
     */
    update() {
        if ((time - this.startTime) > 1 && mouse.buttons[0].upCount === 1) {
            document.exitPointerLock();
            menu = new MainMenu();
            started = false;
        }
    }

    /**
     * Renders the death screen overlay.
     */
    render() {
        drawDarkBackground();
        drawTitle();

        overlayCtx.font = "bold 40px 'Arial Black'";
        drawShadowText('YOU DIED', 60, 150);
        drawShadowText('CLICK TO CONTINUE', 60, 250);
    }
}

class WinScreen {

    /**
     * Creates a new win screen.
     */
    constructor() {
        /**
         * The time the screen started.
         * @const {number}
         */
        this.startTime = time;
    }

    /**
     * Listen for mouse clicks.
     */
    update() {
        if ((time - this.startTime) > 2 && mouse.buttons[0].upCount === 1) {
            document.exitPointerLock();
            menu = new MainMenu();
            started = false;
        }
    }

    /**
     * Renders the win screen overlay.
     */
    render() {
        drawDarkBackground();
        drawTitle();

        overlayCtx.font = "bold 40px 'Arial Black'";
        drawShadowText('YOU DEFEATED THE EVIL 404 MEGACORP', 60, 150);
        drawShadowText('THE INTERNET SURVIVES!', 60, 200);
        drawShadowText('HTTP 200 OK  (☞ﾟヮﾟ)☞', 60, 300);
        drawShadowText('FINAL TIME: ' + gameTime.toFixed(1), 60, 400);
        drawShadowText('CLICK TO CONTINUE', 60, 500);
    }
}

let menu = new ClickToStart();

/**
 * Handles an animation frame event.
 */
function mainRenderLoop() {
    engine.resetScene();

    if (!mouse.pointerLocked && !menu) {
        menu = new MainMenu();
    }

    if (menu) {
        menu.update();
    } else {
        updateGame();
        engine.camera.updateForPlayer();
    }

    updateCars();
    renderGame();
    engine.renderAll();

    // Update overlays
    overlayCtx.clearRect(0, 0, screenTarget.width, screenTarget.height);
    overlayCtx.textBaseline = "top";

    if (menu) {
        // Draw menus
        menu.render();

    } else {
        // Draw game overlays
        overlayCtx.font = "bold 24px 'Arial Black'";

        setTextAlign(ALIGN_LEFT);
        overlayCtx.fillStyle = OVERLAY_COLOR_WHITE;
        overlayCtx.fillRect(30, 30, player.health, 20);
        overlayCtx.fillStyle = OVERLAY_COLOR_GRAY;
        overlayCtx.fillRect(30 + player.health, 30, 100 - player.health, 20);
        drawShadowText(gameTime.toFixed(1), screenTarget.width - 100, 30);

        if (zoom) {
            // Draw crosshairs
            drawShadowCircle(
                screenTarget.centerX,
                screenTarget.centerY,
                20,
                targetEntity ? OVERLAY_COLOR_RED : OVERLAY_COLOR_WHITE);
        }

        if (DEBUG) {
            drawShadowText('PLAYER = ' + player.position[0].toFixed(1) + ', ' + player.position[1].toFixed(1) + ', ' + player.position[2].toFixed(1), 10, 100);
            drawShadowText('DAMAGE = ' + player.damageMultiplier, 10, screenTarget.height - 250);
            drawShadowText('JUMP COUNT = ' + player.jumpCount, 10, screenTarget.height - 200);
            drawShadowText('DRAWS = ' + drawCount, 10, screenTarget.height - 100);
            drawShadowText('TRIANGLES = ' + triangleCount, 10, screenTarget.height - 50);
        }
    }
}

/**
 * Handles browser resize event.
 */
function handleResizeEvent() {
    screenTarget.width = window.innerWidth;
    screenTarget.height = window.innerHeight;
    screenTarget.centerX = (screenTarget.width / 2) | 0;
    screenTarget.centerY = (screenTarget.height / 2) | 0;

    if (canvas) {
        canvas.width = screenTarget.width;
        canvas.height = screenTarget.height;
    }
    if (overlayCanvas) {
        overlayCanvas.width = screenTarget.width;
        overlayCanvas.height = screenTarget.height;
    }
}
