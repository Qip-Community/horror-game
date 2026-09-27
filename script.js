// ==== НАСТРОЙКИ ====
// Замени ссылки на свои файлы в assets/
// Если файлов нет — оставь как есть, будут работать только звуки с CDN (или уберём).

const IMG_SCREAMERS = [
  'https://i.imgur.com/8Q7yFjL.jpg', // пример, замени на свою
  'https://i.imgur.com/2nCt3Sb.jpg',
  'https://i.imgur.com/K1Z8Xwq.jpg'
];

// ==== СОСТОЯНИЕ ====
let state = {
  keys: 0,
  scene: 'intro',
  visited: new Set()
};

// ==== DOM ====
const $ = id => document.getElementById(id);
const startScreen = $('start-screen');
const gameScreen = $('game-screen');
const deathScreen = $('death-screen');
const endScreen = $('end-screen');
const storyEl = $('story');
const choicesEl = $('choices');
const keysCountEl = $('keys-count');
const screamerEl = $('screamer');
const screamerImg = $('screamer-img');
const ambient = $('ambient');
const screamSound = $('scream-sound');

// ==== СКРИМЕР ====
function triggerScreamer(duration = 800) {
  const img = IMG_SCREAMERS[Math.floor(Math.random() * IMG_SCREAMERS.length)];
  screamerImg.src = img;
  screamerEl.classList.remove('hidden');
  try {
    screamSound.currentTime = 0;
    screamSound.volume = 1;
    screamSound.play().catch(()=>{});
  } catch(e) {}
  if (navigator.vibrate) navigator.vibrate([100,50,100,50,200]);
  setTimeout(() => {
    screamerEl.classList.add('hidden');
  }, duration);
}

// ==== ЭФФЕКТ ТЕНИ ====
function shadowPass() {
  const s = document.createElement('div');
  s.className = 'shadow-pass';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1500);
}

// ==== ШЁПОТ ====
const whispers = [
  '...сзади...',
  '...не оборачивайся...',
  '...я вижу тебя...',
  '...останься со мной...',
  '...ты уже мёртв...',
  '...ещё один шаг...'
];
function playWhisper() {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(whispers[Math.floor(Math.random()*whispers.length)]);
    u.volume = 0.15;
    u.rate = 0.6;
    u.pitch = 0.2;
    speechSynthesis.speak(u);
  }
}

// ==== СЦЕНЫ ====
const scenes = {
  intro: {
    text: 'Ты просыпаешься в тёмной комнате. Голова гудит. В углу мерцает свеча. На стене — четыре пустых крючка. Дверь заперта. За ней что-то дышит.',
    choices: [
      { text: 'Осмотреть комнату', next: 'inspect', action: () => shadowPass() },
      { text: 'Крикнуть "Кто здесь?"', next: 'scream_back' },
      { text: 'Подойти к двери', next: 'door' }
    ]
  },
  scream_back: {
    text: 'Тишина. А потом — из глубины комнаты, оттуда, где нет стен, отвечает голос. Твой собственный голос.',
    choices: [
      { text: 'Зажать уши', next: 'intro', action: () => triggerScreamer(600) },
      { text: 'Осмотреть комнату', next: 'inspect' }
    ]
  },
  door: {
    text: 'Дверь ледяная. Ты прижимаешься ухом... и слышишь дыхание. Оно слышит тебя. Ручка медленно поворачивается С ТОЙ СТОРОНЫ.',
    choices: [
      { text: 'Отпрянуть', next: 'intro', action: () => { triggerScreamer(700); } },
      { text: 'Открыть самому', next: 'death' }
    ]
  },
  inspect: {
    text: 'Под кроватью — старый сундук. Внутри — 3 предмета: ржавый ключ, зеркальце и записка. На записке кровью: "Не смотри в зеркало. Оно смотрит в ответ".',
    choices: [
      { text: 'Взять ключ', next: 'take_key' },
      { text: 'Посмотреть в зеркало', next: 'mirror' },
      { text: 'Прочитать записку полностью', next: 'note' }
    ]
  },
  take_key: {
    text: 'Ты берёшь ключ. По спине проходит холод. За стеной кто-то царапает. Ключ первый. Осталось ещё три.',
    choices: [
      { text: 'Идти дальше', next: 'hallway', action: () => addKey() }
    ]
  },
  mirror: {
    text: 'Ты смотришь в зеркало. Отражение смотрит НЕ туда, куда смотришь ты. Оно смотрит прямо на тебя. И улыбается.',
    choices: [
      { text: 'Разбить зеркало', next: 'death', action: () => triggerScreamer(900) },
      { text: 'Отвернуться', next: 'intro' }
    ]
  },
  note: {
    text: 'Полный текст записки: "Ключи в: 1) под кроватью, 2) в ванной за занавеской, 3) в шкафу, 4) там, где ты не хочешь искать. Последний — в тебе самом."',
    choices: [
      { text: 'Взять ключ под кроватью', next: 'take_key' },
      { text: 'Вернуться', next: 'inspect' }
    ]
  },
  hallway: {
    text: 'Ты выходишь в длинный коридор. Свет мигает. В конце — три двери: ВАННАЯ, ШКАФ, и дверь без таблички.',
    choices: [
      { text: 'Ванная', next: 'bathroom' },
      { text: 'Шкаф', next: 'closet' },
      { text: 'Дверь без таблички', next: 'unknown' }
    ]
  },
  bathroom: {
    text: 'Ванная. Занавеска задернута. Из-за неё капает что-то густое и тёмное. На полу — следы босых ног, ведущие ЗА занавеску.',
    choices: [
      { text: 'Отдёрнуть занавеску', next: 'bathroom_scream' },
      { text: 'Найти ключ так', next: 'bathroom_key' }
    ]
  },
  bathroom_scream: {
    text: 'За занавеской — никого. Только зеркало. И в нём — ТЫ. Но ты стоишь здесь. Значит...',
    choices: [
      { text: '...', next: 'death', action: () => triggerScreamer(1000) }
    ]
  },
  bathroom_key: {
    text: 'Ты нащупываешь ключ на полке. Второй есть. Из слива ванны доносится булькающий смех.',
    choices: [
      { text: 'Уйти', next: 'hallway', action: () => addKey() }
    ]
  },
  closet: {
    text: 'Шкаф. Дверь приоткрыта. Внутри темнота гуще, чем должна быть. Оттуда пахнет землёй и старыми костями.',
    choices: [
      { text: 'Заглянуть внутрь', next: 'closet_scream' },
      { text: 'Пошарить рукой', next: 'closet_key' }
    ]
  },
  closet_scream: {
    text: 'В темноте — лицо. Бледное. Глаза отсутствуют. Рот открывается, и оттуда выползает рука...',
    choices: [
      { text: 'Закрыть шкаф', next: 'hallway', action: () => triggerScreamer(1200) }
    ]
  },
  closet_key: {
    text: 'Ты хватаешь что-то холодное. Ключ. Третий. Что-то липкое касается твоей руки в ответ.',
    choices: [
      { text: 'Отдёрнуть руку', next: 'hallway', action: () => { addKey(); triggerScreamer(500); } }
    ]
  },
  unknown: {
    text: 'Дверь без таблички. За ней — та же комната, из которой ты начал. Но теперь в ней стоит человек. Спиной. Он не двигается.',
    choices: [
      { text: 'Окликнуть', next: 'unknown_scream' },
      { text: 'Медленно отступить', next: 'hallway' }
    ]
  },
  unknown_scream: {
    text: 'Человек поворачивается. Это ты. Без лица. И оно открывает рот —',
    choices: [
      { text: '...', next: 'death', action: () => triggerScreamer(1000) }
    ]
  },
  final_door: {
    text: 'У тебя 4 ключа. Ты возвращаешься к главной двери. Дыхание за ней стало громче. Оно ждёт.',
    choices: [
      { text: 'Открыть дверь', next: 'ending' }
    ]
  },
  ending: {
    text: 'Дверь открывается. За ней — темнота. И в темноте — дверь. И ещё одна. И ещё. Ты делаешь шаг...',
    choices: []
  },
  death: {
    text: '',
    choices: []
  }
};

