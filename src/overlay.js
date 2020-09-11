
let OVERLAY_COLOR_WHITE = '#fff';
let OVERLAY_COLOR_BLACK = '#000';
let OVERLAY_COLOR_GRAY = '#888';
let OVERLAY_COLOR_YELLOW = '#ff0';
let OVERLAY_COLOR_RED = '#f00';

let ALIGN_LEFT = 'left';
let ALIGN_CENTER = 'center';
let ALIGN_RIGHT = 'right';

/**
 * Draws a string with shadow on the overlay canvas.
 * @param {string} str
 * @param {number} x
 * @param {number} y
 * @param {string=} opt_color
 */
function drawShadowText(str, x, y, opt_color) {
    drawColoredText(str, x + 1, y + 1, OVERLAY_COLOR_BLACK);
    drawColoredText(str, x, y, opt_color || OVERLAY_COLOR_WHITE);
}

/**
 * Draws a string on the overlay canvas.
 * @param {string} str
 * @param {number} x
 * @param {number} y
 * @param {string} color
 */
function drawColoredText(str, x, y, color) {
    overlayCtx.fillStyle = color;
    overlayCtx.fillText(str, x, y);
}

/**
 * Sets text alignment.
 * @param {string} align
 */
function setTextAlign(align) {
    overlayCtx.textAlign = align;
}

/**
 * Draws a line on the overlay.
 * Coordinates in screen space.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} color
 */
function drawLine(x1, y1, x2, y2, color) {
    overlayCtx.strokeStyle = color;
    overlayCtx.beginPath();
    overlayCtx.moveTo(x1, y1);
    overlayCtx.lineTo(x2, y2);
    overlayCtx.stroke();
}

/**
 * Draws a line on the overlay.
 * White on top of black shadow line.
 * Coordinates in screen space.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function drawShadowLine(x1, y1, x2, y2) {
    drawLine(x1 + 1, y1 + 1, x2 + 1, y2 + 1, OVERLAY_COLOR_BLACK);
    drawLine(x1, y1, x2, y2, OVERLAY_COLOR_WHITE);
}

/**
 * Draws a circle on the overlay.
 * Coordinates in screen space.
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {string} color
 */
function drawCircle(x, y, r, color) {
    overlayCtx.strokeStyle = color;
    overlayCtx.beginPath();
    overlayCtx.arc(x, y, r, 0, 2 * Math.PI);
    overlayCtx.stroke();
}

/**
 * Draws a circle on the overlay.
 * White on top of black shadow line.
 * Coordinates in screen space.
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {string=} opt_color
 */
function drawShadowCircle(x, y, r, opt_color) {
    drawCircle(x + 1, y + 1, r, OVERLAY_COLOR_BLACK);
    drawCircle(x, y, r, opt_color || OVERLAY_COLOR_WHITE);
}

