// ============================================
// Achievements
// ============================================

const Achievements = {
  unlocked: new Set(),

  list: {
    first_blood: { icon: '🩸', name: 'Первая кровь', desc: 'Умереть в первый раз' },
    suicidal: { icon: '💀', name: 'Самоубийца', desc: 'Умереть 5 раз' },
    masochist: { icon: '⚰️', name: 'Мазохист', desc: 'Умереть 10 раз' },
    brave: { icon: '🎖️', name: 'Смельчак', desc: 'Дойти до 3-й главы без смертей' },
    speedrun: { icon: '⚡', name: 'Спидран', desc: 'Пройти игру за 5 минут' },
    collector: { icon: '🗝️', name: 'Коллекционер', desc: 'Собрать все 4 ключа' },
    watcher: { icon: '👁️', name: 'Наблюдатель', desc: 'Разрешить доступ к камере' },
    listener: { icon: '🎧', name: 'Слушатель', desc: 'Услышать 10 шёпотов' },
    evp_hunter: { icon: '📻', name: 'Охотник за EVP', desc: 'Услышать голос из загробного мира' },
    curious: { icon: '🔍', name: 'Любопытный', desc: 'Посетить 20 разных сцен' },
    paranoid: { icon: '🛡️', name: 'Параноик', desc: 'Заглянуть под кровать и в карманы' },
    friend: { icon: '👥', name: 'Не один', desc: 'Поговорить с другом' },
    night_owl: { icon: '🌙', name: 'Полуночник', desc: 'Играть после 3:00 ночи' },
    secret_found: { icon: '🚪', name: 'Секретная комната', desc: 'Найти скрытую дверь' },
    ending_all: { icon: '🎬', name: 'Все концовки', desc: 'Увидеть все 3 концовки' },
    arg_master: { icon: '🧩', name: 'ARG-мастер', desc: 'Расшифровать скрытое сообщение' },
    ghost: { icon: '👻', name: 'Призрак', desc: 'Пройти игру без смертей' }
  },

  init() {
    try {
      const raw = localStorage.getItem('horror_achievements');
      if (raw) this.unlocked = new Set(JSON.parse(raw));
    } catch(e) {}
    this.updateHint();
  },

  save() {
    try {
      localStorage.setItem('horror_achievements', JSON.stringify([...this.unlocked]));
    } catch(e) {}
  },

  unlock(key) {
    if (this.unlocked.has(key)) return;
    if (!this.list[key]) return;
    this.unlocked.add(key);
    this.save();
    this.showToast(key);
    this.updateHint();
  },

  showToast(key) {
    const ach = this.list[key];
    if (!ach) return;
    const toast = document.createElement('div');
    toast.className = 'ach-toast';
    toast.innerHTML = `
      <div class="icon">${ach.icon}</div>
      <div style="text-align:left;">
        <div style="color:#8b0000;font-size:0.7rem;letter-spacing:2px;">ДОСТИЖЕНИЕ</div>
        <div style="color:#fff;font-weight:bold;">${ach.name}</div>
        <div style="color:#666;font-size:0.7rem;">${ach.desc}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
    try { GameAudio.playClick(); } catch(e) {}
  },

  updateHint() {
    const el = document.getElementById('achievements-hint');
    if (el) {
      el.textContent = `🏆 Достижений: ${this.unlocked.size}/${Object.keys(this.list).length}`;
    }
  },

  renderModal() {
    const list = document.getElementById('ach-list');
    if (!list) return;
    list.innerHTML = '';
    Object.entries(this.list).forEach(([key, ach]) => {
      const unlocked = this.unlocked.has(key);
      const item = document.createElement('div');
      item.className = 'ach-item' + (unlocked ? ' unlocked' : '');
      item.innerHTML = `
        <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
        </div>
      `;
      list.appendChild(item);
    });
  }
};