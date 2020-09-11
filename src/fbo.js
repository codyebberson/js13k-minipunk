
/**
 * Framebuffer object wrapper.
 *
 * Assumes global gl variable is already setup.
 */
class FBO {

    /**
     * Creates a new framebuffer object.
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        /**
         * @type {number}
         * @const
         */
        this.width = width;

        /**
         * @type {number}
         * @const
         */
        this.height = height;

        /**
         * Texture
         * @type {!WebGLTexture}
         * @const
         */
        this.texture = gl.createTexture();
        gl.bindTexture(TEXTURE_2D, this.texture);

        let level = 0;
        {
            // define size and format of level 0
            let internalFormat = RGBA;
            let border = 0;
            let format = RGBA;
            let type = UNSIGNED_BYTE;
            let data = null;
            gl.texImage2D(TEXTURE_2D, level, internalFormat,
                width, height, border,
                format, type, data);

            // set the filtering so we don't need mips
            gl.texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, LINEAR);
            gl.texParameteri(TEXTURE_2D, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
            gl.texParameteri(TEXTURE_2D, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
        }

        // Create and bind the framebuffer

        /**
         * Frame buffer.
         * @type {!WebGLFramebuffer}
         * @const
         */
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(FRAMEBUFFER, this.frameBuffer);

        // attach the texture as the first color attachment
        // let attachmentPoint = COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(FRAMEBUFFER, COLOR_ATTACHMENT0, TEXTURE_2D, this.texture, level);

        // create a depth renderbuffer

        /**
         * Depth buffer.
         * @type {!WebGLRenderbuffer}
         * @const
         */
        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(RENDERBUFFER, this.depthBuffer);

        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(RENDERBUFFER, DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(FRAMEBUFFER, DEPTH_ATTACHMENT, RENDERBUFFER, this.depthBuffer);
    }

    /**
     * Binds this framebuffer as the render target.
     * Updates the viewport size.
     */
    bind() {
        gl.bindFramebuffer(FRAMEBUFFER, this.frameBuffer);
        gl.viewport(0, 0, this.width, this.height);
    }
}
