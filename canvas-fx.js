/* ==========================================================================
   ADVANCED CANVAS FX ENGINE (Background Stars, Cursor Sparkles & Fireworks)
   ========================================================================== */

export class CanvasFX {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    this.stars = [];
    this.sparkles = [];
    this.fireworks = [];
    this.particles = [];
    
    this.width = 0;
    this.height = 0;
    this.mouse = { x: -100, y: -100 };
    
    this.isBlowingSmoke = false;
    this.smokeParticles = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Track mouse / touch for sparkle trailing
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.addCursorSparkle(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.addCursorSparkle(this.mouse.x, this.mouse.y);
      }
    });

    // Create background stars
    this.createBackgroundStars(120);

    // Start animation loop
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createBackgroundStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        color: ['#ffffff', '#ffd700', '#ff2a85', '#00f2fe'][Math.floor(Math.random() * 4)]
      });
    }
  }

  addCursorSparkle(x, y) {
    for (let i = 0; i < 2; i++) {
      this.sparkles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 12 - 6),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 + 0.5,
        size: Math.random() * 3 + 1,
        life: 1,
        maxLife: Math.random() * 30 + 20,
        color: ['#ffd700', '#ff2a85', '#00f2fe', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  launchFirework(startX = null, startY = null) {
    const x = startX || Math.random() * (this.width * 0.8) + this.width * 0.1;
    const targetY = startY || Math.random() * (this.height * 0.4) + this.height * 0.1;
    const y = this.height;

    const colors = [
      '#ffd700', '#ff2a85', '#9d4edd', '#00f2fe', '#ff7b00', '#3a86ff', '#ffffff'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.fireworks.push({
      x: x,
      y: y,
      targetY: targetY,
      speed: Math.random() * 4 + 8,
      color: color,
      exploded: false
    });
  }

  createFireworkBurst(x, y, color) {
    const particleCount = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.08,
        drag: 0.96,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 3 + 1.5,
        color: color
      });
    }
  }

  triggerMassiveFireworks(durationMs = 4000) {
    const interval = setInterval(() => {
      this.launchFirework();
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
    }, durationMs);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Stars
    for (const star of this.stars) {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed;
      }
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
      this.ctx.fillStyle = star.color;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Draw Cursor Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      const opacity = 1 - (s.life / s.maxLife);

      if (opacity <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = s.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 3. Draw & Update Fireworks Rockets
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.y -= fw.speed;

      this.ctx.save();
      this.ctx.fillStyle = fw.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = fw.color;
      this.ctx.beginPath();
      this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (fw.y <= fw.targetY) {
        this.createFireworkBurst(fw.x, fw.y, fw.color);
        this.fireworks.splice(i, 1);
      }
    }

    // 4. Draw & Update Explosion Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}
