
/** @typedef {!Object} */
var localStorage;

/** @typedef {number} */
var GLenum;

/** @typedef {number} */
var GLint;

/** @constructor */
var SonantPattern = function () { };

/** @type {!Array.<number>} */
SonantPattern.prototype.n;

/** @constructor */
var SonantInstrument = function () { };

/**
 * osc1_oct
 * @type {number}
 */
SonantInstrument.prototype.a;

/**
* osc1_det
* @type {number}
*/
SonantInstrument.prototype.b;

/**
* osc1_detune
* @type {number}
*/
SonantInstrument.prototype.d;

/**
* osc1_xenv
* @type {number}
*/
SonantInstrument.prototype.e;

/**
* osc1_vol
* @type {number}
*/
SonantInstrument.prototype.f;

/**
* osc2_oct
* @type {number}
*/
SonantInstrument.prototype.h;

/**
* osc2_det
* @type {number}
*/
SonantInstrument.prototype.i;

/**
* osc2_detune
* @type {number}
*/
SonantInstrument.prototype.j;

/**
* osc2_xenv
* @type {number}
*/
SonantInstrument.prototype.k;

/**
* osc2_vol
* @type {number}
*/
SonantInstrument.prototype.l;

/**
* noise_fader
* @type {number}
*/
SonantInstrument.prototype.n;

/**
* env_attack
* @type {number}
*/
SonantInstrument.prototype.o;

/**
* env_sustain
* @type {number}
*/
SonantInstrument.prototype.q;

/**
* env_release
* @type {number}
*/
SonantInstrument.prototype.r;

/**
* env_master
* @type {number}
*/
SonantInstrument.prototype.s;

/**
* fx_filter
* @type {number}
*/
SonantInstrument.prototype.t;

/**
* fx_freq
* @type {number}
*/
SonantInstrument.prototype.u;

/**
* fx_resonance
* @type {number}
*/
SonantInstrument.prototype.v;

/**
* fx_delay_time
* @type {number}
*/
SonantInstrument.prototype.w;

/**
* fx_delay_amt
* @type {number}
*/
SonantInstrument.prototype.x;

/**
* fx_pan_freq
* @type {number}
*/
SonantInstrument.prototype.y;

/**
* fx_pan_amt
* @type {number}
*/
SonantInstrument.prototype.z;

/** @type {!Array.<number>} */
SonantInstrument.prototype.p;

/** @type {!Array.<!SonantPattern>} */
SonantInstrument.prototype.c;

/** @constructor */
var SonantSong = function () { };

/**
 * songLen
 * @type {number}
 */
SonantSong.prototype.a;

/**
 * rowLen
 * @type {number}
 */
SonantSong.prototype.b;

/**
 * endPattern
 * @type {number}
 */
SonantSong.prototype.c;

/**
 * songData
 * @type {!Array.<!SonantInstrument>}
 */
SonantSong.prototype.d;
