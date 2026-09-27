// ============================================
// Multiplayer — фейковый друг
// ============================================

const Multiplayer = {
  friendOnline: false,
  active: false,

  messages: [
    { delay: 3000, text: 'Привет! Ты тоже это открыл?' },
    { delay: 8000, text: 'Я в комнате с крючками. У тебя тоже?' },
    { delay: 15000, text: 'Слушай, ты видел это в шкафу?' },
    { delay: 25000, text: 'Что-то не так. У меня изображение мигает.' },
    { delay: 35000, text: 'Ты это слышал?' },
    { delay: 45000, text: 'Кто-то ходит за мной.' },
    { delay: 55000, text: 'Кажется, оно знает, что я здесь.' },
    { delay: 65000, text: 'Ты ещё жив?' },
    { delay: 75000, text: 'Помоги.' },
    { delay: 85000, text: 'ПОМОГИ МНЕ' },
    { delay: 95000, text: 'ОНО ЗДЕСЬ' },
    { delay: 105000, text: '[СООБЩЕНИЕ НЕ ДОСТАВЛЕНО]' },
    { delay: 115000, text: '...', creepy: true },
    { delay: 125000, text: 'Ты следующий.', creepy: true },
    { delay: 135000, text: 'Я вижу тебя через его глаза.', creepy: true }
  ],

  start() {
    if (this.active) return;
    this.active = true;

    const status = document.getElementById('friend-status');
    if (status) status.style.display = '';

    setTimeout(() => {
      this.openChat();
      this.scheduleMessage(0);
    }, 5000);

    const closeBtn = document.getElementById('chat-close');
    if (closeBtn) closeBtn.onclick = () => this.closeChat();

    const sendBtn = document.getElementById('chat-send');
    const inputEl = document.getElementById('chat-input');
    if (sendBtn && inputEl) {
      const send = () => {
        const text = inputEl.value.trim();
        if (!text) return;
        this.addMessage(text, 'you');
        inputEl.value = '';
        Achievements.unlock('friend');
        setTimeout(() => {
          const replies = [
            'Ага', 'Понял', 'Хм', 'Я тоже', 'Что?',
            'Оно не любит, когда ты пишешь ему.',
            'Оно читает наши сообщения.',
            'Не пиши больше. Оно видит.',
            'Ты слышал этот звук?'
          ];
          this.addMessage(replies[Math.floor(Math.random() * replies.length)], 'friend');
        }, 2000 + Math.random() * 3000);
      };
      sendBtn.onclick = send;
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') send();
      });
    }

    setTimeout(() => {
      this.friendOnline = false;
      const s = document.getElementById('friend-status');
      if (s) {
        s.style.color = '#8b0000';
        s.textContent = '⚫ Друг отключился';
      }
    }, 120000);
  },

  openChat() {
    const chat = document.getElementById('friend-chat');
    if (chat) chat.classList.remove('hidden');
    this.friendOnline = true;
  },

  closeChat() {
    const chat = document.getElementById('friend-chat');
    if (chat) chat.classList.add('hidden');
  },

  scheduleMessage(idx) {
    if (idx >= this.messages.length) return;
    const msg = this.messages[idx];
    setTimeout(() => {
      if (!this.friendOnline) return;
      this.addMessage(msg.text, msg.creepy ? 'creepy' : 'friend');
      this.scheduleMessage(idx + 1);

      if (msg.creepy) {
        try { GameAudio.playWhisper(); } catch(e) {}
        document.body.classList.add('trembling');
        setTimeout(() => document.body.classList.remove('trembling'), 1500);
      }
      if (idx === 8) setTimeout(() => GameScreamer.mini(), 1000);
      if (idx === 12) setTimeout(() => GameScreamer.double(1500, 'girl'), 500);
    }, msg.delay);
  },

  addMessage(text, type) {
    const body = document.getElementById('chat-body');
    if (!body) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    try { GameAudio.playClick(); } catch(e) {}
  }
};