// Chiptune sound effects and music, made on the fly with Web Audio (no sound files).
// Browsers only allow sound after a click or a finger lifting, so unlock() runs on those.
import { SONG } from './song.js';

const STORE_KEY = 'catAttack.audio';

// MIDI note number -> frequency in Hz.
const hz = (note) => 440 * 2 ** ((note - 69) / 12);

function loadSettings() {
  try {
    return { sfx: true, music: true, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
  } catch {
    return { sfx: true, music: true };
  }
}

class Sound {
  constructor() {
    this.ctx = null;
    this.settings = loadSettings();
    this.lastPlayed = {};
    // Phones can pause audio at any time (a call, switching apps), so every tap tries to restart it.
    for (const event of ['touchend', 'pointerup', 'click', 'keydown']) {
      window.addEventListener(event, () => this.unlock(), { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend();
      else this.resume();
    });
  }

  resume() {
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  unlock() {
    if (this.ctx) {
      this.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.resume();
    // Older iPhones also need a sound to be started during the tap; this one is silent.
    const silence = this.ctx.createBufferSource();
    silence.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
    silence.connect(this.ctx.destination);
    silence.start(0);
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain.connect(this.ctx.destination);
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.gain.value = this.settings.sfx ? 0.5 : 0;
    this.musicGain.gain.value = this.settings.music ? 0.35 : 0;
    this.noiseBuffer = this.makeNoise();
    this.startMusic();
  }

  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.settings));
    } catch {
      // No saved settings (private window etc.); the toggle still works for this visit.
    }
  }

  toggleSfx() {
    this.settings.sfx = !this.settings.sfx;
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfx ? 0.5 : 0;
    this.save();
    return this.settings.sfx;
  }

  toggleMusic() {
    this.settings.music = !this.settings.music;
    if (this.musicGain) this.musicGain.gain.value = this.settings.music ? 0.35 : 0;
    this.save();
    return this.settings.music;
  }

  makeNoise() {
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // A beep. sweep: list of [seconds, Hz] the pitch slides through.
  tone({ type = 'square', sweep, vol = 0.3, at = 0, out = this.sfxGain }) {
    const t0 = this.ctx.currentTime + at;
    const end = t0 + sweep[sweep.length - 1][0];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(sweep[0][1], t0);
    for (const [t, f] of sweep.slice(1)) osc.frequency.linearRampToValueAtTime(f, t0 + t);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.linearRampToValueAtTime(0.0001, end);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(end + 0.02);
  }

  // A burst of hiss/crunch. filter: 'lowpass' (thuds) or 'highpass' (hisses).
  noise({ dur, vol = 0.3, filter = 'lowpass', freq = 1000, at = 0, out = this.sfxGain }) {
    const t0 = this.ctx.currentTime + at;
    const src = this.ctx.createBufferSource();
    const f = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    src.buffer = this.noiseBuffer;
    f.type = filter;
    f.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(gain).connect(out);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // Quick run of notes (MIDI numbers), each `step` seconds long.
  notes(list, { step = 0.07, type = 'square', vol = 0.2 } = {}) {
    list.forEach((n, i) => n && this.tone({ type, vol, at: i * step, sweep: [[0, hz(n)], [step * 0.95, hz(n)]] }));
  }

  play(name) {
    if (!this.ctx || !this.settings.sfx) return;
    // The same sound right on top of itself just gets louder; skip repeats within 40 ms.
    const now = this.ctx.currentTime;
    if (now - (this.lastPlayed[name] || 0) < 0.04) return;
    this.lastPlayed[name] = now;
    const effect = SFX[name];
    if (effect) effect(this);
  }

  // ---- music: a small step sequencer that schedules notes a little ahead of time ----

  startMusic() {
    this.step = 0;
    this.nextStepAt = this.ctx.currentTime + 0.1;
    setInterval(() => this.scheduleMusic(), 50);
  }

  scheduleMusic() {
    const stepLen = 60 / SONG.bpm / 2; // eighth notes
    while (this.nextStepAt < this.ctx.currentTime + 0.2) {
      const at = this.nextStepAt - this.ctx.currentTime;
      const i = this.step % SONG.melody.length;
      const lead = SONG.melody[i];
      if (lead) this.tone({ type: 'square', vol: 0.09, at, out: this.musicGain, sweep: [[0, hz(lead)], [stepLen * 0.9, hz(lead)]] });
      if (i % 2 === 0) {
        const bass = SONG.bass[i / 2];
        if (bass) this.tone({ type: 'triangle', vol: 0.25, at, out: this.musicGain, sweep: [[0, hz(bass)], [stepLen * 1.8, hz(bass)]] });
      } else {
        this.noise({ dur: 0.03, vol: 0.05, filter: 'highpass', freq: 6000, at, out: this.musicGain });
      }
      this.nextStepAt += stepLen;
      this.step++;
    }
  }
}

// Every sound effect in the game.
const SFX = {
  meow: (s) => s.tone({ type: 'triangle', vol: 0.35, sweep: [[0, 650], [0.07, 950], [0.25, 520]] }),
  pounce: (s) => s.tone({ vol: 0.12, sweep: [[0, 260], [0.08, 620]] }),
  squeak: (s) => {
    s.tone({ vol: 0.12, sweep: [[0, 1700], [0.05, 2500]] });
    s.notes([96, 100, 103], { step: 0.04, type: 'triangle', vol: 0.12 });
  },
  coin: (s) => s.notes([83, 88], { step: 0.06, vol: 0.1 }),
  chomp: (s) => {
    s.noise({ dur: 0.09, vol: 0.4, freq: 900 });
    s.tone({ vol: 0.15, sweep: [[0, 180], [0.1, 80]] });
  },
  cough: (s) => s.noise({ dur: 0.12, vol: 0.3, freq: 1500 }),
  splat: (s) => {
    s.noise({ dur: 0.18, vol: 0.45, freq: 500 });
    s.tone({ type: 'triangle', vol: 0.3, sweep: [[0, 220], [0.15, 60]] });
  },
  throw: (s) => s.tone({ type: 'triangle', vol: 0.2, sweep: [[0, 380], [0.12, 760]] }),
  ice: (s) => s.notes([91, 95, 98, 103], { step: 0.035, type: 'triangle', vol: 0.14 }),
  swipe: (s) => s.noise({ dur: 0.06, vol: 0.2, filter: 'highpass', freq: 2500 }),
  hiss: (s) => s.noise({ dur: 0.45, vol: 0.35, filter: 'highpass', freq: 3500 }),
  stomp: (s) => {
    s.tone({ type: 'triangle', vol: 0.6, sweep: [[0, 130], [0.3, 40]] });
    s.noise({ dur: 0.3, vol: 0.5, freq: 220 });
  },
  laser: (s) => s.tone({ vol: 0.1, sweep: [[0, 1600], [0.12, 280]] }),
  launch: (s) => s.tone({ vol: 0.12, sweep: [[0, 220], [0.16, 880]] }),
  boom: (s) => {
    s.noise({ dur: 0.25, vol: 0.45, freq: 700 });
    s.tone({ type: 'triangle', vol: 0.35, sweep: [[0, 160], [0.22, 50]] });
  },
  rocket: (s) => s.noise({ dur: 0.2, vol: 0.16, freq: 1200 }),
  heal: (s) => s.notes([84, 88], { step: 0.07, type: 'triangle', vol: 0.1 }),
  charge: (s) => s.notes([79, 84], { step: 0.05, vol: 0.09 }),
  reel: (s) => {
    s.noise({ dur: 0.12, vol: 0.2, freq: 1800 });
    s.tone({ type: 'triangle', vol: 0.18, sweep: [[0, 500], [0.18, 900]] });
  },
  zap: (s) => s.tone({ vol: 0.1, sweep: [[0, 900], [0.04, 1800], [0.08, 700], [0.14, 1500]] }),
  click: (s) => s.tone({ vol: 0.08, sweep: [[0, 1200], [0.03, 1200]] }),
  upgrade: (s) => s.notes([72, 76, 79, 84], { step: 0.07, vol: 0.14 }),
  sell: (s) => s.notes([84, 79, 76], { step: 0.06, vol: 0.12 }),
  wave: (s) => s.notes([69, null, 76], { step: 0.1, vol: 0.15 }),
  cleared: (s) => s.notes([72, 76, 79], { step: 0.08, vol: 0.14 }),
  boss: (s) => {
    s.tone({ vol: 0.2, sweep: [[0, 110], [0.5, 98]] });
    s.tone({ vol: 0.2, at: 0.5, sweep: [[0, 82], [0.6, 73]] });
  },
  win: (s) => s.notes([72, 76, 79, 84, null, 79, 84, 88], { step: 0.11, vol: 0.18 }),
  lose: (s) => s.notes([76, 72, 69, 64, null, 60], { step: 0.16, type: 'triangle', vol: 0.3 }),
};

export const sound = new Sound();
