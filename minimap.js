// ============================================
// MiniMap
// ============================================

const MiniMap = {
  currentRoom: 12,
  visitedRooms: new Set([12]),
  keys: [],
  enemyPos: 0,
  visible: false,
  enemySpeed: 1,

  init() {
    this.keys = [];
    this.render();
    this.startEnemy();
  },

  moveTo(sceneName) {
    const roomMap = {
      'bathroom': 0, 'closet': 3, 'hallway': 6,
      'basement': 5, 'well': 11, 'mirror': 13,
      'tunnel': 4, 'unknown': 8, 'doll_room': 22
    };
    const roomId = roomMap[sceneName];
    if (roomId !== undefined) {
      this.currentRoom = roomId;
      this.visitedRooms.add(roomId);
      this.render();
    }
  },

  addKey(sceneName) {
    const available = [];
    for (let i = 0; i < 25; i++) {
      if (!this.visitedRooms.has(i) && i !== this.currentRoom) available.push(i);
    }
    if (available.length > 0) {
      const roomId = available[Math.floor(Math.random() * available.length)];
      this.keys.push(roomId);
    }
  },

  startEnemy() {
    this.enemyPos = Math.floor(Math.random() * 25);
    setInterval(() => {
      if (!document.getElementById('game-screen').classList.contains('active')) return;
      if (this.enemyPos < this.currentRoom) this.enemyPos += this.enemySpeed;
      else if (this.enemyPos > this.currentRoom) this.enemyPos -= this.enemySpeed;

      const dist = Math.abs(this.enemyPos - this.currentRoom);
      if (dist <= 1 && dist > 0) {
        UI.notify('⚠️ ОНО РЯДОМ', 'Оно в соседней комнате.', true);
        GameAudio.playHeartbeat();
      }
      if (dist === 0) {
        Game.die('Оно вошло в комнату. Ты не успел.', 'death_it_found');
      }
      this.render();
    }, 8000);
  },

  render() {
    const grid = document.getElementById('minimap-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'minimap-cell';
      if (this.visitedRooms.has(i)) cell.classList.add('visited');
      if (i === this.currentRoom) cell.classList.add('current');

      if (i === this.currentRoom) cell.innerHTML = '<span class="dot-you">●</span>';
      else if (i === this.enemyPos) cell.innerHTML = '<span class="dot-it">●</span>';
      else if (this.keys.indexOf(i) !== -1) cell.innerHTML = '<span class="dot-key">●</span>';
      grid.appendChild(cell);
    }
  },

  toggle() {
    this.visible = !this.visible;
    const el = document.getElementById('minimap');
    if (el) el.classList.toggle('hidden', !this.visible);
  }
};