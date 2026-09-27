// ============================================
// GameScreamer — картинки + видео
// ============================================

const GameScreamer = {
  IMAGES: {
    girl: 'assets/girl.png',
    smile: 'assets/smile.jpg',
    scream: 'assets/scream.jpg'
  },

  VIDEO: 'assets/scary.mp4',
  pool: [
    { key: 'smile', weight: 4 },
    { key: 'scream', weight: 4 },
    { key: 'girl', weight: 3 },
    { key: 'video', weight: 2 }
  ],
  active: false,
  videoAvailable: null,

  pickRandom() {
    const total = this.pool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const item of this.pool) {
      r -= item.weight;
      if (r <= 0) return item.key;
    }
    return 'smile';
  },

  async checkVideo() {
    if (this.videoAvailable !== null) return this.videoAvailable;
    try {
      const res = await fetch(this.VIDEO, { method: 'HEAD' });
      this.videoAvailable = res.ok;
    } catch (e) {
      this.videoAvailable = false;
    }
    return this.videoAvailable;
  },

  async show(duration = 900, forceKey = null, opts = {}) {
    if (this.active) return;
    this.active = true;

    const screamerEl = document.getElementById('screamer');
    const contentEl = document.getElementById('screamer-content');
    const flash = document.getElementById('flash');
    let key = forceKey || this.pickRandom();

    if (key === 'video') {
      const hasVideo = await this.checkVideo();
      if (!hasVideo) key = 'scream';
    }

    if (flash) {
      flash.classList.add('active');
      if (opts.red) flash.classList.add('red');
      setTimeout(() => {
        flash.classList.remove('active');
        flash.classList.remove('red');
      }, 90);
    }

    contentEl.innerHTML = '';

    if (key === 'video') {
      const video = document.createElement('video');
      video.src = this.VIDEO;
      video.autoplay = true;
      video.muted = false;
      video.playsInline = true;
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      contentEl.appendChild(video);
      video.play().catch(() => {});
    } else {
      const img = document.createElement('img');
      img.src = this.IMAGES[key];
      if (key === 'girl') img.className = 'girl';
      if (opts.glitch) img.classList.add('glitch-img');
      img.alt = '';
      img.draggable = false;
      contentEl.appendChild(img);
    }

    screamerEl.classList.remove('hidden');

    try {
      if (opts.double) GameAudio.playDoubleScream();
      else GameAudio.playScream();
    } catch(e) {}

    if (opts.static) {
      const so = document.getElementById('static-overlay');
      if (so) {
        so.classList.add('active');
        setTimeout(() => so.classList.remove('active'), duration);
      }
    }

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

  digital(duration = 1400) {
    this.show(duration, 'video', { static: true, glitch: true });
  },

  final() {
    this.show(1500, 'scream', { double: true, red: true, glitch: true });
    setTimeout(() => this.show(1600, 'girl', { glitch: true }), 2200);
    setTimeout(() => this.show(2200, 'video', { double: true, red: true, static: true }), 4400);
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