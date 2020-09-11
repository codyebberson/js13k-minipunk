
let KEY_COUNT = 256;

let KEY_ESCAPE = 27;
let KEY_SPACE = 32;
let KEY_LEFT = 37;
let KEY_UP = 38;
let KEY_RIGHT = 39;
let KEY_DOWN = 40;
let KEY_1 = 49;
let KEY_2 = 50;
let KEY_3 = 51;
let KEY_4 = 52;
let KEY_5 = 53;
let KEY_6 = 54;
let KEY_7 = 55;
let KEY_8 = 56;
let KEY_9 = 57;
let KEY_A = 65;
let KEY_D = 68;
let KEY_M = 77;
let KEY_Q = 81;
let KEY_S = 83;
let KEY_W = 87;
let KEY_Z = 90;

/**
 * Array of keyboard keys.
 * @const {!Array.<!Input>}
 */
let keys = new Array(KEY_COUNT);
for (let i = 0; i < KEY_COUNT; i++) {
    keys[i] = new Input();
}

document.addEventListener(
    'keydown',
    function (e) {
        setKey(e.keyCode, true);
    });

document.addEventListener(
    'keyup',
    function (e) {
        setKey(e.keyCode, false);
    });

/**
 * @param {number} keyCode
 * @param {boolean} state
 */
function setKey(keyCode, state) {
    if (keyCode >= 0 && keyCode < KEY_COUNT) {
        keys[keyCode].down = state;
    }
}

/**
 * Updates all key states.
 */
function updateKeys() {
    for (let i = 0; i < KEY_COUNT; i++) {
        updateInput(keys[i]);
    }
}
