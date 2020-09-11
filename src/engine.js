/**
 * Screen buffer width.
 * Ideally this would be screen size, but that requires code to update
 * buffer on resize, which would take up a lot of space.
 * Given the low res nature of the game, this is ok.
 * @const {number}
 */
let SCREEN_BUFFER_WIDTH = 1920;

/**
 * Screen buffer height.
 * @const {number}
 */
let SCREEN_BUFFER_HEIGHT = 1080;

/**
 * Framebuffer size (both width and height).
 * This is primarily used for bluring and bloom filter.
 * In which case, the lower resolution is actually helpful.
 * @const {number}
 */
let FBO_TEXTURE_SIZE = 512;

class Engine {
    constructor() {
        /**
         * Screen buffer.
         * @const {!FBO}
         */
        this.screenBuffer = new FBO(SCREEN_BUFFER_WIDTH, SCREEN_BUFFER_HEIGHT);

        /**
         * Frame buffers.
         * @const {!Array.<!FBO>}
         */
        this.frameBuffers = [
            new FBO(FBO_TEXTURE_SIZE, FBO_TEXTURE_SIZE),
            new FBO(FBO_TEXTURE_SIZE, FBO_TEXTURE_SIZE)
        ];

        /**
         * Position coordinates buffer.
         * This is the static, flat, two triangle (one quad) buffer
         * that is used for post processing effects.
         * @const {!WebGLBuffer}
         */
        this.positionCoordBuffer = gl.createBuffer();
        gl.bindBuffer(ARRAY_BUFFER, this.positionCoordBuffer);
        gl.bufferData(ARRAY_BUFFER, new Float32Array([
            // Top-left
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            // Bottom-right
            1.0, -1.0,
            1.0, 1.0,
            -1.0, 1.0
        ]), STATIC_DRAW);

        /**
         * Texture coordinates buffer.
         * This is the static, flat, two triangle (one quad) buffer
         * that is used for post processing effects.
         * @const {!WebGLBuffer}
         */
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(ARRAY_BUFFER, new Float32Array([
            // Top-left
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            // Bottom-right
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]), STATIC_DRAW);

        /**
         * Main geometry shader.
         * This is used for rendering all 3D geometry including
         * voxel world, in game entities, etc.
         * @const {!GeometryShader}
         */
        this.geometryShader = new GeometryShader();

        /**
         * Bloom shader.
         * This is used for creating the bloom/glow effect.
         * @const {!BloomShader}
         */
        this.bloomShader = new BloomShader();

        /**
         * Tone mapping shader.
         * This is used for rendering the final colors to the screen.
         * Applies some tone/hue post-processing.
         * @const {!ToneMappingShader}
         */
        this.toneMappingShader = new ToneMappingShader();

        /**
         * The global dynamic buffers are for dynamic geometry that change every frame.
         * Examples:  player, enemies, powerups, etc.
         * @const {!BufferSet}
         */
        this.dynamicBuffers = new BufferSet(DYNAMIC_DRAW, 10000);

        /**
         * The camera.
         * @type {!Camera}
         */
        this.camera = new Camera();
        this.pitchMatrix = mat4.create();
        this.yawMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.modelViewMatrix = mat4.create();
        this.flip = vec3.fromValues(-1.0, 1.0, 1.0);
    }

