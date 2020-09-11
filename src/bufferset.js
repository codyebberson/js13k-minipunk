
/**
 * Default maximum quads per VBO.
 * @const {number}
 */
let DEFAULT_MAX_QUADS = 1000;

class BufferSet {

    /**
     * Creates a new buffer set.
     *
     * A buffer set is the combination of three buffers:
     * 1) Positions - coordinates are in the world.
     * 2) Textures - coordinates on the texture image.
     * 3) Indices - indices lookups for the individual triangles.
     *
     * The general philosophy is "let webgl do as much as possible", so a single
     * call to "render()" will include many triangles.
     *
     * @param {!GLenum} usage The usage pattern (either STATIC_DRAW or DYNAMIC_DRAW).
     * @param {number=} maxQuads Optional hint of maximum quads to be rendered.
     */
    constructor(usage, maxQuads) {
        /**
         * Usage pattern (either STATIC_DRAW or DYNAMIC_DRAW).
         * @const {!GLenum}
         */
        this.usage = usage;

        /**
         * Maximum number of quads in this buffer set.
         * @const {number}
         */
        this.maxQuads = maxQuads || DEFAULT_MAX_QUADS;

        let vertexCount = this.maxQuads * 6;

        /**
         * Position buffer contents.
         * @const {!Float32Array}
         */
        this.positions = new Float32Array(vertexCount * 3);

        /**
         * Color contents byte representation.
         * @const {!Uint8Array}
         */
        this.colorBytes = new Uint8Array(vertexCount * 4);

        /**
         * Color contents in 32-bit integers.
         * This uses the same underlying array, but is a 32-bit view.
         * This allows us to set 4 bytes in one call.
         * @const {!Uint32Array}
         */
        this.colors = new Uint32Array(this.colorBytes.buffer);

        /**
         * Normals buffer contents.
         * @const {!Float32Array}
         */
        this.normals = new Float32Array(vertexCount * 3);

        /**
         * Current number of vertices.
         * If dynamic usage, can be reset per frame.
         * @type {number}
         */
        this.vertexCount = 0;

        /**
         * Current number of positions.
         * If dynamic usage, can be reset per frame.
         * @type {number}
         */
        this.positionsCount = 0;

        /**
         * Current number of colors.
         * If dynamic usage, can be reset per frame.
         * @type {number}
         */
        this.colorCount = 0;

        /**
         * Current number of normals.
         * If dynamic usage, can be reset per frame.
         * @type {number}
         */
        this.normalCount = 0;

        /**
         * WebGL position buffer.
         * @const {!WebGLBuffer}
         */
        this.positionBuffer = gl.createBuffer();

        /**
         * WebGL colors buffer.
         * @const {!WebGLBuffer}
         */
        this.colorBuffer = gl.createBuffer();

        /**
         * WebGL normals buffer.
         * @const {!WebGLBuffer}
         */
        this.normalBuffer = gl.createBuffer();
    }

    /**
     * Resets the buffers to empty state.
     */
    resetBuffers() {
        this.vertexCount = 0;
        this.positionsCount = 0;
        this.colorCount = 0;
        this.normalCount = 0;
    }

    /**
     *
     * @param {!Array.<!vec3>} points Array of 4 corners.
     * @param {number} color The quad color.
     */
    addQuad(points, color) {
        // Calculate normal
        vec3.cross2(tempVec, points[0], points[1], points[3]);
        vec3.normalize(tempVec, tempVec);

        let indices = [0, 1, 2, 0, 2, 3];
        for (let k = 0; k < 6; k++) {
            let i = indices[k];

            // Position
            for (let j = 0; j < 3; j++) {
                this.positions[this.positionsCount++] = points[i][j];
            }

            // Normal
            for (let j = 0; j < 3; j++) {
                this.normals[this.normalCount++] = tempVec[j];
            }

            // Color
            this.colors[this.colorCount++] = color;
        }
    }

    /**
     * Adds a cube to the buffer set.
     * @param {!cube} p
     * @param {number} color
     */
    addCube2(p, color) {
        this.addQuad([p[0], p[1], p[2], p[3]], color); // top
        this.addQuad([p[7], p[6], p[5], p[4]], color); // bottom
        this.addQuad([p[1], p[0], p[4], p[5]], color); // north
        this.addQuad([p[3], p[2], p[6], p[7]], color); // south
        this.addQuad([p[0], p[3], p[7], p[4]], color); // west
        this.addQuad([p[2], p[1], p[5], p[6]], color); // east
    }

