// ============================================
// Генератор скримеров в SVG — ничего не качаем
// ============================================

const Screamer = {
  faces: [
    // Лицо 1 — бледное, без глаз
    () => `
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="800" fill="#000"/>
        <ellipse cx="400" cy="400" rx="220" ry="280" fill="#d8d0c8" opacity="0.9"/>
        <ellipse cx="320" cy="350" rx="30" ry="45" fill="#000"/>
        <ellipse cx="480" cy="350" rx="30" ry="45" fill="#000"/>
        <ellipse cx="320" cy="355" rx="8" ry="8" fill="#8b0000"/>
        <ellipse cx="480" cy="355" rx="8" ry="8" fill="#8b0000"/>
        <path d="M300 520 Q400 700 500 520 Q450 640 400 620 Q350 640 300 520 Z" fill="#000"/>
        <path d="M300 520 Q400 700 500 520" stroke="#4a0000" stroke-width="6" fill="none"/>
        ${this.teeth()}
        <ellipse cx="280" cy="580" rx="60" ry="20" fill="#6a0000" opacity="0.6"/>
        <ellipse cx="520" cy="580" rx="60" ry="20" fill="#6a0000" opacity="0.6"/>
      </svg>`,
    // Лицо 2 — трещины
    () => `
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="800" fill="#050000"/>
        <ellipse cx="400" cy="400" rx="240" ry="300" fill="#a8a098"/>
        <path d="M200 300 L600 300 L550 500 L450 480 L400 700 L300 600 L250 700 L200 500 Z" fill="#7a7068" opacity="0.5"/>
        <circle cx="310" cy="340" r="40" fill="#000"/>
        <circle cx="490" cy="340" r="40" fill="#000"/>
        <circle cx="310" cy="340" r="15" fill="#8b0000"/>
        <circle cx="490" cy="340" r="15" fill="#8b0000"/>
        <path d="M280 500 Q400 620 520 500" stroke="#000" stroke-width="8" fill="none"/>
        <path d="M300 500 L500 500 L450 580 L350 580 Z" fill="#000"/>
        ${this.teeth()}
        <path d="M350 200 L360 280 M450 200 L440 280 M400 180 L400 260" stroke="#4a0000" stroke-width="3"/>
      </svg>`,
    // Лицо 3 — окровавленное
    () => `
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="800" fill="#000"/>
        <ellipse cx="400" cy="420" rx="230" ry="290" fill="#c8b8a8"/>
        <ellipse cx="320" cy="360" rx="35" ry="50" fill="#1a0000"/>
        <ellipse cx="480" cy="360" rx="35" ry="50" fill="#1a0000"/>
        <circle cx="320" cy="365" r="12" fill="#ff0000"/>
        <circle cx="480" cy="365" r="12" fill="#ff0000"/>
        <path d="M290 540 Q400 700 510 540 L480 620 L320 620 Z" fill="#000"/>
        ${this.teeth()}
        <path d="M280 250 Q250 400 300 500" stroke="#8b0000" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M520 250 Q550 400 500 500" stroke="#8b0000" stroke-width="8" fill="none" opacity="0.7"/>
        <path d="M380 200 Q370 300 390 400" stroke="#8b0000" stroke-width="5" fill="none" opacity="0.5"/>
      </svg>`,
    // Лицо 4 — цифровое глитч-лицо
    () => `
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="800" fill="#000"/>
        ${Array.from({length: 40}, (_, i) =>
          `<rect x="${Math.random()*800}" y="${i*20}" width="${Math.random()*400}" height="8" fill="#8b0000" opacity="${Math.random()*0.8}"/>`
        ).join('')}
        <ellipse cx="400" cy="400" rx="200" ry="260" fill="#2a0000" opacity="0.9"/>
        <rect x="260" y="320" width="80" height="60" fill="#ff0000"/>
        <rect x="460" y="320" width="80" height="60" fill="#ff0000"/>
        <rect x="270" y="330" width="60" height="40" fill="#000"/>
        <rect x="470" y="330" width="60" height="40" fill="#000"/>
        <rect x="280" y="340" width="20" height="20" fill="#fff"/>
        <rect x="480" y="340" width="20" height="20" fill="#fff"/>
        <rect x="280" y="500" width="240" height="60" fill="#000"/>
        ${Array.from({length: 12}, (_, i) =>
          `<rect x="${290 + i*20}" y="500" width="15" height="60" fill="#fff" opacity="${Math.random()*0.7+0.3}"/>`
        ).join('')}
      </svg>`,
    // Лицо 5 — улыбка
    () => `
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="800" fill="#000"/>
        <ellipse cx="400" cy="400" rx="230" ry="290" fill="#e8e0d8"/>
        <path d="M300 330 Q320 300 350 330" stroke="#000" stroke-width="8" fill="none"/>
        <path d="M450 330 Q480 300 500 330" stroke="#000" stroke-width="8" fill="none"/>
        <ellipse cx="325" cy="370" rx="15" ry="20" fill="#000"/>
        <ellipse cx="475" cy="370" rx="15" ry="20" fill="#000"/>
        <path d="M250 480 Q400 720 550 480" stroke="#000" stroke-width="6" fill="#1a0000"/>
        <path d="M250 480 Q400 720 550 480 Q400 640 250 480 Z" fill="#000"/>
        ${this.teeth(0.6)}
        <path d="M240 480 L560 480" stroke="#4a0000" stroke-width="4"/>
      </svg>`
  ],

  teeth(opacity = 1) {
    let teeth = '';
    for (let i = 0; i < 8; i++) {
      const x = 290 + i * 32;
      teeth += `<path d="M${x} 520 L${x+14} 560 L${x+28} 520 Z" fill="#fff" opacity="${opacity}"/>`;
    }
    return teeth;
  },

  show(duration = 900) {
    const screamerEl = document.getElementById('screamer');
    const contentEl = document.getElementById('screamer-content');
    const face = this.faces[Math.floor(Math.random() * this.faces.length)];
    contentEl.innerHTML = face();
    screamerEl.classList.remove('hidden');

    Audio.playScreamer();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200, 50, 300]);

    setTimeout(() => {
      screamerEl.classList.add('hidden');
      contentEl.innerHTML = '';
    }, duration);
  },

  // Мини-скример — просто вспышка лица, короче
  mini() {
    this.show(400);
  }
};