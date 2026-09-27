// ============================================
// Meta — мета-события: BSOD, звонки, webcam, статистика
// ============================================

const Meta = {
  webcamReady: false,
  webcamVideo: null,
  stats: {
    deaths: [],           // массив причин смерти
    sessions: 0,          // сколько раз играл
    totalDeaths: 0
  },

  init() {
    // Загружаем мета-статистику
    try {
      const raw = localStorage.getItem('horror_meta');
      if (raw) Object.assign(this.stats, JSON.parse(raw));
      this.stats.sessions++;
      this.saveStats();
    } catch(e) {}

    // Ночной режим
    this.checkNightMode();

    // Приветствие возвращения
    this.showReturningHint();

    // Регистрируем webcam-video
    this.webcamVideo = document.getElementById('webcam-video');

    // Фейковый beforeunload (если играл > 5 минут)
    setTimeout(() => this.enableBeforeUnload(), 5 * 60 * 1000);

    // Запускаем случайные мета-события
    this.startRandomMetaEvents();

    // Обновляем счётчик "онлайн игроков"
    this.startPlayersCounter();

    // Кровавый режим при низком рассудке
    this.startBloodModeWatcher();

    // Слушаем клики для кровавых пятен
    this.bindBloodStains();
  },

  saveStats() {
    try {
      localStorage.setItem('horror_meta', JSON.stringify(this.stats));
    } catch(e) {}
  },

  // ===== WEBCAM =====
  async enableWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.webcamVideo = document.getElementById('webcam-video');
      if (this.webcamVideo) {
        this.webcamVideo.srcObject = stream;
        this.webcamReady = true;
        const status = document.getElementById('webcam-status');
        if (status) {
          status.textContent = '📷 Камера: активна. Оно видит тебя.';
          status.style.color = '#8b0000';
        }
        return true;
      }
    } catch (e) {
      console.warn('Webcam denied', e);
      const status = document.getElementById('webcam-status');
      if (status) status.textContent = '📷 Камера: отказано. Оно всё равно видит.';
    }
    return false;
  },

  triggerSelfScreamer() {
    if (!this.webcamReady || !this.webcamVideo) return false;
    if (this.webcamVideo.videoWidth === 0) return false;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.webcamVideo.videoWidth;
      canvas.height = this.webcamVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.filter = 'contrast(2.5) saturate(3) hue-rotate(-30deg) brightness(0.8)';
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1); // Зеркалим
      ctx.drawImage(this.webcamVideo, 0, 0);

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/jpeg', 0.7);
      img.className = 'webcam-screamer';
      img.style.filter = 'contrast(1.5) hue-rotate(-20deg)';
      document.body.appendChild(img);
      try { GameAudio.playScream(); } catch(e) {}
      document.body.classList.add('trembling');
      if (navigator.vibrate) navigator.vibrate([200, 100, 400]);

      setTimeout(() => {
        img.remove();
        document.body.classList.remove('trembling');
      }, 400);
      return true;
    } catch(e) {
      console.warn('Self screamer failed', e);
      return false;
    }
  },

  maybeWebcamScreamer(chance = 0.2) {
    if (Math.random() < chance) {
      if (!this.triggerSelfScreamer()) {
        // Fallback — обычный скример
        GameScreamer.mini();
      }
    }
  },

  // ===== НОЧНОЙ РЕЖИМ =====
  checkNightMode() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // 3:33 — особый момент
    if (h === 3 && m >= 30 && m <= 36) {
      document.body.classList.add('nightmare-mode');
      setTimeout(() => {
        UI.notify('🕐 3:33', 'Ты знаешь, что происходит в это время?', true);
        GameScreamer.double(2000, 'girl');
      }, 2000);
    } else if (h >= 0 && h < 5) {
      document.body.classList.add('nightmare-mode');
    }
  },

  // ===== ПРИВЕТСТВИЕ ВОЗВРАЩЕНИЯ =====
  showReturningHint() {
    try {
      const lastName = localStorage.getItem('horror_last_name');
      const sessions = this.stats.sessions;
      const el = document.getElementById('returning-hint');
      if (lastName && el && sessions > 1) {
        el.style.display = 'block';
        if (sessions === 2) {
          el.textContent = `Снова ты, ${lastName}? Ты не вышел. Почему ты вернулся?`;
        } else if (sessions < 6) {
          el.textContent = `${lastName}, ты возвращаешься ${sessions}-й раз. Оно считает.`;
        } else {
          el.textContent = `${lastName}. Ты уже часть этого места. Смирись.`;
        }
      }
    } catch(e) {}
  },

  // ===== ФЕЙКОВЫЙ BSOD =====
  triggerBSOD() {
    if (document.getElementById('bsod')) return;

    const bsod = document.createElement('div');
    bsod.id = 'bsod';
    bsod.innerHTML = `
      <div class="face">:(</div>
      <div class="title">На вашем ПК возникла проблема, и его необходимо перезагрузить.<br>
      Мы собираем данные об ошибке, после чего выполним перезагрузку.</div>
      <div style="margin-top:20px;font-size:14px;">
        <div>0% завершено</div>
        <div style="margin-top:20px;color:#a0c8ff;">Для получения дополнительной информации посетите:<br>
        https://www.windows.com/stopcode</div>
        <div style="margin-top:20px;color:#a0c8ff;">
          Код остановки: CRITICAL_PROCESS_DIED<br>
          Что не так: ОНО нашло вас.
        </div>
      </div>
      <div class="progress" id="bsod-progress">0% завершено</div>
    `;
    document.body.appendChild(bsod);

    // Прогресс
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15);
      if (p > 100) p = 100;
      const el = document.getElementById('bsod-progress');
      if (el) el.textContent = `${p}% завершено`;
      if (p === 100) {
        clearInterval(interval);
        // Резкий скример вместо перезагрузки
        setTimeout(() => {
          bsod.remove();
          GameScreamer.double(1800, 'scream');
        }, 800);
      }
    }, 400);
  },

  // ===== ФЕЙКОВЫЙ ЗВОНОК =====
  triggerFakeCall() {
    if (document.getElementById('fake-call')) return;

    const call = document.createElement('div');
    call.id = 'fake-call';
    call.innerHTML = `
      <div class="icon">📞</div>
      <div class="caller">ВХОДЯЩИЙ ЗВОНОК</div>
      <div class="number">+7 (000) 000-00-00 · НЕИЗВЕСТНЫЙ</div>
      <div class="call-btns">
        <button class="call-btn answer" id="call-answer">ОТВЕТИТЬ</button>
        <button class="call-btn decline" id="call-decline">ОТКЛОНИТЬ</button>
      </div>
    `;
    document.body.appendChild(call);

    try { GameAudio.playHeartbeat(); } catch(e) {}

    const removeCall = () => {
      call.style.transition = 'opacity 0.5s';
      call.style.opacity = '0';
      setTimeout(() => call.remove(), 500);
    };

    const answer = document.getElementById('call-answer');
    const decline = document.getElementById('call-decline');

    if (answer) answer.onclick = () => {
      removeCall();
      // Оно говорит твоим голосом
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(`${Game.state.name}, не отвечай. Это не я.`);
          u.volume = 0.4; u.rate = 0.6; u.pitch = 0.2; u.lang = 'ru-RU';
          speechSynthesis.speak(u);
        }
        UI.notify('📞 Вызов', 'Оно сказало твоим голосом.', true);
      }, 600);
    };

    if (decline) decline.onclick = () => {
      removeCall();
      UI.notify('📞 Отклонено', 'Но звонок повторится.', true);
      // Повтор через 15 секунд
      setTimeout(() => this.triggerFakeCall(), 15000);
    };
  },

  // ===== ФЕЙКОВЫЙ beforeunload =====
  enableBeforeUnload() {
    window.addEventListener('beforeunload', e => {
      if (Game.state.startTime > 0 && Game.state.deaths === 0) {
        e.preventDefault();
        e.returnValue = 'Оно не хочет, чтобы ты уходил...';
        return e.returnValue;
      }
    });
  },

  // ===== СЛУЧАЙНЫЕ МЕТА-СОБЫТИЯ =====
  startRandomMetaEvents() {
    setInterval(() => {
      if (!document.getElementById('game-screen').classList.contains('active')) return;
      if (!document.getElementById('pause-menu').classList.contains('hidden')) return;

      const r = Math.random();
      const sanity = Game.state.sanity;
      const intensity = (100 - sanity) / 100;

      // Редкие шокирующие события
      if (r < 0.02) {
        this.triggerBSOD();
      } else if (r < 0.04) {
        this.triggerFakeCall();
      } else if (r < 0.08) {
        this.triggerSelfScreamer();
      } else if (r < 0.12) {
        this.triggerTitleChange();
      } else if (r < 0.16) {
        this.triggerFaviconChange();
      } else if (r < 0.20 + intensity * 0.1) {
        this.triggerRedRoom();
      } else if (r < 0.25 + intensity * 0.1) {
        MetaFakePlayers.dropPlayers();
      }
    }, 20000);
  },

  // ===== МЕНЯЕМ TITLE =====
  triggerTitleChange() {
    const titles = ['БЕГИ', 'ОНО РЯДОМ', 'СЗАДИ', 'НЕ ОБОРАЧИВАЙСЯ', '🔴 БЕГИ', '⚠ ОНО ЗДЕСЬ'];
    document.title = titles[Math.floor(Math.random() * titles.length)];
    setTimeout(() => { document.title = '.'; }, 4000);
  },

  triggerFaviconChange() {
    const link = document.querySelector("link[rel*='icon']");
    if (!link) return;
    const oldHref = link.href;
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='90'>💀</text></svg>";
    setTimeout(() => { link.href = oldHref; }, 5000);
  },

  triggerRedRoom() {
    document.body.style.filter = 'hue-rotate(-90deg) saturate(3) contrast(1.3)';
    try { GameAudio.playThud(); } catch(e) {}
    setTimeout(() => {
      document.body.style.filter = '';
    }, 2000);
  },

  // ===== КРОВАВЫЙ РЕЖИМ =====
  startBloodModeWatcher() {
    setInterval(() => {
      if (Game.state.sanity < 30) {
        document.body.classList.add('blood-mode');
      } else {
        document.body.classList.remove('blood-mode');
      }
    }, 3000);
  },

  // ===== КРОВАВЫЕ ПЯТНА ОТ КЛИКОВ =====
  bindBloodStains() {
    document.addEventListener('click', e => {
      if (!document.getElementById('game-screen').classList.contains('active')) return;
      const stain = document.createElement('div');
      stain.className = 'blood-stain';
      stain.style.left = e.clientX + 'px';
      stain.style.top = e.clientY + 'px';
      stain.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg) scale(${0.5 + Math.random()*0.8})`;
      document.body.appendChild(stain);
      setTimeout(() => {
        stain.style.transition = 'opacity 3s';
        stain.style.opacity = '0';
        setTimeout(() => stain.remove(), 3000);
      }, 25000);
    });
  },

  // ===== СЧЁТЧИК ОНЛАЙН =====
  startPlayersCounter() {
    let players = 47;
    setInterval(() => {
      players += Math.floor(Math.random() * 5) - 2;
      if (players < 1) players = 1;
      if (players > 99) players = 99;
      const el = document.getElementById('online');
      if (el) el.textContent = `👥 ${players}`;

      // Иногда резко падает до 1
      if (Math.random() < 0.04) {
        players = 1;
        if (el) el.textContent = `👥 1`;
        UI.notify('👤 ОНЛАЙН', 'Остался только ты. И один другой.', true);
      }
    }, 5000);
  },

  // ===== ДИНАМИЧЕСКИЙ ЗВУК =====
  updateAudioIntensity() {
    const intensity = (100 - Game.state.sanity) / 100;
    try {
      GameAudio.setIntensity(intensity);
      if (intensity > 0.6 && Math.random() < 0.3) {
        GameAudio.playTinnitus();
      }
    } catch(e) {}
  }
};

// ============================================
// Фейковые игроки онлайн — резкий сброс
// ============================================
const MetaFakePlayers = {
  dropPlayers() {
    const el = document.getElementById('online');
    if (el) el.textContent = `👥 1`;
    UI.notify('⚠ Внимание', 'Остался только ты.', true);
  }
};