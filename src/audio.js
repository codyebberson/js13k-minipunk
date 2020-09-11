
/**
 * Global audio context.
 * @const {!AudioContext}
 */
let audioCtx = new AudioContext();

/**
 * Music gain.
 * @const {!GainNode}
 */
let musicGain = audioCtx.createGain();
musicGain.gain.value = 0.25;
musicGain.connect(audioCtx.destination);

/**
 * Sound gain.
 * @const {!GainNode}
 */
let soundGain = audioCtx.createGain();
soundGain.connect(audioCtx.destination);

/**
 * Sword/projectile collision sound effect.
 * @type {?AudioBuffer}
 */
let hitSoundEffect = null;

/**
 * Jump sound effect.
 * @type {?AudioBuffer}
 */
let jumpSoundEffect = null;

/**
 * Sword swing sound effect.
 * @type {?AudioBuffer}
 */
let swingSoundEffect = null;

/**
 * Initializes the audio system.
 */
function initAudio() {
    generateSong(songDefinition, buffer => {
        playAudio(buffer, true);
    });
    generateSound(hitSoundDefinition, 134, buffer => {
        hitSoundEffect = buffer;
    });
    generateSound(jumpSoundDefinition, 138, buffer => {
        jumpSoundEffect = buffer;
    });
    generateSound(swingSoundDefinition, 144, buffer => {
        swingSoundEffect = buffer;
    });
}

/**
 * Plays an audio buffer.
 * Handles null buffer in case not loaded yet.
 * The loop flag implies music, and therefore handled by music gain.
 * @param {?AudioBuffer} buffer
 * @param {boolean=} loop
 */
function playAudio(buffer, loop) {
    if (!buffer) {
        return;
    }
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = !!loop;
    source.connect(loop ? musicGain : soundGain);
    source.start();
}
