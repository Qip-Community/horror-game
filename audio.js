// ============================================
// Web Audio API — все звуки синтезируются на лету
// Никаких mp3-файлов, всё работает оффлайн
// ============================================

const Audio = {
  ctx: null,
  masterGain: null,
  ambientNodes: [],
  ambientPlaying: false,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext failed', e);
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  // ===== ФОНОВЫЙ ЭМБИЕНТ =====
  startAmbient() {
    this.init();
    if (!this.ctx || this.ambientPlaying) return;
    this.ambientPlaying = true;

    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.value = 40;
    droneGain.gain.value = 0.06;
    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(drone.frequency);
    lfo.start();

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value = 0.7;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.035;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();

    this.ambientNodes = [drone, lfo, noise];
  },

  stopAmbient() {
    this.ambientNodes.forEach(n => { try { n.stop(); } catch(e){} });
    this.ambientNodes = [];
    this.ambientPlaying = false;
  },

  // ===== СКРИМЕР (жёсткий, резкий) =====
  playScreamer() {
    this.init();
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Резкий шум
    const bufferSize = this.ctx.sampleRate * 1.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.3);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3500, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 1.8);
    noiseFilter.Q.value = 6;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // Резкий вопль
    const scream = this.ctx.createOscillator();
    const screamGain = this.ctx.createGain();
    scream.type = 'sawtooth';
    scream.frequency.setValueAtTime(1600, now);
    scream.frequency.exponentialRampToValueAtTime(60, now + 1.5);
    screamGain.gain.setValueAtTime(0.5, now);
    screamGain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
    scream.connect(screamGain);
    screamGain.connect(this.masterGain);
    scream.start(now);
    scream.stop(now + 1.6);

    // Суб-бас
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

    // Высокий писк-резонанс
    const high = this.ctx.createOscillator();
    const highGain = this.ctx.createGain();
    high.type = 'square';
    high.frequency.setValueAtTime(4500, now);
    high.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
    highGain.gain.setValueAtTime(0.15, now);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    high.connect(highGain);
    highGain.connect(this.masterGain);
    high.start(now);
    high.stop(now + 0.5);
  },

  // ===== ШЁПОТ =====
  playWhisper() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
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

    // TTS шёпот
    if ('speechSynthesis' in window) {
      const whispers = [
        'не оборачивайся...', 'оно рядом...', 'я вижу тебя...',
        'останься со мной...', 'ты уже мёртв...', 'ещё шаг...',
        'помоги мне...', 'смотри...', 'я здесь...', 'беги...',
        'я знаю, где ты...', 'выйди...', 'открой дверь...'
      ];
      try {
        const u = new SpeechSynthesisUtterance(whispers[Math.floor(Math.random() * whispers.length)]);
        u.volume = 0.1;
        u.rate = 0.55;
        u.pitch = 0.1;
        u.lang = 'ru-RU';
        speechSynthesis.speak(u);
      } catch (e) {}
    }
  },

  // ===== ШАГ =====
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

  // ===== СКРИП =====
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
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
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

  // ===== СЕРДЦЕ =====
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
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  },

  // ===== КЛИК =====
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

  // ===== ГЛУХОЙ УДАР =====
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

  // ===== СТУК В ДВЕРЬ =====
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
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }
};