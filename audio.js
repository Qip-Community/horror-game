// ============================================
// GameAudio — БЕЗ конфликтов с браузерным Audio
// ============================================

const GameAudio = {
  ctx: null,
  masterGain: null,
  ambientNodes: [],

  ambient: null,
  scream: null,
  scream2: null,

  ambientPlaying: false,
  ready: false,

  init() {
    if (this.ready) return;

    this.ambient = document.getElementById('ambient-audio');
    this.scream = document.getElementById('scream-audio');
    this.scream2 = document.getElementById('scream-audio-2');

    if (this.ambient) {
      this.ambient.volume = 0.35;
      this.ambient.loop = true;
    }
    if (this.scream) this.scream.volume = 1.0;
    if (this.scream2) this.scream2.volume = 0.9;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio not available', e);
    }

    this.ready = true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  startAmbient() {
    this.init();
    if (!this.ambient || this.ambientPlaying) return;

    this.ambient.volume = 0;
    const p = this.ambient.play();
    if (p && p.then) {
      p.then(() => {
        this.ambientPlaying = true;
        let v = 0;
        const fade = setInterval(() => {
          v += 0.02;
          if (v >= 0.35) { v = 0.35; clearInterval(fade); }
          this.ambient.volume = v;
        }, 50);
      }).catch(e => console.warn('Ambient autoplay blocked:', e));
    }
  },

  stopAmbient() {
    if (this.ambient) {
      let v = this.ambient.volume;
      const fade = setInterval(() => {
        v -= 0.03;
        if (v <= 0) {
          v = 0;
          clearInterval(fade);
          try {
            this.ambient.pause();
            this.ambient.currentTime = 0;
          } catch (e) {}
        }
        this.ambient.volume = Math.max(0, v);
      }, 50);
    }
    this.ambientPlaying = false;
  },

  duckAmbient(volume = 0.05, duration = 2000) {
    if (!this.ambient) return;
    const orig = this.ambient.volume;
    this.ambient.volume = volume;
    setTimeout(() => {
      if (this.ambient) this.ambient.volume = orig;
    }, duration);
  },

  playScream() {
    this.init();
    if (!this.scream) return this.synthesizeScream();
    try {
      this.scream.currentTime = 0;
      this.scream.volume = 1.0;
      const p = this.scream.play();
      if (p && p.catch) p.catch(() => this.synthesizeScream());
    } catch (e) {
      this.synthesizeScream();
    }
    this.duckAmbient(0.05, 2500);
  },

  playDoubleScream() {
    this.playScream();
    if (this.scream2) {
      setTimeout(() => {
        try {
          this.scream2.currentTime = 0;
          this.scream2.volume = 0.85;
          this.scream2.playbackRate = 0.92;
          this.scream2.play().catch(() => {});
        } catch (e) {}
      }, 250);
    }
  },

  synthesizeScream() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.5);
    filter.Q.value = 6;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.6);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.7);
  },

  playWhisper() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.linearRampToValueAtTime(0, now + 1.2);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);

    if ('speechSynthesis' in window) {
      const whispers = [
        'не оборачивайся...', 'оно рядом...', 'я вижу тебя...',
        'останься со мной...', 'ты уже мёртв...', 'ещё шаг...',
        'помоги мне...', 'смотри...', 'я здесь...', 'беги...',
        'я знаю, где ты...', 'открой дверь...', 'сзади...'
      ];
      try {
        const u = new SpeechSynthesisUtterance(whispers[Math.floor(Math.random() * whispers.length)]);
        u.volume = 0.12;
        u.rate = 0.5;
        u.pitch = 0.1;
        u.lang = 'ru-RU';
        speechSynthesis.speak(u);
      } catch (e) {}
    }
  },

  playStep() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  },

  playCreak() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(180, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 8;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.5);
  },

  playHeartbeat() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  },

  playClick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  },

  playThud() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  playKnock() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 150;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  },

  playGrowl() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(35, now + 2);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(120, now + 2);
    filter.Q.value = 5;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 2);
  }
};