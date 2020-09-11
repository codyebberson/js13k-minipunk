

/**
 * Vertex shader program.
 *
 * @const {string}
 */
let vsSource =
    // a = attribute vec4 aVertexPosition;
    'attribute vec4 a;' +
    // b = attribute vec4 aColor;
    'attribute vec4 b;' +
    // c = attribute vec3 aNormal;
    'attribute vec3 c;' +
    // d = uniform mat4 uModelViewMatrix;
    'uniform mat4 d;' +
    // e = uniform mat4 uProjectionMatrix;
    'uniform mat4 e;' +
    // h = player viewpoint (in 3rd-pov, this is different than camera viewpoint)
    'uniform vec3 h;' +
    // f = varying highp vec4 vColor;
    'varying highp vec4 f;' +
    // i = distance from player viewpoint to the vertex
    'varying highp float i;' +
    // // Fog color
    'void main(void){' +
    // Position is the product of uProjectionMatrix * uModelViewMatrix * aVertexPosition
    'gl_Position=e*d*a;' +
    // If this is a "light", then don't apply directional lighting
    'if (b.r>0.9||b.g>0.9||b.b>0.9){' +
    'f=b;' +
    '}else{' +
    // Light source is (-0.5, 0.6, -0.7)
    // highp vec3 directionalVector
    'highp vec3 j=normalize(vec3(-0.5,0.6,-0.7));' +
    // highp float directional
    'highp float k=0.4+0.6*max(dot(c,j),0.0);' +
    'f=vec4(k*b.rgb,1.0);' +
    '}' +
    'i=distance(a.xyz,h);' +
    '}';

/**
 * Fragment shader program.
 *
 * Sky/fog color = 124, 173, 203 = 0.48, 0.68, 0.80
 *
 * @const {string}
 */
let fsSource =
    // f = varying highp vec4 vColor;
    'varying highp vec4 f;' +
    // i = distance from player viewpoint to the vertex
    'varying highp float i;' +
    'void main(void){' +
    'if (f.r>0.9||f.g>0.9||f.b>0.9){' +
    'gl_FragColor=f;' +
    '}else{' +
    // highp vec4 fogColor
    'highp vec4 m=vec4(0.2,0.4,0.5,1.0);' +
    // highp float fogDist=400.0;
    // highp float fogFactor=(fogDist-i)/(fogDist-20.0);
    'highp float n=(400.0-i)/(380.0);' +
    'n=clamp(n,0.0,1.0);' +
    'gl_FragColor=mix(m,f,n);' +
    '}' +
    '}';

/**
 * The GeometryShader is the main shader program for 3D geometry.
 */
class GeometryShader extends Shader {

    constructor() {
        super(vsSource, fsSource);

        /**
         * Position of the vertex position attribute.
         * @type {!GLint}
         * @const
         */
        this.vertexPosition = this.getAttribLocation('a');

        /**
         * Position of the vertex position attribute.
         * @type {!GLint}
         * @const
         */
        this.vertexColor = this.getAttribLocation('b');

        /**
         * Position of the vertex position attribute.
         * @type {!GLint}
         * @const
         */
        this.vertexNormal = this.getAttribLocation('c');

        /**
         * Position of the model view matrix uniform.
         * @type {!WebGLUniformLocation}
         * @const
         */
        this.modelViewMatrix = this.getUniformLocation('d');

        /**
         * Position of the model view matrix uniform.
         * @type {!WebGLUniformLocation}
         * @const
         */
        this.projectionMatrix = this.getUniformLocation('e');

        /**
         * Position of the model view matrix uniform.
         * @type {!WebGLUniformLocation}
         * @const
         */
        this.playerPosition = this.getUniformLocation('h');
    }
}