// ==== ЛОГИКА ====
function addKey() {
  state.keys++;
  keysCountEl.textContent = state.keys;
  if (state.keys === 3) {
    // Скрытый 4-й ключ — «в тебе самом»
    setTimeout(() => {
      showScene({
        text: 'Что-то шевелится у тебя в груди. Ты смотришь вниз. Из твоей грудной клетки торчит ржавый ключ. Последний.',
        choices: [
          { text: 'Вытащить его', next: 'final_door',
            action: () => { addKey(); triggerScreamer(1500); playWhisper(); } }
        ]
      });
    }, 1500);
  }
}

function showScene(scene) {
  storyEl.textContent = '';
  choicesEl.innerHTML = '';
  // печатающая машинка
  let i = 0;
  const txt = scene.text;
  const speed = 25;
  const timer = setInterval(() => {
    storyEl.textContent += txt[i] || '';
    i++;
    if (i > txt.length) clearInterval(timer);
    // случайные звуки при наборе
    if (i === Math.floor(txt.length/2) && Math.random() < 0.4) playWhisper();
  }, speed);

  setTimeout(() => {
    scene.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = c.text;
      btn.onclick = () => {
        if (c.action) c.action();
        if (c.next === 'death') return die();
        if (c.next === 'ending') return ending();
        const nextScene = scenes[c.next];
        if (nextScene) showScene(nextScene);
      };
      choicesEl.appendChild(btn);
    });
  }, txt.length * speed + 200);
}

function die() {
  setTimeout(() => {
    triggerScreamer(1500);
    setTimeout(() => {
      gameScreen.classList.remove('active');
      deathScreen.classList.add('active');
      ambient.pause();
    }, 1200);
  }, 300);
}

function ending() {
  setTimeout(() => {
    triggerScreamer(2000);
    setTimeout(() => {
      gameScreen.classList.remove('active');
      endScreen.classList.add('active');
      ambient.pause();
    }, 1800);
  }, 800);
}

// ==== СТАРТ ====
$('start-btn').onclick = () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  ambient.volume = 0.3;
  ambient.play().catch(()=>{});
  // случайные скримеры в фоне
  setInterval(() => {
    if (Math.random() < 0.15 && document.querySelector('.screen.active') === gameScreen) {
      shadowPass();
      if (Math.random() < 0.3) playWhisper();
    }
  }, 15000);
  showScene(scenes.intro);
};

$('retry-btn').onclick = () => {
  state.keys = 0;
  keysCountEl.textContent = 0;
  deathScreen.classList.remove('active');
  startScreen.classList.add('active');
};