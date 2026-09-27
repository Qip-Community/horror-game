// ============================================
// GameScreamer — обычные скримеры
// ============================================

const GameScreamer = {
  IMAGES: {
    girl: 'assets/girl.png',
    smile: 'assets/smile.jpg',
    scream: 'assets/scream.jpg'
  },

  pool: [
    { key: 'smile', weight: 4 },
    { key: 'scream', weight: 4 },
    { key: 'girl', weight: 3 }
  ],

  active: false,

  pickRandom() {
    const total = this.pool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const item of this.pool) {
      r -= item.weight;
      if (r <= 0) return item.key;
    }
    return 'smile';
  },

  show(duration = 900, forceKey = null, opts = {}) {
    if (this.active) return;
    this.active = true;

    const screamerEl = document.getElementById('screamer');
    const contentEl = document.getElementById('screamer-content');
    const flash = document.getElementById('flash');
    const key = forceKey || this.pickRandom();
    const src = this.IMAGES[key];

    if (flash) {
      flash.classList.add('active');
      if (opts.red) flash.classList.add('red');
      setTimeout(() => {
        flash.classList.remove('active');
        flash.classList.remove('red');
      }, 90);
    }

    contentEl.innerHTML = '';

    const img = document.createElement('img');
    img.src = src;
    if (key === 'girl') img.className = 'girl';
    if (opts.glitch) img.classList.add('glitch-img');
    img.alt = '';
    img.draggable = false;
    contentEl.appendChild(img);

    screamerEl.classList.remove('hidden');

    try {
      if (opts.double) GameAudio.playDoubleScream();
      else GameAudio.playScream();
    } catch(e) {}

    document.body.classList.add('trembling');
    setTimeout(() => document.body.classList.remove('trembling'), duration);

    if (navigator.vibrate) {
      try { navigator.vibrate([150, 60, 150, 60, 300, 60, 500]); } catch(e) {}
    }

    setTimeout(() => {
      screamerEl.classList.add('hidden');
      contentEl.innerHTML = '';
      this.active = false;
    }, duration);
  },

  mini() {
    if (this.active) return;
    const key = Math.random() < 0.5 ? 'smile' : 'scream';
    this.show(420, key);
  },

  girl(duration = 1400) { this.show(duration, 'girl'); },

  double(duration = 1600, key = 'scream') {
    this.show(duration, key, { double: true, red: true, glitch: true });
  },

  final() {
    this.show(1500, 'scream', { double: true, red: true, glitch: true });
    setTimeout(() => this.show(1600, 'girl', { glitch: true }), 2200);
    setTimeout(() => this.show(2200, 'smile', { double: true, red: true, glitch: true }), 4400);
  },

  girlReveal() {
    const screamerEl = document.getElementById('screamer');
    const contentEl = document.getElementById('screamer-content');

    if (this.active) return;
    this.active = true;

    contentEl.innerHTML = '';
    const img = document.createElement('img');
    img.src = this.IMAGES.girl;
    img.className = 'girl';
    img.style.animation = 'none';
    img.style.opacity = '0';
    img.style.transition = 'opacity 2s';
    contentEl.appendChild(img);
    screamerEl.classList.remove('hidden');

    setTimeout(() => { img.style.opacity = '0.6'; }, 50);

    setTimeout(() => {
      img.style.transition = 'none';
      img.style.animation = 'girlAppear 0.4s';
      try { GameAudio.playScream(); } catch(e) {}
      document.body.classList.add('trembling');
      if (navigator.vibrate) {
        try { navigator.vibrate([200, 100, 400]); } catch(e) {}
      }
    }, 2000);

    setTimeout(() => {
      screamerEl.classList.add('hidden');
      contentEl.innerHTML = '';
      document.body.classList.remove('trembling');
      this.active = false;
    }, 3600);
  }
};