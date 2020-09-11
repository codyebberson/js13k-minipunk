
/**
 * The ScreenTarget class represents the screen as a WebGL render target.
 * There should only be one of these.
 */
class ScreenTarget {

    /**
     * Creates a new screen object.
     * Initial dimensions are 2x2.
     * Values are updated onload and onresize.
     */
    constructor() {
        /**
         * @type {number}
         */
        this.width = 2;

        /**
         * @type {number}
         */
        this.height = 2;

        /**
         * @type {number}
         */
        this.centerX = 1;

        /**
         * @type {number}
         */
        this.centerY = 1;
    }

    /**
     * Binds the screen as the render target.
     * Updates the viewport size.
     */
    bind() {
        gl.bindFramebuffer(FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
    }
}
