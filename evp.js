// ============================================
// EVP — голоса мёртвых
// ============================================

const EVP = {
  active: false,
  phrases: [
    'выйди из дома', 'я за твоей спиной', 'посмотри на меня',
    'не оставляй меня здесь', 'я тоже был здесь', 'мы все здесь',
    'ты следующий', 'помоги мне', 'я не могу дышать', 'сзади'
  ],

  async play(customPhrase = null) {
    if (this.active) return;
    this.active = true;

    const el = document.getElementById('evp-recorder');
    if (el) {
      el.classList.remove('hidden');
      const wave = document.getElementById('evp-wave');
      if (wave) {
        wave.innerHTML = '';
        for (let i = 0; i < 30; i++) {
          const span = document.createElement('span');
          span.style.animationDuration = (0.3 + Math.random() * 0.5) + 's';
          wave.appendChild(span);
        }
      }
    }

    try { await this.playEVPSound(); } catch (e) {}

    const phrase = customPhrase || this.phrases[Math.floor(Math.random() * this.phrases.length)];
    this.speakWithEffects(phrase);

    setTimeout(() => {
      if (el) el.classList.add('hidden');
      this.active = false;
    }, 3500);
  },

  async playEVPSound() {
    return new Promise(resolve => {
      try {
        GameAudio.init();
        if (!GameAudio.ctx) return resolve();
        const ctx = GameAudio.ctx;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 1500; filter.Q.value = 1.5;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
        gain.gain.linearRampToValueAtTime(0.15, now + 2.5);
        gain.gain.linearRampToValueAtTime(0, now + 3);

        src.connect(filter); filter.connect(gain); gain.connect(GameAudio.masterGain);
        src.start(now); src.stop(now + 3);
        resolve();
      } catch (e) { resolve(); }
    });
  },

  speakWithEffects(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      u.pitch = 0.05;
      u.rate = 0.55;
      u.volume = 0.35;
      speechSynthesis.speak(u);
    } catch (e) {}
  },

  hidden(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      u.pitch = 0.1;
      u.rate = 0.5;
      u.volume = 0.08;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
};