
let BLOOM_vsSource =
    // attribute vec2 aVertexPosition;
    'attribute vec2 a;' +
    // attribute vec2 aTextureCoord;
    'attribute vec2 b;' +
    // varying highp vec2 vTextureCoord;
    'varying highp vec2 c;' +
    'void main(void){' +
      'gl_Position=vec4(a.x,a.y,-1.0,1.0);' +
      'c=b;' +
    '}';

let BLOOM_fsSource =
    // varying highp vec2 vTextureCoord;
    'varying highp vec2 c;' +
    // uniform int uIteration;
    'uniform int d;' +
    // uniform sampler2D uSampler;
    'uniform sampler2D e;' +
    // highp float weights[11];
    'highp float w[11];' +
    'void main(void){' +
        'w[0]=0.01;' +
        'w[1]=0.02;' +
        'w[2]=0.04;' +
        'w[3]=0.08;' +
        'w[4]=0.16;' +
        'w[5]=0.38;' +
        'w[6]=0.16;' +
        'w[7]=0.08;' +
        'w[8]=0.04;' +
        'w[9]=0.02;' +
        'w[10]=0.01;' +
        'if(d==0){' +
            // highp vec4 pointColor = texture2D(uSampler, vTextureCoord);
            'highp vec4 f=texture2D(e,c);' +
            'if(f.r>0.95||f.g>0.95||f.b>0.95){' +
                'gl_FragColor=f;' +
            '}else{' +
                'discard;' +
            '}' +
        '} else if(d==1||d==3){' +
            // highp vec4 texColor = vec4(0.0);
            'highp vec4 g=vec4(0.0);' +
            // highp float sum = 0.0;
            'highp float s=0.0;' +
            'for (int x=-5;x<=5;x++){' +
                'highp vec4 f=texture2D(e, c + vec2(float(x)/512.0, 0.0));' +
                'g.rgb +=w[x + 5] * f.rgb * f.a;' +
                's +=w[x + 5] * f.a;' +
            '}' +
            'if(s==0.0){' +
                'gl_FragColor=vec4(0.0);' +
            '}else{' +
                'g.rgb/=s;' +
                'g.a=s;' +
                'gl_FragColor=g;' +
            '}' +
        '}else{' +
            'highp vec4 g=vec4(0.0);' +
            'highp float s=0.0;' +
            'for(int y=-5;y<=5;y++){' +
                'highp vec4 f=texture2D(e,c+vec2(0.0, float(y)/512.0));' +
                'g.rgb+=w[y+5]*f.rgb*f.a;' +
                's+=w[y+5]*f.a;' +
            '}' +
            'if(s==0.0){' +
                'gl_FragColor=vec4(0.0);' +
            '}else{' +
                'g.rgb/=s;' +
                'g.a=s;' +
                'gl_FragColor=g;' +
            '}' +
        '}' +
    '}';

class BloomShader extends Shader {
    constructor() {
        super(BLOOM_vsSource, BLOOM_fsSource);

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
        this.uIteration = this.getUniformLocation('d');

        /**
         * Position of the model view matrix uniform.
         * @const {!WebGLUniformLocation}
         */
        this.uSampler = this.getUniformLocation('e');
    }
}
