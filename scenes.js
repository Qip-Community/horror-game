// ============================================
// Все сцены квеста. 30+ локаций, 4 концовки.
// ============================================

const SCENES = {
  // ===== ГЛАВА 1: ПРОБУЖДЕНИЕ =====
  intro: {
    chapter: 1,
    text: (name) => `Ты просыпаешься на холодном полу. Голова раскалывается. Последнее, что помнишь — как ты открыл эту ссылку. В углу мерцает свеча. На стене — четыре пустых крючка. Дверь заперта. За ней что-то дышит, и оно знает твоё имя. ${name}.`,
    choices: [
      { text: 'Осмотреть комнату', next: 'inspect', onChoose: () => Effects.shadowPass() },
      { text: 'Крикнуть "Кто здесь?"', next: 'scream_back' },
      { text: 'Подойти к двери', next: 'door' },
      { text: 'Проверить карманы', next: 'pockets' }
    ]
  },

  pockets: {
    chapter: 1,
    text: () => 'В карманах: мобильник (нет сети), сломанный фонарик, и записка. На записке твоим почерком: "НЕ ХОДИ В ПОДВАЛ. ОНО ТАМ."',
    choices: [
      { text: 'Взять фонарик', next: 'intro', onChoose: () => { Game.addItem('flashlight'); } },
      { text: 'Взять записку', next: 'intro', onChoose: () => { Game.addItem('note'); } },
      { text: 'Вернуться', next: 'intro' }
    ]
  },

  scream_back: {
    chapter: 1,
    text: (name) => `Тишина. А потом — из глубины комнаты, оттуда, где нет стен, отвечает голос. Твой собственный. "${name}... зачем ты это сделал?"`,
    choices: [
      { text: 'Зажать уши', next: 'intro', onChoose: () => Screamer.mini() },
      { text: 'Спросить "Что сделать?"', next: 'scream_back2' },
      { text: 'Молчать', next: 'intro' }
    ]
  },

  scream_back2: {
    chapter: 1,
    text: () => 'Голос смеётся. Смех идёт из твоей груди. Ты смотришь вниз — грудь цела. Но смех продолжается.',
    choices: [
      { text: 'Бежать', next: 'inspect' },
      { text: 'Кричать в ответ', next: 'death_heart', onChoose: () => Screamer.show(1200) }
    ]
  },

  door: {
    chapter: 1,
    text: () => 'Дверь ледяная. Ты прижимаешься ухом... и слышишь дыхание. Оно слышит тебя. Ручка медленно поворачивается С ТОЙ СТОРОНЫ.',
    choices: [
      { text: 'Отпрянуть', next: 'intro', onChoose: () => Screamer.mini() },
      { text: 'Открыть самому', next: 'death_door' },
      { text: 'Постучать', next: 'door_knock' }
    ]
  },

  door_knock: {
    chapter: 1,
    text: () => 'Ты стучишь. Три раза. Из-за двери — три раза в ответ. Потом ещё три. Потом ещё. Стук не прекращается. Он становится громче. СТУЧИТ УЖЕ ИЗНУТРИ ТВОЕЙ ГОЛОВЫ.',
    choices: [
      { text: 'Упасть на пол', next: 'death_head', onChoose: () => Screamer.show(1500) }
    ]
  },

  inspect: {
    chapter: 1,
    text: () => 'Под кроватью — старый сундук. Внутри — 3 предмета: ржавый ключ, зеркальце и записка. На записке кровью: "Не смотри в зеркало. Оно смотрит в ответ".',
    choices: [
      { text: 'Взять ключ', next: 'take_key', onChoose: () => Audio.playClick() },
      { text: 'Посмотреть в зеркало', next: 'mirror' },
      { text: 'Прочитать записку полностью', next: 'note' },
      { text: 'Осмотреть кровать', next: 'bed' }
    ]
  },

  bed: {
    chapter: 1,
    text: () => 'Под матрасом — что-то твёрдое. Ты запускаешь руку. Пальцы касаются холодного. Это не ключ. Это... палец.',
    choices: [
      { text: 'Отдёрнуть руку', next: 'inspect', onChoose: () => Screamer.mini() },
      { text: 'Вытащить', next: 'finger' }
    ]
  },

  finger: {
    chapter: 1,
    text: () => 'Ты вытаскиваешь палец. Он шевелится. Он указывает на стену. На той стене — ещё один крючок, которого раньше не было.',
    choices: [
      { text: 'Прикоснуться к крючку', next: 'hook' },
      { text: 'Бросить палец', next: 'inspect' }
    ]
  },

  hook: {
    chapter: 1,
    text: () => 'Стена открывается. За ней — проход. Узкий. Тёмный. Пахнет землёй и железом.',
    choices: [
      { text: 'Войти', next: 'tunnel' },
      { text: 'Отойти', next: 'inspect' }
    ]
  },

  take_key: {
    chapter: 1,
    text: () => 'Ты берёшь ключ. По спине проходит холод. За стеной кто-то царапает. Ключ первый. Осталось ещё три.',
    choices: [
      { text: 'Идти дальше', next: 'hallway', onChoose: () => Game.addKey() }
    ]
  },

  mirror: {
    chapter: 1,
    text: () => 'Ты смотришь в зеркало. Отражение смотрит НЕ туда, куда смотришь ты. Оно смотрит прямо на тебя. И улыбается. И поднимает руку. Ты — нет.',
    choices: [
      { text: 'Разбить зеркало', next: 'death_mirror', onChoose: () => Screamer.show(1000) },
      { text: 'Отвернуться', next: 'inspect' },
      { text: 'Помахать отражению', next: 'mirror_wave' }
    ]
  },

  mirror_wave: {
    chapter: 1,
    text: () => 'Отражение машет в ответ. Но с задержкой. А потом — опережает тебя. Оно знает, что ты сделаешь раньше, чем ты сам.',
    choices: [
      { text: 'Разбить зеркало', next: 'death_mirror', onChoose: () => Screamer.show(1200) },
      { text: 'Уйти', next: 'inspect', onChoose: () => Game.addItem('mirror') }
    ]
  },

  note: {
    chapter: 1,
    text: () => 'Полный текст записки: "Ключи в: 1) под кроватью, 2) в ванной за занавеской, 3) в шкафу, 4) там, где ты не хочешь искать. Последний — в тебе самом. Если услышишь шаги за спиной — не оборачивайся. Если увидишь своё отражение — не улыбайся. Если оно улыбнётся — БЕГИ".',
    choices: [
      { text: 'Взять ключ под кроватью', next: 'take_key' },
      { text: 'Запомнить', next: 'inspect' }
    ]
  },

  // ===== ГЛАВА 2: КОРИДОР =====
  hallway: {
    chapter: 2,
    text: () => 'Ты выходишь в длинный коридор. Свет мигает. В конце — три двери: ВАННАЯ, ШКАФ, и дверь без таблички. За спиной — шаги. Медленные. Приближающиеся.',
    choices: [
      { text: 'Ванная', next: 'bathroom' },
      { text: 'Шкаф', next: 'closet' },
      { text: 'Дверь без таблички', next: 'unknown' },
      { text: 'ОБЕРНУТЬСЯ', next: 'death_behind', onChoose: () => Screamer.show(1500) }
    ]
  },

  bathroom: {
    chapter: 2,
    text: () => 'Ванная. Занавеска задёрнута. Из-за неё капает что-то густое и тёмное. На полу — следы босых ног, ведущие ЗА занавеску.',
    choices: [
      { text: 'Отдёрнуть занавеску', next: 'bathroom_scream' },
      { text: 'Найти ключ так', next: 'bathroom_key' },
      { text: 'Посмотреть в слив', next: 'bathroom_drain' }
    ]
  },

  bathroom_drain: {
    chapter: 2,
    text: () => 'Ты наклоняешься к сливу. Оттуда смотрит глаз. Моргает. Он знает, что ты его видишь.',
    choices: [
      { text: 'Отпрянуть', next: 'bathroom', onChoose: () => Screamer.mini() },
      { text: 'Посмотреть ещё', next: 'death_drain', onChoose: () => Screamer.show(1200) }
    ]
  },

  bathroom_scream: {
    chapter: 2,
    text: () => 'За занавеской — никого. Только зеркало. И в нём — ТЫ. Но ты стоишь здесь. Значит...',
    choices: [
      { text: '...', next: 'death_mirror2', onChoose: () => Screamer.show(1200) }
    ]
  },

  bathroom_key: {
    chapter: 2,
    text: () => 'Ты нащупываешь ключ на полке. Второй есть. Из слива ванны доносится булькающий смех.',
    choices: [
      { text: 'Уйти', next: 'hallway', onChoose: () => Game.addKey() }
    ]
  },

  closet: {
    chapter: 2,
    text: () => 'Шкаф. Дверь приоткрыта. Внутри темнота гуще, чем должна быть. Оттуда пахнет землёй и старыми костями.',
    choices: [
      { text: 'Заглянуть внутрь', next: 'closet_scream' },
      { text: 'Пошарить рукой', next: 'closet_key' },
      { text: 'Закрыть и уйти', next: 'hallway' }
    ]
  },

  closet_scream: {
    chapter: 2,
    text: () => 'В темноте — лицо. Бледное. Глаза отсутствуют. Рот открывается, и оттуда выползает рука...',
    choices: [
      { text: 'Закрыть шкаф', next: 'hallway', onChoose: () => Screamer.show(1000) }
    ]
  },

  closet_key: {
    chapter: 2,
    text: () => 'Ты хватаешь что-то холодное. Ключ. Третий. Что-то липкое касается твоей руки в ответ.',
    choices: [
      { text: 'Отдёрнуть руку', next: 'hallway', onChoose: () => { Game.addKey(); Screamer.mini(); } }
    ]
  },

  unknown: {
    chapter: 2,
    text: () => 'Дверь без таблички. За ней — та же комната, из которой ты начал. Но теперь в ней стоит человек. Спиной. Он не двигается. На стене — те же четыре крючка. На трёх из них — что-то висит.',
    choices: [
      { text: 'Окликнуть', next: 'unknown_scream' },
      { text: 'Медленно отступить', next: 'hallway' },
      { text: 'Подойти ближе', next: 'unknown_close' }
    ]
  },

  unknown_close: {
    chapter: 2,
    text: () => 'Ты подходишь. Человек поворачивается. Это ты. Без лица. И оно открывает рот —',
    choices: [
      { text: '...', next: 'death_face', onChoose: () => Screamer.show(1500) }
    ]
  },

  unknown_scream: {
    chapter: 2,
    text: () => 'Человек не реагирует. Ты подходишь ближе. Замечаешь — у него нет ног. Он просто висит в воздухе. И медленно поворачивается.',
    choices: [
      { text: 'Бежать', next: 'hallway', onChoose: () => { Effects.silhouette(); Screamer.mini(); } }
    ]
  },

  // ===== ГЛАВА 3: ПОДВАЛ =====
  tunnel: {
    chapter: 3,
    text: () => 'Узкий туннель. Ты ползёшь. Стены влажные. Что-то касается твоей ноги. Ты не оборачиваешься. Впереди — свет.',
    choices: [
      { text: 'Ползти дальше', next: 'basement' },
      { text: 'Обернуться', next: 'death_tunnel', onChoose: () => Screamer.show(1400) }
    ]
  },

  basement: {
    chapter: 3,
    text: () => 'Подвал. Сырой. Тёмный. В центре — колодец. Из колодца доносится плач ребёнка. Или это смех?',
    choices: [
      { text: 'Заглянуть в колодец', next: 'well' },
      { text: 'Найти выход', next: 'basement_exit' },
      { text: 'Осмотреть стены', next: 'basement_walls' }
    ]
  },

  well: {
    chapter: 3,
    text: () => 'Ты смотришь в колодец. Оттуда — темнота. Но в темноте — отражение. Твоё. Оно машет тебе. Ты — нет.',
    choices: [
      { text: 'Бросить камень', next: 'well_stone' },
      { text: 'Крикнуть вниз', next: 'well_scream' },
      { text: 'Отойти', next: 'basement' }
    ]
  },

  well_stone: {
    chapter: 3,
    text: () => 'Ты бросаешь камень. Тишина. Долгая. Потом — звук удара. И голос снизу: "Спасибо. Теперь я знаю, где ты."',
    choices: [
      { text: 'Бежать', next: 'death_well', onChoose: () => Screamer.show(1400) }
    ]
  },

  well_scream: {
    chapter: 3,
    text: (name) => `Ты кричишь. Из колодца отвечает твой голос: "${name}, не кричи. Я сплю."`,
    choices: [
      { text: 'Замолчать', next: 'basement' },
      { text: 'Крикнуть снова', next: 'death_well2', onChoose: () => Screamer.show(1400) }
    ]
  },

  basement_walls: {
    chapter: 3,
    text: () => 'На стенах — рисунки. Детские. На них — дом. Ты. Оно. И слово, написанное много раз: "БЕГИ".',
    choices: [
      { text: 'Прочитать вслух', next: 'death_ritual', onChoose: () => { Screamer.show(1500); Audio.playWhisper(); } },
      { text: 'Уйти', next: 'basement' }
    ]
  },

  basement_exit: {
    chapter: 3,
    text: () => 'Ты находишь люк. Он заперт. Нужны все 4 ключа. У тебя — три. Четвёртый — где-то рядом.',
    choices: [
      { text: 'Искать', next: 'basement' },
      { text: 'Вернуться наверх', next: 'hallway' }
    ]
  },

  // ===== ФИНАЛЬНАЯ ЧАСТЬ =====
  final_door: {
    chapter: 4,
    text: (name) => `У тебя 4 ключа. Ты возвращаешься к главной двери. Дыхание за ней стало громче. Оно ждёт. Оно знает, что ты уже не выйдешь. Не таким, как вошёл. ${name}.`,
    choices: [
      { text: 'Открыть дверь', next: 'ending' },
      { text: 'Не открывать', next: 'ending2' }
    ]
  },

  ending: {
    chapter: 4,
    text: () => 'Дверь открывается. За ней — темнота. И в темноте — дверь. И ещё одна. И ещё. Ты делаешь шаг...',
    choices: []
  },

  ending2: {
    chapter: 4,
    text: () => 'Ты не открываешь дверь. Ты садишься на пол. Ждёшь. Проходит час. Два. Ты слышишь дыхание за дверью. Оно ждёт. Оно терпеливее тебя.',
    choices: [
      { text: 'Открыть', next: 'ending' },
      { text: 'Ждать дальше', next: 'ending3' }
    ]
  },

  ending3: {
    chapter: 4,
    text: (name) => `Ты ждёшь. И постепенно понимаешь: ты уже не помнишь, как тебя зовут. ${name}? Или нет? Ты не помнишь. Ты — часть этого места. Ты всегда был здесь.`,
    choices: []
  },

  // ===== СМЕРТИ =====
  death_door: { death: true, msg: 'Дверь открыл кто-то другой. И это был не человек.' },
  death_heart: { death: true, msg: 'Слишком много шума. Оно нашло тебя.' },
  death_head: { death: true, msg: 'Стук вошёл в тебя. И остался там.' },
  death_mirror: { death: true, msg: 'Ты разбил зеркало. Осколки вошли в глаза.' },
  death_mirror2: { death: true, msg: 'Отражение оказалось настоящим. А ты — нет.' },
  death_behind: { death: true, msg: 'Ты обернулся. Оно ждало именно этого.' },
  death_drain: { death: true, msg: 'Глаз в сливе моргнул. Ты утонул в ванной, в которой не было воды.' },
  death_face: { death: true, msg: 'Ты увидел своё лицо. Теперь у тебя его нет.' },
  death_tunnel: { death: true, msg: 'Ты обернулся в туннеле. Туннель обернулся вокруг тебя.' },
  death_well: { death: true, msg: 'Голос снизу знает, где ты. Теперь он идёт.' },
  death_well2: { death: true, msg: 'Второй крик был последним. Оно проснулось.' },
  death_ritual: { death: true, msg: 'Ты произнёс слово. Слово услышало тебя. И пришло.' }
};