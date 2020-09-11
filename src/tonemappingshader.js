
let TONE_MAPPING_VERTEX_SHADER_SOURCE =
    // attribute vec2 aVertexPosition;
    'attribute vec2 a;' +
    // attribute vec2 aTextureCoord;
    'attribute vec2 b;' +
    // varying highp vec2 vTextureCoord;
    'varying highp vec2 c;' +
    'void main(void){' +
        'gl_Position=vec4(a.x,a.y,0.0,1.0);' +
        'c=b;' +
    '}';

let TONE_MAPPING_FRAGMENT_SHADER_SOURCE =
    // varying highp vec2 vTextureCoord;
    'varying highp vec2 c;' +
    // uniform sampler2D scene;
    'uniform sampler2D d;' +
    // uniform sampler2D bloomBlur;
    'uniform sampler2D e;' +
    'void main(void) {' +
        // highp vec4 hdrColor
        'highp vec4 f=texture2D(d,c);' +
        // highp vec4 bloomColor
        'highp vec4 g=texture2D(e,c);' +
        'gl_FragColor=vec4(f.rgb+2.0*g.a*g.rgb,1.0);' +
    '}';

class ToneMappingShader extends Shader {
    constructor() {
        super(TONE_MAPPING_VERTEX_SHADER_SOURCE, TONE_MAPPING_FRAGMENT_SHADER_SOURCE);

        /**
         * Position of the vertex position attribute.
         * @const {!GLint}
         */
        this.vertexPosition = this.getAttribLocation('a');

        /**
         * Position of the vertex position attribute.
         * @const {!GLint}
         */
        this.textureCoord = this.getAttribLocation('b');

        /**
         * Position of the model view matrix uniform.
         * @const {!WebGLUniformLocation}
         */
        this.scene = this.getUniformLocation('d');

        /**
         * Position of the model view matrix uniform.
         * @const {!WebGLUniformLocation}
         */
        this.bloomBlur = this.getUniformLocation('e');
    }
}
