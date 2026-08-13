/* ==========================================================================
   ADVANCED BALLOON POPPING & PHYSICS MODULE
   ========================================================================== */

export class BalloonManager {
  constructor({ containerEl, audioManager, canvasFX, showToastCb }) {
    this.container = containerEl;
    this.audioManager = audioManager;
    this.canvasFX = canvasFX;
    this.showToast = showToastCb;

    this.compliments = [
      "✨ May your day be filled with endless joy and laughter!",
      "🎉 You are truly one in a million!",
      "🌟 Keep shining bright and inspiring everyone around you!",
      "🎂 Wishing you a year ahead full of extraordinary adventures!",
      "💖 Stay awesome, healthy, and happy always!",
      "🚀 The world is a better place with you in it!",
      "🎁 May all your secret wishes come true today!"
    ];

    this.colors = [
      { bg: 'linear-gradient(135deg, #ff2a85 0%, #b5179e 100%)', string: '#ff2a85' },
      { bg: 'linear-gradient(135deg, #ffd700 0%, #ff8800 100%)', string: '#ffd700' },
      { bg: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', string: '#00f2fe' },
      { bg: 'linear-gradient(135deg, #9d4edd 0%, #5a189a 100%)', string: '#9d4edd' },
      { bg: 'linear-gradient(135deg, #2ec4b6 0%, #0f9f90 100%)', string: '#2ec4b6' }
    ];

    this.init();
  }

  init() {
    // Spawn initial set of floating balloons & portrait cutouts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.spawnBalloon(), i * 600);
    }

    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.spawnPortraitBubble(), i * 1200 + 500);
    }

    // Keep spawning new balloons & portrait cutouts periodically
    setInterval(() => {
      if (document.querySelectorAll('.floating-balloon').length < 10) {
        this.spawnBalloon();
      }
      if (document.querySelectorAll('.floating-portrait').length < 6) {
        this.spawnPortraitBubble();
      }
    }, 2200);
  }

  spawnPortraitBubble() {
    const img = document.createElement('img');
    img.src = 'abhay_portrait.png';
    img.className = 'floating-portrait';

    const leftPos = Math.random() * 85 + 5;
    const duration = Math.random() * 8 + 10;
    const size = Math.random() * 25 + 75; // 75px to 100px

    img.style.cssText = `
      position: fixed;
      bottom: -120px;
      left: ${leftPos}vw;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid var(--accent-gold);
      box-shadow: 0 0 25px var(--accent-gold-glow), 0 10px 25px rgba(0,0,0,0.5);
      cursor: pointer;
      z-index: 6;
      object-fit: cover;
      background: var(--bg-secondary);
      animation: balloon-float ${duration}s linear forwards;
    `;

    img.addEventListener('click', (e) => this.popBalloon(img, e.clientX, e.clientY));

    this.container.appendChild(img);

    setTimeout(() => {
      if (img.parentNode) img.parentNode.removeChild(img);
    }, duration * 1000);
  }

  spawnBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';

    const colorObj = this.colors[Math.floor(Math.random() * this.colors.length)];
    const leftPos = Math.random() * 85 + 5; // 5% to 90% screen width
    const duration = Math.random() * 8 + 10; // 10s to 18s float time
    const size = Math.random() * 20 + 55; // 55px to 75px size

    balloon.style.cssText = `
      position: fixed;
      bottom: -100px;
      left: ${leftPos}vw;
      width: ${size}px;
      height: ${size * 1.25}px;
      background: ${colorObj.bg};
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      box-shadow: inset -8px -8px 15px rgba(0,0,0,0.3), inset 8px 8px 15px rgba(255,255,255,0.4), 0 10px 20px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 5;
      animation: balloon-float ${duration}s linear forwards;
    `;

    // Add balloon tail string
    const string = document.createElement('div');
    string.style.cssText = `
      position: absolute;
      bottom: -20px;
      left: 50%;
      width: 2px;
      height: 25px;
      background: ${colorObj.string};
      opacity: 0.7;
    `;
    balloon.appendChild(string);

    // Pop on click
    balloon.addEventListener('click', (e) => this.popBalloon(balloon, e.clientX, e.clientY));

    this.container.appendChild(balloon);

    // Remove when animation finishes
    setTimeout(() => {
      if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
    }, duration * 1000);
  }

  popBalloon(balloon, clickX, clickY) {
    if (balloon.dataset.popped) return;
    balloon.dataset.popped = "true";

    // Play Pop Sound
    if (this.audioManager) this.audioManager.playPopSound();

    // Canvas Firework/Sparkle Burst at click position
    if (this.canvasFX) {
      this.canvasFX.createFireworkBurst(clickX, clickY, '#ffd700');
    }

    // Show Compliment Toast
    const text = this.compliments[Math.floor(Math.random() * this.compliments.length)];
    if (typeof this.showToast === 'function') {
      this.showToast(text);
    }

    // Remove Balloon DOM element
    balloon.style.transform = 'scale(1.4)';
    balloon.style.opacity = '0';
    balloon.style.transition = 'all 0.15s ease';

    setTimeout(() => {
      if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
    }, 150);
  }
}
