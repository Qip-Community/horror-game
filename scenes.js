// ============================================
// Все сцены. Использует случайные события из Meta
// ============================================

const SCENES = {
  intro: {
    chapter: 1,
    text: (n) => `Ты просыпаешься на холодном полу. Голова раскалывается. Последнее, что помнишь — как ты открыл эту ссылку. В углу мерцает свеча. На стене — четыре пустых крючка. Дверь заперта. За ней что-то дышит. И оно знает твоё имя. ${n}.`,
    choices: [
      { text: 'Осмотреть комнату', next: 'inspect', onChoose: () => { Effects.shadowPass(); GameAudio.playGrowl(); Meta.maybeWebcamScreamer(0.15); } },
      { text: 'Крикнуть "Кто здесь?"', next: 'scream_back' },
      { text: 'Подойти к двери', next: 'door', onChoose: () => GameAudio.playCreak() },
      { text: 'Проверить карманы', next: 'pockets' }
    ]
  },

  pockets: {
    chapter: 1,
    text: () => 'В карманах: мобильник (нет сети), сломанный фонарик, и записка. На записке твоим почерком: "НЕ ХОДИ В ПОДВАЛ. ОНО ТАМ."',
    choices: [
      { text: 'Взять фонарик', next: 'intro', onChoose: () => Game.addItem('flashlight') },
      { text: 'Взять записку', next: 'intro', onChoose: () => Game.addItem('note') },
      { text: 'Вернуться', next: 'intro' }
    ]
  },

  scream_back: {
    chapter: 1,
    text: (n) => `Тишина. А потом — из глубины комнаты, оттуда, где нет стен, отвечает голос. Твой собственный. "${n}... зачем ты это сделал?"`,
    choices: [
      { text: 'Зажать уши', next: 'intro', onChoose: () => GameScreamer.mini() },
      { text: 'Спросить "Что сделать?"', next: 'scream_back2' },
      { text: 'Молчать', next: 'intro' }
    ]
  },

  scream_back2: {
    chapter: 1,
    text: () => 'Голос смеётся. Смех идёт из твоей груди. Ты смотришь вниз — грудь цела. Но смех продолжается.',
    choices: [
      { text: 'Бежать', next: 'inspect' },
      { text: 'Кричать в ответ', next: 'death_heart', onChoose: () => GameScreamer.double(1400, 'smile') }
    ]
  },

  door: {
    chapter: 1,
    text: () => 'Дверь ледяная. Ты прижимаешься ухом... и слышишь дыхание. Оно слышит тебя. Ручка медленно поворачивается С ТОЙ СТОРОНЫ.',
    choices: [
      { text: 'Отпрянуть', next: 'intro', onChoose: () => GameScreamer.mini() },
      { text: 'Открыть самому', next: 'death_door' },
      { text: 'Постучать', next: 'door_knock', onChoose: () => GameAudio.playKnock() }
    ]
  },

  door_knock: {
    chapter: 1,
    text: () => 'Ты стучишь. Три раза. Из-за двери — три раза в ответ. Потом ещё три. Стук не прекращается. Он СТУЧИТ УЖЕ ИЗНУТРИ ТВОЕЙ ГОЛОВЫ.',
    choices: [
      { text: 'Упасть на пол', next: 'death_head', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  inspect: {
    chapter: 1,
    text: () => 'Под кроватью — старый сундук. Внутри — 3 предмета: ржавый ключ, зеркальце и записка. На записке кровью: "Не смотри в зеркало. Оно смотрит в ответ".',
    choices: [
      { text: 'Взять ключ', next: 'take_key', onChoose: () => GameAudio.playClick() },
      { text: 'Посмотреть в зеркало', next: 'mirror' },
      { text: 'Прочитать записку полностью', next: 'note' },
      { text: 'Осмотреть кровать', next: 'bed' },
      { text: 'Осмотреть стены', next: 'walls_ch1' }
    ]
  },

  walls_ch1: {
    chapter: 1,
    text: () => 'На стенах — обои. На обоях — узор. Но узор повторяется. И в каждом повторении — лицо. Одно и то же. Оно улыбается.',
    choices: [
      { text: 'Закрыть глаза', next: 'inspect', onChoose: () => GameScreamer.mini() },
      { text: 'Провести рукой по стене', next: 'walls_touch' }
    ]
  },

  walls_touch: {
    chapter: 1,
    text: () => 'Ты проводишь рукой. Обои мокрые. Это не вода. Это кровь. Свежая.',
    choices: [
      { text: 'Вытереть', next: 'inspect' },
      { text: 'Понюхать', next: 'death_walls', onChoose: () => GameScreamer.double(1500, 'scream') }
    ]
  },

  bed: {
    chapter: 1,
    text: () => 'Под матрасом — что-то твёрдое. Ты запускаешь руку. Пальцы касаются холодного. Это не ключ. Это... палец.',
    choices: [
      { text: 'Отдёрнуть руку', next: 'inspect', onChoose: () => GameScreamer.mini() },
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
    text: () => 'Ты смотришь в зеркало. Отражение смотрит НЕ туда, куда смотришь ты. И улыбается. И поднимает руку. Ты — нет.',
    choices: [
      { text: 'Разбить зеркало', next: 'death_mirror', onChoose: () => GameScreamer.double(1200, 'smile') },
      { text: 'Отвернуться', next: 'inspect' },
      { text: 'Помахать отражению', next: 'mirror_wave' }
    ]
  },

  mirror_wave: {
    chapter: 1,
    text: () => 'Отражение машет в ответ. Но с задержкой. А потом — опережает тебя.',
    choices: [
      { text: 'Разбить зеркало', next: 'death_mirror', onChoose: () => GameScreamer.double(1400, 'scream') },
      { text: 'Уйти', next: 'inspect', onChoose: () => Game.addItem('mirror') }
    ]
  },

  note: {
    chapter: 1,
    text: () => 'Записка: "Ключи в: 1) под кроватью, 2) в ванной за занавеской, 3) в шкафу, 4) там, где ты не хочешь искать. Последний — в тебе самом. Если услышишь шаги за спиной — не оборачивайся."',
    choices: [
      { text: 'Взять ключ под кроватью', next: 'take_key' },
      { text: 'Запомнить', next: 'inspect', onChoose: () => GameAudio.playWhisper() }
    ]
  },

  hallway: {
    chapter: 2,
    text: () => 'Коридор. Свет мигает. Три двери: ВАННАЯ, ШКАФ, и дверь без таблички. За спиной — шаги.',
    choices: [
      { text: 'Ванная', next: 'bathroom' },
      { text: 'Шкаф', next: 'closet' },
      { text: 'Дверь без таблички', next: 'unknown' },
      { text: 'ОБЕРНУТЬСЯ', next: 'death_behind', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  bathroom: {
    chapter: 2,
    text: () => 'Ванная. Занавеска задёрнута. Из-за неё капает тёмное. На полу — следы босых ног.',
    choices: [
      { text: 'Отдёрнуть занавеску', next: 'bathroom_scream' },
      { text: 'Найти ключ так', next: 'bathroom_key' },
      { text: 'Посмотреть в слив', next: 'bathroom_drain' },
      { text: 'Посмотреть в зеркало', next: 'bathroom_mirror' }
    ]
  },

  bathroom_mirror: {
    chapter: 2,
    text: () => 'Зеркало в ванной. Отражение отстаёт на полсекунды. Ты моргаешь. Отражение — нет.',
    choices: [
      { text: 'Смотреть дальше', next: 'bathroom_mirror2' },
      { text: 'Отвернуться', next: 'bathroom' }
    ]
  },

  bathroom_mirror2: {
    chapter: 2,
    text: () => 'Отражение открывает рот. Оно говорит: "ОБЕРНИСЬ".',
    choices: [
      { text: 'Обернуться', next: 'death_mirror3', onChoose: () => GameScreamer.double(1500, 'scream') },
      { text: 'Разбить зеркало', next: 'death_mirror', onChoose: () => GameScreamer.double(1500, 'smile') }
    ]
  },

  bathroom_drain: {
    chapter: 2,
    text: () => 'Из слива смотрит глаз. Моргает. Он знает, что ты его видишь.',
    choices: [
      { text: 'Отпрянуть', next: 'bathroom', onChoose: () => GameScreamer.mini() },
      { text: 'Посмотреть ещё', next: 'death_drain', onChoose: () => GameScreamer.double(1400, 'scream') }
    ]
  },

  bathroom_scream: {
    chapter: 2,
    text: () => 'За занавеской — никого. Только зеркало. И в нём — ТЫ. Но ты стоишь здесь. Значит...',
    choices: [
      { text: '...', next: 'death_mirror2', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  bathroom_key: {
    chapter: 2,
    text: () => 'Ты нащупываешь ключ. Второй есть. Из слива доносится булькающий смех.',
    choices: [
      { text: 'Уйти', next: 'hallway', onChoose: () => Game.addKey() }
    ]
  },

  closet: {
    chapter: 2,
    text: () => 'Шкаф. Внутри темнота гуще, чем должна быть. Пахнет землёй и старыми костями.',
    choices: [
      { text: 'Заглянуть внутрь', next: 'closet_scream' },
      { text: 'Пошарить рукой', next: 'closet_key' },
      { text: 'Закрыть и уйти', next: 'hallway' },
      { text: 'Постучать по дверце', next: 'closet_knock', onChoose: () => GameAudio.playKnock() }
    ]
  },

  closet_knock: {
    chapter: 2,
    text: () => 'Ты стучишь. Изнутри стучат в ответ. Потом стук превращается в царапанье. Дверца дрожит.',
    choices: [
      { text: 'Держать дверцу', next: 'death_closet', onChoose: () => GameScreamer.double(1600, 'girl') },
      { text: 'Отойти', next: 'hallway', onChoose: () => { Effects.silhouette(); GameScreamer.mini(); } }
    ]
  },

  closet_scream: {
    chapter: 2,
    text: () => 'В темноте — лицо. Бледное. Без глаз. Рот открывается, и оттуда выползает рука...',
    choices: [
      { text: 'Закрыть шкаф', next: 'hallway', onChoose: () => GameScreamer.double(1100, 'smile') }
    ]
  },

  closet_key: {
    chapter: 2,
    text: () => 'Ты хватаешь что-то холодное. Ключ. Третий. Что-то липкое касается руки в ответ.',
    choices: [
      { text: 'Отдёрнуть руку', next: 'hallway', onChoose: () => { Game.addKey(); GameScreamer.mini(); } }
    ]
  },

  unknown: {
    chapter: 2,
    text: () => 'Дверь без таблички. За ней — та же комната. Но в ней стоит человек. Спиной. Не двигается.',
    choices: [
      { text: 'Окликнуть', next: 'unknown_scream' },
      { text: 'Медленно отступить', next: 'hallway' },
      { text: 'Подойти ближе', next: 'unknown_close' },
      { text: 'Бросить в него что-нибудь', next: 'unknown_throw' }
    ]
  },

  unknown_throw: {
    chapter: 2,
    text: () => 'Ключ проходит СКВОЗЬ человека. Он поворачивается. У него нет лица. Только рот.',
    choices: [
      { text: '...', next: 'death_face', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  unknown_close: {
    chapter: 2,
    text: () => 'Человек поворачивается. Это ты. Без лица. И оно открывает рот —',
    choices: [
      { text: '...', next: 'death_face', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  unknown_scream: {
    chapter: 2,
    text: () => 'Человек не реагирует. У него нет ног. Он висит в воздухе. И медленно поворачивается.',
    choices: [
      { text: 'Бежать', next: 'hallway', onChoose: () => { Effects.silhouette(); GameScreamer.mini(); } }
    ]
  },

  tunnel: {
    chapter: 3,
    text: () => 'Узкий туннель. Стены влажные. Что-то касается твоей ноги. Впереди — свет.',
    choices: [
      { text: 'Ползти дальше', next: 'basement' },
      { text: 'Обернуться', next: 'death_tunnel', onChoose: () => GameScreamer.double(1500, 'scream') }
    ]
  },

  basement: {
    chapter: 3,
    text: () => 'Подвал. В центре — колодец. Из колодца доносится плач ребёнка. Или смех?',
    choices: [
      { text: 'Заглянуть в колодец', next: 'well' },
      { text: 'Найти выход', next: 'basement_exit' },
      { text: 'Осмотреть стены', next: 'basement_walls' },
      { text: 'Осмотреть пол', next: 'basement_floor' }
    ]
  },

  basement_floor: {
    chapter: 3,
    text: () => 'Пол усыпан костями. Мелкими. Детскими. Хруст раздаётся не только под твоими ногами.',
    choices: [
      { text: 'Замереть', next: 'basement', onChoose: () => GameAudio.playWhisper() },
      { text: 'Бежать', next: 'death_bones', onChoose: () => GameScreamer.double(1400, 'smile') }
    ]
  },

  well: {
    chapter: 3,
    text: () => 'В темноте колодца — отражение. Твоё. Оно машет тебе. Ты — нет.',
    choices: [
      { text: 'Бросить камень', next: 'well_stone' },
      { text: 'Крикнуть вниз', next: 'well_scream' },
      { text: 'Отойти', next: 'basement' },
      { text: 'Спуститься', next: 'well_down' }
    ]
  },

  well_down: {
    chapter: 3,
    text: () => 'Ты спускаешься. Ты смотришь вверх. Оттуда на тебя смотрит кто-то. У него твоё лицо.',
    choices: [
      { text: 'Отпустить верёвку', next: 'death_well3', onChoose: () => GameScreamer.double(1800, 'smile') },
      { text: 'Забраться обратно', next: 'well' }
    ]
  },

  well_stone: {
    chapter: 3,
    text: () => 'Ты бросаешь камень. Тишина. Потом — звук удара. И голос снизу: "Спасибо. Теперь я знаю, где ты." Голос — твой.',
    choices: [
      { text: 'Бежать', next: 'death_well', onChoose: () => GameScreamer.girlReveal() }
    ]
  },

  well_scream: {
    chapter: 3,
    text: (n) => `Ты кричишь. Из колодца отвечает твой голос: "${n}, не кричи. Я сплю."`,
    choices: [
      { text: 'Замолчать', next: 'basement' },
      { text: 'Крикнуть снова', next: 'death_well2', onChoose: () => GameScreamer.double(1500, 'scream') }
    ]
  },

  basement_walls: {
    chapter: 3,
    text: () => 'На стенах — детские рисунки. Дом. Ты. Оно. И слово, написанное много раз: "БЕГИ".',
    choices: [
      { text: 'Прочитать вслух', next: 'death_ritual', onChoose: () => { GameScreamer.girlReveal(); GameAudio.playWhisper(); } },
      { text: 'Уйти', next: 'basement' },
      { text: 'Стереть рисунки', next: 'basement_walls_erase' }
    ]
  },

  basement_walls_erase: {
    chapter: 3,
    text: () => 'Под рисунками — ещё рисунки. И ещё. Они уходят вглубь стены. На каждом — твоё лицо, всё более искажённое.',
    choices: [
      { text: 'Прекратить', next: 'basement' },
      { text: 'Смотреть дальше', next: 'death_erase', onChoose: () => GameScreamer.double(1600, 'scream') }
    ]
  },

  basement_exit: {
    chapter: 3,
    text: () => 'Ты находишь люк. Он заперт. Нужны все 4 ключа. У тебя — три.',
    choices: [
      { text: 'Искать', next: 'basement' },
      { text: 'Вернуться наверх', next: 'hallway' }
    ]
  },

  final_door: {
    chapter: 4,
    text: (n) => `У тебя 4 ключа. Ты возвращаешься к главной двери. Оно ждёт. Оно знает, что ты уже не выйдешь таким, как вошёл. ${n}.`,
    choices: [
      { text: 'Открыть дверь', next: 'ending' },
      { text: 'Не открывать', next: 'ending2' }
    ]
  },

  ending: {
    chapter: 4,
    text: () => 'Дверь открывается. За ней — темнота. И в темноте — дверь. И ещё одна.',
    choices: []
  },

  ending2: {
    chapter: 4,
    text: () => 'Ты не открываешь дверь. Ты садишься на пол. Ждёшь. Оно терпеливее тебя.',
    choices: [
      { text: 'Открыть', next: 'ending' },
      { text: 'Ждать дальше', next: 'ending3' }
    ]
  },

  ending3: {
    chapter: 4,
    text: (n) => `Ты ждёшь. И понимаешь: ты уже не помнишь, как тебя зовут. ${n}? Или нет? Ты — часть этого места.`,
    choices: []
  },

  death_door: { death: true, msg: 'Дверь открыл кто-то другой. И это был не человек.' },
  death_heart: { death: true, msg: 'Слишком много шума. Оно нашло тебя.' },
  death_head: { death: true, msg: 'Стук вошёл в тебя. И остался там.' },
  death_mirror: { death: true, msg: 'Ты разбил зеркало. Осколки вошли в глаза.' },
  death_mirror2: { death: true, msg: 'Отражение оказалось настоящим. А ты — нет.' },
  death_mirror3: { death: true, msg: 'Ты обернулся. И увидел то, что говорило.' },
  death_behind: { death: true, msg: 'Ты обернулся. Оно ждало именно этого.' },
  death_drain: { death: true, msg: 'Глаз в сливе моргнул. Ты утонул в ванной без воды.' },
  death_face: { death: true, msg: 'Ты увидел своё лицо. Теперь у тебя его нет.' },
  death_tunnel: { death: true, msg: 'Туннель обернулся вокруг тебя.' },
  death_well: { death: true, msg: 'Голос снизу знает, где ты. Теперь он идёт.' },
  death_well2: { death: true, msg: 'Второй крик был последним.' },
  death_well3: { death: true, msg: 'Падение было долгим. Слишком долгим.' },
  death_ritual: { death: true, msg: 'Слово услышало тебя. И пришло.' },
  death_walls: { death: true, msg: 'Кровь на стенах была свежей. Теперь ты знаешь, чья она.' },
  death_bones: { death: true, msg: 'Ты побежал по костям. Кости схватили тебя.' },
  death_erase: { death: true, msg: 'Ты стёр рисунки. С ними стёрлось твоё лицо.' },
  death_closet: { death: true, msg: 'Ты держал дверцу. Оно держало твою руку. С той стороны.' },
  death_timeout: { death: true, msg: 'Время вышло. Оно вошло само.' }
};