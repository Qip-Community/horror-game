// ============================================
// Скримеры — твои картинки + mp3-звук
// ============================================

const Screamer = {
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

    // Красная или белая вспышка
    flash.classList.add('active');
    if (opts.red) flash.classList.add('red');
    setTimeout(() => {
      flash.classList.remove('active');
      flash.classList.remove('red');
    }, 90);

    contentEl.innerHTML = '';

    const img = document.createElement('img');
    img.src = src;
    if (key === 'girl') img.className = 'girl';
    img.alt = '';
    img.draggable = false;
    contentEl.appendChild(img);

    screamerEl.classList.remove('hidden');

    // Звук: обычный или двойной
    if (opts.double) {
      Audio.playDoubleScream();
    } else {
      Audio.playScream();
    }

    // Дрожание всего экрана
    document.body.classList.add('trembling');
    setTimeout(() => document.body.classList.remove('trembling'), duration);

    if (navigator.vibrate) {
      try { navigator.vibrate([150, 60, 150, 60, 300, 60, 500]); } catch(e){}
    }

    setTimeout(() => {
      screamerEl.classList.add('hidden');
      contentEl.innerHTML = '';
      this.active = false;
    }, duration);
  },

  // Мини-скример — быстро и без сильного звука
  mini() {
    if (this.active) return;
    const key = Math.random() < 0.5 ? 'smile' : 'scream';
    this.show(420, key, { soft: true });
  },

  // Девочка — особый, длинный
  girl(duration = 1400) {
    this.show(duration, 'girl');
  },

  // ДВОЙНОЙ — самый страшный, звук в два канала с задержкой
  double(duration = 1600, key = 'scream') {
    this.show(duration, key, { double: true, red: true });
  },

  // ФИНАЛЬНЫЙ — тройной удар: скример + пауза + девочка + пауза + кричащее
  final() {
    // Первый
    this.show(1500, 'scream', { double: true, red: true });

    // Второй — через паузу
    setTimeout(() => {
      this.show(1600, 'girl');
    }, 2200);

    // Третий — самый жёсткий
    setTimeout(() => {
      this.show(2200, 'smile', { double: true, red: true });
    }, 4400);
  },

  // Особый — «появление» девочки медленно, потом резко
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

    // Медленно проявляется
    setTimeout(() => { img.style.opacity = '0.6'; }, 50);

    // Резкий звук через 2 секунды
    setTimeout(() => {
      img.style.transition = 'none';
      img.style.animation = 'girlAppear 0.4s';
      Audio.playScream();
      document.body.classList.add('trembling');
      if (navigator.vibrate) {
        try { navigator.vibrate([200, 100, 400]); } catch(e){}
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