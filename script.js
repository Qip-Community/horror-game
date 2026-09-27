// ============================================
// HORROR QUEST — основная логика
// ============================================

const Game = {
  state: {
    name: 'Игрок',
    keys: 0,
    sanity: 100,
    chapter: 1,
    items: new Set(),
    scene: 'intro',
    startTime: 0,
    deaths: 0,
    visited: new Set()
  },

  els: {},
  timers: [],

  init() {
    this.cacheEls();
    this.bindEvents();
    this.checkAutosave();
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
      inventoryBar: $('inventory-bar')
    };
  },

  bindEvents() {
    const $ = id => document.getElementById(id);
    $('start-btn').onclick = () => this.startNameInput();
    $('fullscreen-btn').onclick = () => this.toggleFullscreen();
    $('name-btn').onclick = () => this.confirmName();
    this.els.nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.confirmName();
    });
    $('retry-btn').onclick = () => this.restart();
    $('restart-btn').onclick = () => this.restart();
    $('resume-btn').onclick = () => this.togglePause();
    $('save-btn').onclick = () => { this.saveProgress(); UI.notify('💾 Сохранено', 'Прогресс сохранён.'); };
    $('load-btn').onclick = () => { this.loadProgress(true); };
    $('quit-btn').onclick = () => this.restart();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.els.gameScreen.classList.contains('active')) {
        this.togglePause();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });

    document.addEventListener('mousemove', e => {
      const cursor = document.getElementById('blood-cursor');
      if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    });

    document.addEventListener('touchmove', e => {
      const t = e.touches[0];
      const cursor = document.getElementById('blood-cursor');
      if (cursor && t) {
        cursor.style.left = t.clientX + 'px';
        cursor.style.top = t.clientY + 'px';
      }
    }, { passive: true });

    document.addEventListener('click', () => {
      if (Audio.ctx) Audio.playClick();
    });
  },

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) {
          try { await screen.orientation.lock('portrait'); } catch(e){}
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen failed', e);
    }
  },

  startNameInput() {
    Audio.init();
    Audio.resume();
    Audio.startAmbient();
    this.els.startScreen.classList.remove('active');
    this.els.nameScreen.classList.add('active');
    setTimeout(() => this.els.nameInput.focus(), 100);
  },

  confirmName() {
    const name = this.els.nameInput.value.trim() || 'Незнакомец';
    this.state.name = name;
    this.els.nameScreen.classList.remove('active');
    this.els.gameScreen.classList.add('active');
    this.state.startTime = Date.now();
    this.startTimer();
    this.startRandomEvents();
    this.showScene(SCENES.intro);
  },

  startTimer() {
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      this.els.timer.textContent = `⏱ ${m}:${s}`;
      if (elapsed > 0 && elapsed % 45 === 0) {
        this.adjustSanity(-1);
      }
    }, 1000);
    this.timers.push(t);
  },

  startRandomEvents() {
    const t = setInterval(() => {
      if (!this.els.gameScreen.classList.contains('active')) return;
      if (this.els.pauseMenu.classList.contains('hidden') === false) return;
      const r = Math.random();
      if (r < 0.10) {
        Effects.shadowPass();
        Audio.playWhisper();
      } else if (r < 0.16) {
        Effects.silhouette();
      } else if (r < 0.19) {
        Effects.bloodRain();
      } else if (r < 0.22) {
        UI.fakeNotification();
      } else if (r < 0.25) {
        Audio.playHeartbeat();
      } else if (r < 0.27) {
        Audio.playCreak();
      }
    }, 11000);
    this.timers.push(t);
  },

  addKey() {
    this.state.keys++;
    this.els.keysCount.textContent = this.state.keys;
    Audio.playThud();
    if (this.state.keys === 3) {
      setTimeout(() => this.showScene({
        chapter: 3,
        text: () => 'Что-то шевелится у тебя в груди. Ты смотришь вниз. Из твоей грудной клетки торчит ржавый ключ. Последний.',
        choices: [
          { text: 'Вытащить его', next: 'final_door',
            onChoose: () => {
              this.state.keys++;
              this.els.keysCount.textContent = this.state.keys;
              Screamer.girl(1800);
              Audio.playWhisper();
            } }
        ]
      }), 1500);
    }
  },

  addItem(item) {
    this.state.items.add(item);
    const el = this.els.inventoryBar.querySelector(`[data-key="${item}"]`);
    if (el) el.classList.add('owned');
    UI.notify('Получено', this.itemName(item));
    Audio.playClick();
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
    this.els.sanity.textContent = this.state.sanity;
    if (this.state.sanity < 30) {
      document.body.classList.add('intrusion');
    } else {
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
      this.els.progress.textContent = `Глава ${scene.chapter}`;
    }

    // Печатная машинка
    let i = 0;
    const speed = 22;
    const typeTimer = setInterval(() => {
      this.els.story.textContent += text[i] || '';
      i++;
      if (i > text.length) {
        clearInterval(typeTimer);
        this.els.story.classList.remove('typing');
      }
      if (i === Math.floor(text.length / 2) && Math.random() < 0.35) Audio.playWhisper();
    }, speed);

    setTimeout(() => {
      scene.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice';
        btn.textContent = c.text;
        btn.style.animation = `notifIn 0.4s ease-out ${idx * 0.08}s backwards`;
        btn.onclick = () => {
          Audio.playStep();
          if (c.onChoose) c.onChoose();
          if (c.next === 'ending' || c.next === 'ending2' || c.next === 'ending3') {
            return this.ending(c.next);
          }
          const nextScene = SCENES[c.next];
          if (nextScene) {
            if (nextScene.death) return this.die(nextScene.msg);
            this.state.visited.add(c.next);
            this.showScene(nextScene);
          }
        };
        this.els.choices.appendChild(btn);
      });
    }, text.length * speed + 200);
  },

  die(msg) {
    this.state.deaths++;
    setTimeout(() => {
      Screamer.show(1500, 'scream');
      setTimeout(() => {
        this.els.gameScreen.classList.remove('active');
        this.els.deathScreen.classList.add('active');
        this.els.deathMsg.textContent = msg || 'Ты был слишком медленным.';
        this.els.deathStats.textContent = `Глава ${this.state.chapter} • Ключей: ${this.state.keys}/4 • Смертей: ${this.state.deaths}`;
        Audio.stopAmbient();
      }, 1300);
    }, 400);
  },

  ending(type) {
    setTimeout(() => {
      Screamer.final();
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

        this.els.endStats.textContent = `Время: ${m}:${String(s).padStart(2, '0')} • Ключей: ${this.state.keys} • Смертей: ${this.state.deaths}`;
        Audio.stopAmbient();
      }, 2200);
    }, 800);
  },

  togglePause() {
    this.els.pauseMenu.classList.toggle('hidden');
    if (!this.els.pauseMenu.classList.contains('hidden')) {
      this.saveProgress();
    }
  },

  saveProgress() {
    try {
      localStorage.setItem('horror_save', JSON.stringify({
        name: this.state.name,
        keys: this.state.keys,
        sanity: this.state.sanity,
        chapter: this.state.chapter,
        items: [...this.state.items],
        scene: this.state.scene,
        visited: [...this.state.visited],
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
      this.state.items = new Set(data.items || []);
      this.state.visited = new Set(data.visited || []);
      if (showNotify) {
        this.els.keysCount.textContent = this.state.keys;
        this.els.sanity.textContent = this.state.sanity;
        this.els.progress.textContent = `Глава ${this.state.chapter}`;
        this.state.items.forEach(it => {
          const el = this.els.inventoryBar.querySelector(`[data-key="${it}"]`);
          if (el) el.classList.add('owned');
        });
        UI.notify('📂 Загружено', `Привет, ${this.state.name}.`);
        this.togglePause();
      }
      return true;
    } catch (e) { return false; }
  },

  checkAutosave() {
    // Показываем уведомление если есть сейв
    try {
      const raw = localStorage.getItem('horror_save');
      if (raw) {
        const data = JSON.parse(raw);
        setTimeout(() => UI.notify('🔍 Найдено сохранение', `${data.name}, продолжить?`), 3000);
      }
    } catch (e) {}
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
    setTimeout(() => s.remove(), 1500);
  },

  silhouette() {
    const s = document.createElement('div');
    s.className = 'silhouette';
    s.style.left = '0';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 4000);
    Audio.playWhisper();
  },

  bloodRain() {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'blood-drop';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        d.style.height = (10 + Math.random() * 25) + 'px';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 3500);
      }, i * 80);
    }
  }
};

// ============================================
// UI — уведомления
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
    { title: '👁️ Наблюдение', text: 'Не оборачивайся.' }
  ],

  notify(title, text) {
    const box = document.getElementById('fake-notifications');
    if (!box) return;
    const n = document.createElement('div');
    n.className = 'notif';
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
    this.notify(msg.title, msg.text);
  }
};

// ============================================
// СТАРТ
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  Game.init();

  // Приветствие
  setTimeout(() => UI.notify('Добро пожаловать', 'Не оборачивайся.'), 2000);
  setTimeout(() => UI.notify('🔍 Сканирование', 'Поиск камеры...'), 6000);
  setTimeout(() => UI.notify('✅ Найдено', 'Камера: активна.'), 8500);

  // Пытаемся предзагрузить картинки
  ['assets/girl.png', 'assets/smile.jpg', 'assets/scream.jpg'].forEach(src => {
    const img = new Image();
    img.src = src;
  });
});