    /**
     * Resets the WebGL context.
     */
    resetGl() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(LEQUAL);            // Near things obscure far things
        gl.enable(BLEND);
        gl.blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA);

        // Clear the canvas before we start drawing on it.
        gl.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    }

    /**
     * Sets up the camera.
     */
    setupCamera() {
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        let fieldOfView = (zoom ? 50 : 60) * Math.PI / 180;   // in radians
        let aspect = screenTarget.width / screenTarget.height; // Always use the screen aspect ratio
        let zNear = 0.1;
        let zFar = 5000.0;
        mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);

        // Rotate around the X-axis by the pitch
        mat4.identity(this.pitchMatrix);
        mat4.rotateX(this.pitchMatrix, this.pitchMatrix, this.camera.pitch);

        // Rotate around the Y-axis by the yaw
        mat4.identity(this.yawMatrix);
        mat4.rotateY(this.yawMatrix, this.yawMatrix, this.camera.yaw);

        // Combine the pitch and yaw transformations
        mat4.multiply(this.modelViewMatrix, this.pitchMatrix, this.yawMatrix);

        // Turn the camera around 180 degrees
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, Math.PI);

        // Flip the x-axis to render in left-handed coordinates
        mat4.scale(this.modelViewMatrix, this.modelViewMatrix, this.flip);

        tempVec[0] = -this.camera.position[0];
        tempVec[1] = -this.camera.position[1];
        tempVec[2] = -this.camera.position[2];
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, tempVec);

        // Set the shader uniforms
        gl.uniformMatrix4fv(this.geometryShader.projectionMatrix, false, this.projectionMatrix);
        gl.uniformMatrix4fv(this.geometryShader.modelViewMatrix, false, this.modelViewMatrix);
        gl.uniform3fv(this.geometryShader.playerPosition, this.camera.position);
    }

    /**
     * Resets all of the dynamic geometry.
     */
    resetScene() {
        this.dynamicBuffers.resetBuffers();
    }

    /**
     * Renders the scene and post-processing effects.
     */
    renderAll() {
        // Update the buffers with dynamic geometry
        this.dynamicBuffers.updateBuffers();

        // Use the main shader program
        this.geometryShader.bind();

        // Draw 3D to the framebuffer
        this.screenBuffer.bind();
        this.renderScene();

        // Draw 3D to the framebuffer
        // TODO: Use screen buffer as first read buffer to avoid double render.
        this.frameBuffers[0].bind();
        this.renderScene();

        // Use the bloom shader program
        this.bloomShader.bind();
        gl.enable(BLEND);
        gl.blendFunc(ONE, ONE);

        // Ping pong between frame buffers
        let readBuffer = this.frameBuffers[0];
        let writeBuffer = this.frameBuffers[1];

        for (let i = 0; i < bloomIterations; i++) {
            writeBuffer.bind();
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(COLOR_BUFFER_BIT);
            gl.disable(DEPTH_TEST);
            gl.activeTexture(TEXTURE0);
            gl.bindTexture(TEXTURE_2D, readBuffer.texture);
            gl.uniform1i(this.bloomShader.uSampler, 0);
            gl.uniform1i(this.bloomShader.uIteration, i);
            this.renderBloom();

            // Swap buffers
            let temp = readBuffer;
            readBuffer = writeBuffer;
            writeBuffer = temp;
        }

        // Use the tone mapping shader program
        screenTarget.bind();
        this.toneMappingShader.bind();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(COLOR_BUFFER_BIT);
        gl.disable(BLEND);
        gl.activeTexture(TEXTURE0);
        gl.bindTexture(TEXTURE_2D, this.screenBuffer.texture);
        gl.activeTexture(TEXTURE1);
        gl.bindTexture(TEXTURE_2D, readBuffer.texture);
        gl.uniform1i(this.toneMappingShader.scene, 0);
        gl.uniform1i(this.toneMappingShader.bloomBlur, 1);
        this.renderToneMapping();
    }

    /**
     * Renders the scene to the current render target.
     */
    renderScene() {
        this.resetGl();
        this.setupCamera();
        this.dynamicBuffers.render();
        voxels.render();
    }

    /**
     * Renders a source target with the bloom filter.
     */
    renderBloom() {
        {
            let numComponents = 2;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.positionCoordBuffer);
            gl.vertexAttribPointer(
                this.bloomShader.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }
        {
            let numComponents = 2;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.textureCoordBuffer);
            gl.vertexAttribPointer(
                this.bloomShader.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }

        // Draw the triangles
        gl.drawArrays(TRIANGLES, 0, 6);
    }

    /**
     * Renders a source target with the bloom filter.
     */
    renderToneMapping() {
        {
            let numComponents = 2;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.positionCoordBuffer);
            gl.vertexAttribPointer(
                this.bloomShader.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }
        {
            let numComponents = 2;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.textureCoordBuffer);
            gl.vertexAttribPointer(
                this.bloomShader.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }

        // Draw the triangles
        gl.drawArrays(TRIANGLES, 0, 6);
    }
}
