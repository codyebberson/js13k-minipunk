// Sonant-X
//
// Copyright (c) 2020 Cody Ebberson
// Copyright (c) 2018 Dominic Szablewski, phoboslab.org
// Copyright (c) 2014 Nicolas Vanhoren
//
// Sonant-X is a fork of js-sonant by Marcus Geelnard and Jake Taylor. It is
// still published using the same license (zlib license, see below).
//
// Copyright (c) 2011 Marcus Geelnard
// Copyright (c) 2008-2009 Jake Taylor
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source
//    distribution.

/**
 * Samples per second
 * @const {number}
 */
let WAVE_SPS = 44100;

/**
 * Custom oscillator
 * Roughly a sin wave with overdrive distortion
 * Most notable with big bass
 * @param {number} value
 * @return {number}
 */
function oscillator(value) {
    return 2.0 * Math.max(-0.3, Math.min(0.3, Math.sin(value * 6.283184)));
}

/**
 * Returns a note frequency.
 * @param {number} n
 * @return {number}
 */
function getNoteFrequency(n) {
    return 0.00390625 * Math.pow(1.059463094, n - 128);
}

/**
 * @param {!Float32Array} samples
 * @param {!SonantInstrument} instr
 * @param {number} rowLen
 */
function applyDelay(samples, instr, rowLen) {
    let p1 = (instr.w * rowLen) >> 1;
    let t1 = instr.x / 255;

    let n1 = 0;
    while (n1 < samples.length - p1) {
        let b1 = n1;
        let l = (n1 + p1);
        samples[l] += samples[b1] * t1;
        n1++;
    }
}

/**
 * @param {!Float32Array} samples
 * @return {!AudioBuffer}
 */
function getAudioBuffer(samples) {
    // Create Mono Source Buffer from Raw Binary
    let buffer = audioCtx.createBuffer(1, samples.length, WAVE_SPS);
    buffer.getChannelData(0).set(samples);
    return buffer;
}

class SoundGenerator {

    /**
     * Creates a new SoundGenerator.
     * @param {!SonantInstrument} instr
     * @param {number=} rowLen
     */
    constructor(instr, rowLen) {
        this.instr = instr;

        /** @type {number} */
        this.b = rowLen || 5605;

        this.attack = instr.o;
        this.sustain = instr.q;
        this.release = instr.r;
    }

    /**
     * @param {number} n
     * @param {!Float32Array} chnBuf
     * @param {number} currentpos
     */
    genSound(n, chnBuf, currentpos) {
        let c1 = 0;
        let c2 = 0;

        // Precalculate frequencues
        let o1t = getNoteFrequency(n + (this.instr.a - 8) * 12 + this.instr.b) * (1 + 0.0008 * this.instr.d);
        let o2t = getNoteFrequency(n + (this.instr.h - 8) * 12 + this.instr.i) * (1 + 0.0008 * this.instr.j);

        // State variable init
        let q = this.instr.v / 255;
        let low = 0;
        let band = 0;

        let chnbufLength = chnBuf.length;
        let numSamples = this.attack + this.sustain + this.release - 1;

        for (let j = numSamples; j >= 0; --j) {
            let k = j + currentpos;

            // Envelope
            // e is in the range 0.0 to 1.0
            // 0.0 is silent, before attack and after release
            // 1.0 is full volume, during sustain
            let e = 1;
            if (j < this.attack) {
                e = j / this.attack;
            } else if (j >= this.attack + this.sustain) {
                e -= (j - this.attack - this.sustain) / this.release;
            }

            // Oscillator 1
            let t = o1t;
            if (this.instr.e) {
                t *= e * e;
            }
            c1 += t;
            let rsample = oscillator(c1) * this.instr.f;

            // Oscillator 2
            t = o2t;
            if (this.instr.k) {
                t *= e * e;
            }
            c2 += t;
            rsample += oscillator(c2) * this.instr.l;

            // Noise oscillator
            if (this.instr.n) {
                rsample += (2 * Math.random() - 1) * this.instr.n * e;
            }

            rsample *= e / 255;

            // State variable filter
            let f = 1.5 * Math.sin(this.instr.u * 3.141592 / WAVE_SPS);
            low += f * band;
            let high = q * (rsample - band) - low;
            band += f * high;
            switch (this.instr.t) {
                case 1: // Hipass
                    rsample = high;
                    break;
                case 2: // Lopass
                    rsample = low;
                    break;
                case 3: // Bandpass
                    rsample = band;
                    break;
                case 4: // Notch
                    rsample = low + high;
                    break;
                default:
            }

            // Panning & master volume
            rsample *= 0.00476 * this.instr.s; // 39 / 8192 = 0.00476

            // Add to 16-bit channel buffer
            // k = k * 2;
            if (k < chnbufLength) {
                chnBuf[k] += rsample;
            }
        }
    }

    /**
     * @param {number} n
     * @param {!Function} callBack
     */
    createAudioBuffer(n, callBack) {
        let bufferSize = (this.attack + this.sustain + this.release - 1) + (32 * this.b);
        let buffer = new Float32Array(bufferSize);
        this.genSound(n, buffer, 0);
        applyDelay(buffer, this.instr, this.b);

        callBack(getAudioBuffer(buffer));
    }
}

class MusicGenerator {

    /**
     * Creates a new MusicGenerator.
     * @param {!SonantSong} song
     */
    constructor(song) {
        this.song = song;
        this.waveSize = WAVE_SPS * song.a; // Total song size (in samples)
    };

    /**
     * @param {!SonantInstrument} instr
     * @param {!Float32Array} mixBuf
     * @param {!Function} callBack
     */
    generateTrack(instr, mixBuf, callBack) {
        let chnBuf = new Float32Array(this.waveSize),
            rowLen = this.song.b,
            endPattern = this.song.c,
            soundGen = new SoundGenerator(instr, rowLen);

        let currentpos = 0;
        let p = 0;
        let row = 0;
        while (p < endPattern - 1) {
            let cp = instr.p[p];
            if (cp) {
                let n = instr.c[cp - 1].n[row];
                if (n) {
                    soundGen.genSound(n, chnBuf, currentpos);
                }
            }
            currentpos += rowLen;
            if (++row === 32) {
                row = 0;
                p++;
            }
        }
        applyDelay(chnBuf, instr, rowLen);
        for (let b2 = 0; b2 < chnBuf.length; b2++) {
            mixBuf[b2] += chnBuf[b2];
        }
        callBack();
    }

    /**
     * @param {!Function} callBack
     */
    getAudioGenerator(callBack) {
        let self = this;
        let mixBuf = new Float32Array(this.waveSize);
        let track = 0;

        let nextTrack = function () {
            if (track < self.song.d.length) {
                track += 1;
                self.generateTrack(self.song.d[track - 1], mixBuf, nextTrack);
            }
            else {
                callBack(mixBuf);
            }
        };
        nextTrack();
    }

    /**
     * @param {!Function} callBack
     */
    createAudioBuffer(callBack) {
        this.getAudioGenerator(ag => callBack(getAudioBuffer(ag)));
    }
}


/**
 * Generates a song.
 * @param {!SonantSong} song_data
 * @param {!Function} callback
 */
function generateSong(song_data, callback) {
    new MusicGenerator(song_data).createAudioBuffer(callback);
}

/**
 * Generates a sound clip.
 * @param {!SonantInstrument} instrument
 * @param {number} note
 * @param {!Function} callback
 */
function generateSound(instrument, note, callback) {
    new SoundGenerator(instrument).createAudioBuffer(note, callback);
}
