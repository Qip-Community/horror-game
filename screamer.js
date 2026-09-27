// ============================================
// Скримеры на основе твоих картинок
// ============================================

const Screamer = {
  // ⚠️ Проверь имена файлов — они должны лежать в assets/
  IMAGES: {
    girl: 'assets/girl.png',      // девочка с чёрными глазами (PNG, прозрачный фон)
    smile: 'assets/smile.jpg',    // улыбающееся лицо
    scream: 'assets/scream.jpg'   // кричащее размытое лицо
  },

  // Веса — что чаще выпадает
  pool: [
    { key: 'smile', weight: 4 },
    { key: 'scream', weight: 4 },
    { key: 'girl', weight: 3 }
  ],

  pickRandom() {
    const total = this.pool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const item of this.pool) {
      r -= item.weight;
      if (r <= 0) return item.key;
    }
    return 'smile';
  },

  show(duration = 900, forceKey = null) {
    const screamerEl = document.getElementById('screamer');
    const contentEl = document.getElementById('screamer-content');
    const key = forceKey || this.pickRandom();
    const src = this.IMAGES[key];

    // Вспышка
    const flash = document.getElementById('flash');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 80);

    contentEl.innerHTML = '';

    if (key === 'girl') {
      // Девочка — прозрачный фон, поверх чёрного
      const img = document.createElement('img');
      img.src = src;
      img.className = 'girl';
      img.alt = '';
      img.draggable = false;
      contentEl.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      contentEl.appendChild(img);
    }

    screamerEl.classList.remove('hidden');
    Audio.playScreamer();

    if (navigator.vibrate) {
      try { navigator.vibrate([120, 60, 120, 60, 250, 60, 400]); } catch(e){}
    }

    setTimeout(() => {
      screamerEl.classList.add('hidden');
      contentEl.innerHTML = '';
    }, duration);
  },

  // Мини-скример — быстрое лицо без звука "вопль"
  mini() {
    this.show(420, Math.random() < 0.5 ? 'smile' : 'scream');
  },

  // Девочка как особый скример
  girl(duration = 1200) {
    this.show(duration, 'girl');
  },

  // Финальный — самый жёсткий
  final() {
    this.show(2200, 'scream');
    setTimeout(() => this.show(1800, 'girl'), 2400);
  }
};