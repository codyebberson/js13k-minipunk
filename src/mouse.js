
let MOUSE_BUTTON_COUNT = 3;

let mouse = new class {
    constructor() {

        /**
         * Mouse x coordinate.
         * @type {number}
         */
        this.x = 0;

        /**
         * Mouse y coordinate.
         * @type {number}
         */
        this.y = 0;

        /**
         * Mouse buttons
         * @const {!Array.<!Input>}
         */
        this.buttons = new Array(MOUSE_BUTTON_COUNT).fill(0).map(() => new Input());

        /**
         * Flag for pointer locked.
         * @type {boolean}
         */
        this.pointerLocked = false;

        /**
         * Mouse->camera sensitivity.
         * Units are radians per pixel.
         * @type {number}
         */
        this.sensitivity = 0.0005;
    }
};

/**
 * Initializes mouse event listeners.
 * Depends on overlayCanvas global.
 */
function initMouse() {
    overlayCanvas.addEventListener('mousedown', function (e) {
        audioCtx.resume();
        mouse.buttons[e.button].down = true;
    });

    overlayCanvas.addEventListener('mouseup', function (e) {
        mouse.buttons[e.button].down = false;
    });

    overlayCanvas.addEventListener('mousemove', handleMouseMoveEvent);

    // Hook pointer lock state change events for different browsers
    document.addEventListener('pointerlockchange', handleLockChangeEvent);
}

/**
 * Updates all mouse button states.
 */
function updateMouse() {
    for (let i = 0; i < MOUSE_BUTTON_COUNT; i++) {
        updateInput(mouse.buttons[i]);
    }
}

/**
 * Handles browser pointer lock event.
 */
function handleLockChangeEvent() {
    if (document.pointerLockElement === overlayCanvas || document['mozPointerLockElement'] === overlayCanvas) {
        mouse.pointerLocked = true;
    } else {
        mouse.pointerLocked = false;
    }
}

/**
 * Handles a mouse move event.
 * @param {!Event} e
 */
function handleMouseMoveEvent(e) {
    let me = /** @type {!MouseEvent} */ (e);

    // Update screen coordinates
    mouse.x = me.pageX;
    mouse.y = me.pageY;

    if (!paused) {
        // Update camera
        player.yaw = normalizeRadians(player.yaw + mouse.sensitivity * me.movementX);
        player.pitch = normalizeRadians(player.pitch + mouse.sensitivity * me.movementY);
    }
}
