// ============================================
// HORROR QUEST — основная логика
// ============================================

const Game = {
  state: {
    name: 'Игрок',
    keys: 0,
    sanity: 100,
    chapter: 1,
    items: [],
    scene: 'intro',
    startTime: 0,
    deaths: 0,
    visited: []
  },

  els: {},
  timers: [],

  init() {
    this.cacheEls();
    this.bindEvents();
    this.preloadImages();
  },

  cacheEls() {
    const $ = id => document.getElementById(id);
    this.els = {
      startScreen: $('start-screen'),
      nameScreen: $('name-screen'),
      gameScreen: $('game-screen'),
      deathScreen: $('death-screen'),
      endScreen: $('end-screen'),
      story: $('story'),
      choices: $('choices'),
      keysCount: $('keys-count'),
      sanity: $('sanity'),
      timer: $('timer'),
      progress: $('progress'),
      nameInput: $('name-input'),
      deathMsg: $('death-msg'),
      deathStats: $('death-stats'),
      endTitle: $('end-title'),
      endText: $('end-text'),
      endStats: $('end-stats'),
      pauseMenu: $('pause-menu'),
      pauseFlavor: $('pause-flavor'),
      inventoryBar: $('inventory-bar')
    };
  },

  preloadImages() {
    ['assets/girl.png', 'assets/smile.jpg', 'assets/scream.jpg'].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  },

  bindEvents() {
    const $ = id => document.getElementById(id);

    const startBtn = $('start-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.startNameInput());

    const fsBtn = $('fullscreen-btn');
    if (fsBtn) fsBtn.addEventListener('click', () => this.toggleFullscreen());

    const nameBtn = $('name-btn');
    if (nameBtn) nameBtn.addEventListener('click', () => this.confirmName());

    if (this.els.nameInput) {
      this.els.nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.confirmName();
      });
    }

    const retryBtn = $('retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => this.restart());

    const restartBtn = $('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', () => this.restart());

    const resumeBtn = $('resume-btn');
    if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

    const saveBtn = $('save-btn');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      this.saveProgress();
      UI.notify('💾 Сохранено', 'Прогресс сохранён.');
    });

    const loadBtn = $('load-btn');
    if (loadBtn) loadBtn.addEventListener('click', () => this.loadProgress(true));

    const quitBtn = $('quit-btn');
    if (quitBtn) quitBtn.addEventListener('click', () => this.restart());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.els.gameScreen && this.els.gameScreen.classList.contains('active')) {
        this.togglePause();
      }
    });

    document.addEventListener('mousemove', e => {
      const cursor = document.getElementById('blood-cursor');
      if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    });

    document.addEventListener('click', () => {
      try {
        if (GameAudio.ctx) GameAudio.playClick();
      } catch (e) {}
    });
  },

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen failed', e);
    }
  },

  startNameInput() {
    // Звук — не критично, оборачиваем в try
    try {
      GameAudio.init();
      GameAudio.resume();
      GameAudio.startAmbient();
    } catch (e) {
      console.warn('Audio start failed:', e);
    }

    this.els.startScreen.classList.remove('active');
    this.els.nameScreen.classList.add('active');

    setTimeout(() => {
      try { this.els.nameInput.focus(); } catch (e) {}
    }, 100);
  },

  confirmName() {
    const name = (this.els.nameInput.value || '').trim() || 'Незнакомец';
    this.state.name = name;

    this.els.nameScreen.classList.remove('active');
    this.els.gameScreen.classList.add('active');

    this.state.startTime = Date.now();
    this.startTimer();
    this.startRandomEvents();
    this.startHallucinations();

    this.showScene(SCENES.intro);
  },

  startTimer() {
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      if (this.els.timer) this.els.timer.textContent = `⏱ ${m}:${s}`;
      if (elapsed > 0 && elapsed % 40 === 0) this.adjustSanity(-2);
    }, 1000);
    this.timers.push(t);
  },

  startRandomEvents() {
    const t = setInterval(() => {
      if (!this.els.gameScreen || !this.els.gameScreen.classList.contains('active')) return;
      if (this.els.pauseMenu && !this.els.pauseMenu.classList.contains('hidden')) return;

      const r = Math.random();
      const sanityFactor = (100 - this.state.sanity) / 100;

      try {
        if (r < 0.08 + sanityFactor * 0.1) {
          Effects.shadowPass();
          GameAudio.playWhisper();
        } else if (r < 0.15 + sanityFactor * 0.1) {
          Effects.silhouette();
        } else if (r < 0.19 + sanityFactor * 0.1) {
          Effects.bloodRain();
        } else if (r < 0.23 + sanityFactor * 0.15) {
          UI.fakeNotification();
        } else if (r < 0.27 + sanityFactor * 0.1) {
          GameAudio.playHeartbeat();
        } else if (r < 0.30 + sanityFactor * 0.1) {
          GameAudio.playCreak();
        } else if (r < 0.32 + sanityFactor * 0.15) {
          GameAudio.playGrowl();
        } else if (r < 0.34 + sanityFactor * 0.1) {
          Effects.tremble(3000);
        }
      } catch (e) {
        console.warn('Random event failed:', e);
      }
    }, 9000);
    this.timers.push(t);
  },

  startHallucinations() {
    const t = setInterval(() => {
      if (!this.els.gameScreen || !this.els.gameScreen.classList.contains('active')) return;
      if (this.els.pauseMenu && !this.els.pauseMenu.classList.contains('hidden')) return;
      if (this.state.sanity > 60) return;

      const words = ['СЗАДИ', 'БЕГИ', 'ОНО', 'НЕ ОБОРАЧИВАЙСЯ', 'ТЫ', 'МЁРТВ', 'ИМЯ', this.state.name.toUpperCase()];
      const word = words[Math.floor(Math.random() * words.length)];

      const el = document.createElement('div');
      el.className = 'hallucination-text';
      el.textContent = word;
      el.style.left = (10 + Math.random() * 70) + 'vw';
      el.style.top = (10 + Math.random() * 70) + 'vh';
      el.style.transform = `rotate(${-15 + Math.random() * 30}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }, 12000);
    this.timers.push(t);
  },

  addKey() {
    this.state.keys++;
    if (this.els.keysCount) this.els.keysCount.textContent = this.state.keys;
    try { GameAudio.playThud(); } catch (e) {}

    if (this.state.keys === 3) {
      setTimeout(() => this.showScene({
        chapter: 3,
        text: () => 'Что-то шевелится у тебя в груди. Ты смотришь вниз. Из твоей грудной клетки торчит ржавый ключ. Последний.',
        choices: [
          { text: 'Вытащить его', next: 'final_door',
            onChoose: () => {
              this.state.keys++;
              if (this.els.keysCount) this.els.keysCount.textContent = this.state.keys;
              GameScreamer.girlReveal();
              try { GameAudio.playWhisper(); } catch (e) {}
            } }
        ]
      }), 1500);
    }
  },

  addItem(item) {
    if (this.state.items.indexOf(item) === -1) this.state.items.push(item);
    const el = this.els.inventoryBar && this.els.inventoryBar.querySelector(`[data-key="${item}"]`);
    if (el) el.classList.add('owned');
    UI.notify('Получено', this.itemName(item));
    try { GameAudio.playClick(); } catch (e) {}
  },

  itemName(item) {
    const names = {
      flashlight: 'Фонарик', mirror: 'Зеркало', note: 'Записка',
      bone: 'Кость', locket: 'Медальон',
      key1: 'Ключ 1', key2: 'Ключ 2', key3: 'Ключ 3', key4: 'Ключ 4'
    };
    return names[item] || item;
  },

  adjustSanity(delta) {
    this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + delta));
    if (this.els.sanity) this.els.sanity.textContent = this.state.sanity;

    const hudSanity = this.els.sanity ? this.els.sanity.parentElement : null;
    if (this.state.sanity < 30) {
      if (hudSanity) hudSanity.classList.add('danger');
      document.body.classList.add('intrusion');
    } else {
      if (hudSanity) hudSanity.classList.remove('danger');
      document.body.classList.remove('intrusion');
    }

    if (this.state.sanity === 0) {
      this.die('Твой разум не выдержал.');
    }
  },

  showScene(scene) {
    if (scene.death) return this.die(scene.msg);

    const text = typeof scene.text === 'function' ? scene.text(this.state.name) : scene.text;

    this.els.story.textContent = '';
    this.els.choices.innerHTML = '';

    if (scene.chapter) {
      this.state.chapter = scene.chapter;
      if (this.els.progress) this.els.progress.textContent = `Глава ${scene.chapter}`;
    }

    // Печатная машинка
    let i = 0;
    const speed = 22;
    const typeTimer = setInterval(() => {
      this.els.story.textContent += text[i] || '';
      i++;
      if (i > text.length) clearInterval(typeTimer);
      if (i === Math.floor(text.length / 2) && Math.random() < 0.4) {
        try { GameAudio.playWhisper(); } catch (e) {}
      }
      if (i % 30 === 0 && Math.random() < 0.15) {
        try { GameAudio.playStep(); } catch (e) {}
      }
    }, speed);

    setTimeout(() => {
      scene.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice';
        btn.type = 'button';
        btn.textContent = c.text;
        btn.style.animation = `notifIn 0.4s ease-out ${idx * 0.08}s backwards`;
        btn.addEventListener('click', () => {
          try { GameAudio.playStep(); } catch (e) {}
          try { if (c.onChoose) c.onChoose(); } catch (e) { console.warn('onChoose failed:', e); }

          if (c.next === 'ending' || c.next === 'ending2' || c.next === 'ending3') {
            return this.ending(c.next);
          }
          const nextScene = SCENES[c.next];
          if (nextScene) {
            if (nextScene.death) return this.die(nextScene.msg);
            if (this.state.visited.indexOf(c.next) === -1) this.state.visited.push(c.next);
            this.showScene(nextScene);
          }
        });
        this.els.choices.appendChild(btn);
      });
    }, text.length * speed + 200);
  },

  die(msg) {
    this.state.deaths++;
    setTimeout(() => {
      try { GameScreamer.double(1600, 'scream'); } catch (e) {}
      setTimeout(() => {
        this.els.gameScreen.classList.remove('active');
        this.els.deathScreen.classList.add('active');
        if (this.els.deathMsg) this.els.deathMsg.textContent = msg || 'Ты был слишком медленным.';
        if (this.els.deathStats) {
          this.els.deathStats.textContent = `Глава ${this.state.chapter} • Ключей: ${this.state.keys}/4 • Смертей: ${this.state.deaths}`;
        }
        try { GameAudio.stopAmbient(); } catch (e) {}
      }, 1500);
    }, 400);
  },

  ending(type) {
    setTimeout(() => {
      try { GameScreamer.final(); } catch (e) {}
      setTimeout(() => {
        this.els.gameScreen.classList.remove('active');
        this.els.endScreen.classList.add('active');

        const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;

        if (type === 'ending') {
          this.els.endTitle.textContent = 'ТЫ ОТКРЫЛ ДВЕРЬ...';
          this.els.endText.textContent = `И вышел. Но что-то вышло вместе с тобой. Оно теперь живёт в тебе. И оно тоже знает твоё имя. ${this.state.name}.`;
        } else if (type === 'ending2') {
          this.els.endTitle.textContent = 'ТЫ ОСТАЛСЯ';
          this.els.endText.textContent = 'Ты не открыл дверь. Ты ждал так долго, что дверь открылась сама. С той стороны.';
        } else if (type === 'ending3') {
          this.els.endTitle.textContent = 'ТЫ ЗАБЫЛ СЕБЯ';
          this.els.endText.textContent = 'Ты стал частью этого места. Частью тьмы. Частью того, что ждёт следующего игрока.';
        }

        if (this.els.endStats) {
          this.els.endStats.textContent = `Время: ${m}:${String(s).padStart(2, '0')} • Ключей: ${this.state.keys} • Смертей: ${this.state.deaths}`;
        }
        try { GameAudio.stopAmbient(); } catch (e) {}
      }, 5000);
    }, 800);
  },

  togglePause() {
    this.els.pauseMenu.classList.toggle('hidden');
    if (!this.els.pauseMenu.classList.contains('hidden')) {
      this.saveProgress();
      const flavors = [
        'Оно тоже остановилось. Но не надолго.',
        'Ты уверен, что оно тоже на паузе?',
        'Оно не любит ждать. Поторопись.',
        'Пока ты здесь, оно считает.',
        'Пауза ничего не меняет. Оно знает, где ты.'
      ];
      if (this.els.pauseFlavor) {
        this.els.pauseFlavor.textContent = flavors[Math.floor(Math.random() * flavors.length)];
      }
    }
  },

  saveProgress() {
    try {
      localStorage.setItem('horror_save', JSON.stringify({
        name: this.state.name,
        keys: this.state.keys,
        sanity: this.state.sanity,
        chapter: this.state.chapter,
        items: this.state.items,
        scene: this.state.scene,
        visited: this.state.visited,
        deaths: this.state.deaths
      }));
    } catch (e) {}
  },

  loadProgress(showNotify) {
    try {
      const raw = localStorage.getItem('horror_save');
      if (!raw) {
        if (showNotify) UI.notify('📂 Нет сохранения', 'Нечего загружать.');
        return false;
      }
      const data = JSON.parse(raw);
      Object.assign(this.state, data);
      this.state.items = data.items || [];
      this.state.visited = data.visited || [];

      if (showNotify) {
        if (this.els.keysCount) this.els.keysCount.textContent = this.state.keys;
        if (this.els.sanity) this.els.sanity.textContent = this.state.sanity;
        if (this.els.progress) this.els.progress.textContent = `Глава ${this.state.chapter}`;
        this.state.items.forEach(it => {
          const el = this.els.inventoryBar && this.els.inventoryBar.querySelector(`[data-key="${it}"]`);
          if (el) el.classList.add('owned');
        });
        UI.notify('📂 Загружено', `Привет, ${this.state.name}.`);
        this.togglePause();
      }
      return true;
    } catch (e) { return false; }
  },

  restart() {
    location.reload();
  }
};

// ============================================
// ЭФФЕКТЫ
// ============================================
const Effects = {
  shadowPass() {
    const s = document.createElement('div');
    s.className = 'shadow-pass';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  },

  silhouette() {
    const s = document.createElement('div');
    s.className = 'silhouette';
    s.style.left = '0';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 4000);
    try { GameAudio.playWhisper(); GameAudio.playGrowl(); } catch (e) {}
  },

  bloodRain() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'blood-drop';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        d.style.height = (10 + Math.random() * 25) + 'px';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 3500);
      }, i * 70);
    }
  },

  tremble(duration = 2000) {
    document.body.classList.add('trembling');
    setTimeout(() => document.body.classList.remove('trembling'), duration);
  }
};

// ============================================
// UI
// ============================================
const UI = {
  fakeMessages: [
    { title: '⚠️ Внимание', text: 'Обнаружена попытка доступа к вашей камере.' },
    { title: '📷 Камера', text: 'Приложение "ОНО" запрашивает доступ к камере.' },
    { title: '🎤 Микрофон', text: 'Кто-то слушает вас. Вы уверены?' },
    { title: '📍 Геолокация', text: 'Ваше местоположение: неизвестно. Но оно знает.' },
    { title: '🖥️ Экран', text: 'Кто-то смотрит на ваш экран прямо сейчас.' },
    { title: '💀 Система', text: 'Ошибка 0xDEAD. Что-то пошло не так.' },
    { title: '🔓 Доступ', text: 'Неизвестное устройство подключено к вашей сети.' },
    { title: '⏱️ Время', text: 'Осталось не так много. Поспеши.' },
    { title: '🚪 Дверь', text: 'Не открывай. Я серьёзно.' },
    { title: '👁️ Наблюдение', text: 'Не оборачивайся.' },
    { title: '📁 Файлы', text: 'Обнаружена скрытая папка: "ОНО".' },
    { title: '🩸 Кровь', text: 'Обнаружены следы на вашей клавиатуре.' },
    { title: '🔊 Звук', text: 'Записан звук. Источник: за вашей спиной.' }
  ],

  notify(title, text, red = false) {
    const box = document.getElementById('fake-notifications');
    if (!box) return;
    const n = document.createElement('div');
    n.className = 'notif' + (red ? ' red' : '');
    n.innerHTML = `<div class="title">${title}</div><div>${text}</div>`;
    box.appendChild(n);
    setTimeout(() => {
      n.style.opacity = '0';
      n.style.transform = 'translateX(120%)';
      n.style.transition = 'all 0.4s';
      setTimeout(() => n.remove(), 400);
    }, 4500);
  },

  fakeNotification() {
    const msg = this.fakeMessages[Math.floor(Math.random() * this.fakeMessages.length)];
    const red = Math.random() < 0.3;
    this.notify(msg.title, msg.text, red);
    if (red) {
      try { GameAudio.playThud(); } catch (e) {}
    }
  }
};

// ============================================
// СТАРТ
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  try {
    Game.init();
  } catch (e) {
    console.error('Game init failed:', e);
  }

  setTimeout(() => UI.notify('Добро пожаловать', 'Не оборачивайся.'), 2000);
  setTimeout(() => UI.notify('🔍 Сканирование', 'Поиск камеры...'), 6000);
  setTimeout(() => UI.notify('✅ Найдено', 'Камера: активна.', true), 8500);
});