    /**
     * Adds a cube to the buffer set.
     * @param {number} cx Center x
     * @param {number} cy Center y
     * @param {number} cz Center z
     * @param {number} r Radius (half width)
     * @param {number} color The color
     */
    addCube(cx, cy, cz, r, color) {
        let p1 = vec3.fromValues(cx - r, cy + r, cz + r);
        let p2 = vec3.fromValues(cx + r, cy + r, cz + r);
        let p3 = vec3.fromValues(cx + r, cy + r, cz - r);
        let p4 = vec3.fromValues(cx - r, cy + r, cz - r);
        let p5 = vec3.fromValues(cx - r, cy - r, cz + r);
        let p6 = vec3.fromValues(cx + r, cy - r, cz + r);
        let p7 = vec3.fromValues(cx + r, cy - r, cz - r);
        let p8 = vec3.fromValues(cx - r, cy - r, cz - r);

        this.addQuad([p1, p2, p3, p4], color); // top
        this.addQuad([p8, p7, p6, p5], color); // bottom

        this.addQuad([p2, p1, p5, p6], color); // north
        this.addQuad([p4, p3, p7, p8], color); // south
        this.addQuad([p1, p4, p8, p5], color); // west
        this.addQuad([p3, p2, p6, p7], color); // east
    }

    /**
     * Adds a rotated cube to the buffer set.
     * @param {number} cx Center x
     * @param {number} cy Center y
     * @param {number} cz Center z
     * @param {number} r Radius (half width)
     * @param {number} color The color
     * @param {number} theta The rotation (in radians)
     */
    addRotatedCube(cx, cy, cz, r, color, theta) {
        let cp = vec3.fromValues(cx, cy, cz);

        let p = [
            vec3.fromValues(-r,  r,  r),
            vec3.fromValues( r,  r,  r),
            vec3.fromValues( r,  r, -r),
            vec3.fromValues(-r,  r, -r),
            vec3.fromValues(-r, -r,  r),
            vec3.fromValues( r, -r,  r),
            vec3.fromValues( r, -r, -r),
            vec3.fromValues(-r, -r, -r),
        ];

        for (let i = 0; i < p.length; i++) {
            vec3.rotateY(p[i], p[i], origin, theta);
            vec3.add(p[i], p[i], cp);
        }

        this.addQuad([p[0], p[1], p[2], p[3]], color); // top
        this.addQuad([p[7], p[6], p[5], p[4]], color); // bottom

        this.addQuad([p[1], p[0], p[4], p[5]], color); // north
        this.addQuad([p[3], p[2], p[6], p[7]], color); // south
        this.addQuad([p[0], p[3], p[7], p[4]], color); // west
        this.addQuad([p[2], p[1], p[5], p[6]], color); // east
    }

    /**
     * Updates the webgl buffers with the current buffer state.
     */
    updateBuffers() {
        gl.bindBuffer(ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(ARRAY_BUFFER, this.positions, this.usage);

        gl.bindBuffer(ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(ARRAY_BUFFER, this.colorBytes, this.usage);

        gl.bindBuffer(ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(ARRAY_BUFFER, this.normals, this.usage);
    }

    /**
     * Draw the scene.
     */
    render() {
        if (this.colorCount === 0) {
            // Do nothing if buffer is empty
            return;
        }

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            let numComponents = 3;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(
                engine.geometryShader.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }

        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.
        {
            let numComponents = 4;
            let type = UNSIGNED_BYTE;
            let normalize = true;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(
                engine.geometryShader.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }

        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.
        {
            let numComponents = 3;
            let type = FLOAT;
            let normalize = false;
            let stride = 0;
            let offset = 0;
            gl.bindBuffer(ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                engine.geometryShader.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
        }

        // Draw the triangles
        gl.drawArrays(TRIANGLES, 0, this.colorCount);

        if (DEBUG) {
            drawCount++;
            triangleCount += (this.colorCount / 3);
        }
    }
}
