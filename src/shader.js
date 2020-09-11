
class Shader {

    /**
     * Initialize a shader program, so WebGL knows how to draw our data.
     * @param {string} vertexShaderSource
     * @param {string} fragmentShaderSource
     */
    constructor(vertexShaderSource, fragmentShaderSource) {
        let vertexShader = loadShader(VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = loadShader(FRAGMENT_SHADER, fragmentShaderSource);

        /**
         * The WebGL program.
         * @type {!WebGLProgram}
         * @const
         */
        this.program = gl.createProgram();

        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (DEBUG) {
            if (!gl.getProgramParameter(this.program, LINK_STATUS)) {
                var info = gl.getProgramInfoLog(this.program);
                log('link status:');
                log(info);
                throw 'Could not compile WebGL program. \n\n' + info;
            }
        }
    }

    /**
     * Returns the location of an attribute variable.
     * @param {string} name
     * @return {!GLint}
     */
    getAttribLocation(name) {
        let location = gl.getAttribLocation(this.program, name);
        gl.enableVertexAttribArray(location);
        return location;
    }

    /**
     * Returns the location of a uniform variable.
     * @param {string} name
     * @return {!WebGLUniformLocation}
     */
    getUniformLocation(name) {
        return /** @type {!WebGLUniformLocation} */ (gl.getUniformLocation(this.program, name));
    }

    /**
     * Binds the shader for rendering.
     */
    bind() {
        gl.useProgram(this.program);
    }
}

/**
 * Creates a shader of the given type, uploads the source and compiles it.
 * @param {!GLenum} type
 * @param {string} source
 * @return {!WebGLShader}
 */
function loadShader(type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (DEBUG) {
        var compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
        log('Shader compiled successfully: ' + compiled);
        var compilationLog = gl.getShaderInfoLog(shader);
        log('Shader compiler log: ' + compilationLog);
    }

    return shader;
}
