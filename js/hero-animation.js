/**
 * TapCard Pro - Hero Interactive Animated Background
 * Ultra-smooth 60FPS Particle, Constellation & NFC Pulse Radar Canvas
 * Fully reactive to Luxury Theme Presets & Mouse Interaction
 */
(function () {
  'use strict';

  function initHeroAnimation() {
    const heroWrapper = document.getElementById('heroWrapper');
    const canvas = document.getElementById('heroParticlesCanvas');
    const spotlight = document.getElementById('heroMouseSpotlight');
    if (!heroWrapper || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId = null;
    let isVisible = true;

    // Mouse coordinates relative to heroWrapper
    let mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false
    };

    // Color extraction from CSS variables
    let themeColors = {
      primary: '#10b981',
      secondary: '#06b6d4',
      primaryRgb: [16, 185, 129],
      secondaryRgb: [6, 182, 212]
    };

    function hexToRgb(hex) {
      hex = hex.trim();
      if (hex.startsWith('rgb')) {
        const matches = hex.match(/\d+/g);
        if (matches && matches.length >= 3) {
          return [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])];
        }
      }
      if (hex.startsWith('#')) {
        let c = hex.slice(1);
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        if (c.length === 6) {
          const num = parseInt(c, 16);
          return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
        }
      }
      return [16, 185, 129];
    }

    function updateThemeColors() {
      try {
        const style = getComputedStyle(document.body);
        const p = style.getPropertyValue('--accent-primary').trim() || '#10b981';
        const s = style.getPropertyValue('--accent-secondary').trim() || '#06b6d4';
        themeColors.primary = p;
        themeColors.secondary = s;
        themeColors.primaryRgb = hexToRgb(p);
        themeColors.secondaryRgb = hexToRgb(s);
      } catch (e) {
        // Fallback colors
        themeColors.primaryRgb = [16, 185, 129];
        themeColors.secondaryRgb = [6, 182, 212];
      }
    }

    // Observe theme attribute changes on document.body
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          updateThemeColors();
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    updateThemeColors();

    // Particle system
    const PARTICLE_COUNT = 65;
    const particles = [];

    // NFC Pulse Waves (Radiating from the 3D card position)
    const pulses = [];
    let lastPulseTime = 0;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
        this.y = initial ? Math.random() * height : Math.random() * height;
        this.baseRadius = 1.2 + Math.random() * 1.8;
        this.radius = this.baseRadius;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.baseAlpha = 0.2 + Math.random() * 0.45;
        this.alpha = this.baseAlpha;
        this.shimmerSpeed = 0.02 + Math.random() * 0.03;
        this.shimmerPhase = Math.random() * Math.PI * 2;
        this.colorType = Math.random() > 0.35 ? 'primary' : 'secondary';
      }

      update() {
        this.shimmerPhase += this.shimmerSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.shimmerPhase) * 0.15;
        if (this.alpha < 0.08) this.alpha = 0.08;

        // Mouse repulsion / interaction
        if (mouse.isHovered) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.8;
            this.x -= (dx / dist) * force;
            this.y -= (dy / dist) * force;
            this.alpha = Math.min(this.alpha + 0.3, 0.95);
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries with soft padding
        if (this.x < -20) this.x = width + 20;
        else if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        else if (this.y > height + 20) this.y = -20;
      }

      draw() {
        const rgb = this.colorType === 'primary' ? themeColors.primaryRgb : themeColors.secondaryRgb;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha})`;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha * 0.8})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }
    }

    // Pulse Wave representing NFC contactless radio frequency
    class NfcPulseWave {
      constructor(originX, originY) {
        this.x = originX;
        this.y = originY;
        this.radius = 20;
        this.maxRadius = Math.max(width, height) * 0.65;
        this.speed = 1.4;
        this.alpha = 0.45;
        this.decay = 0.0016;
      }

      update() {
        this.radius += this.speed;
        this.alpha -= this.decay;
        return this.alpha > 0.01 && this.radius < this.maxRadius;
      }

      draw() {
        const rgb = themeColors.primaryRgb;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha * 0.5})`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    function resize() {
      const rect = heroWrapper.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.scale(dpr, dpr);

      // Re-initialize particles if empty
      if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push(new Particle());
        }
      }
    }

    // Get position of the 3D smart card to anchor NFC radio wave pulses
    function getCardCenter() {
      const card = document.getElementById('hero3dCard');
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const wrapperRect = heroWrapper.getBoundingClientRect();
        return {
          x: cardRect.left - wrapperRect.left + cardRect.width / 2,
          y: cardRect.top - wrapperRect.top + cardRect.height / 2
        };
      }
      return {
        x: width * 0.72,
        y: height * 0.48
      };
    }

    // Mouse tracking & spotlight
    function onPointerMove(e) {
      const rect = heroWrapper.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;

      // Update CSS spotlight coordinates
      const pctX = ((mouse.targetX / rect.width) * 100).toFixed(1) + '%';
      const pctY = ((mouse.targetY / rect.height) * 100).toFixed(1) + '%';
      heroWrapper.style.setProperty('--mouse-x', pctX);
      heroWrapper.style.setProperty('--mouse-y', pctY);
    }

    function onPointerLeave() {
      mouse.isHovered = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      heroWrapper.style.setProperty('--mouse-x', '65%');
      heroWrapper.style.setProperty('--mouse-y', '45%');
    }

    heroWrapper.addEventListener('pointermove', onPointerMove, { passive: true });
    heroWrapper.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Animation loop
    function animate(currentTime) {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      if (mouse.isHovered) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Periodically trigger NFC pulse wave from card center (every 2.6 seconds)
      if (currentTime - lastPulseTime > 2600) {
        const center = getCardCenter();
        pulses.push(new NfcPulseWave(center.x, center.y));
        lastPulseTime = currentTime;
      }

      // Update and draw pulse waves
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        if (pulse.update()) {
          pulse.draw();
        } else {
          pulses.splice(i, 1);
        }
      }

      // Draw constellation connections between nearby particles
      const pRgb = themeColors.primaryRgb;
      const maxConnDist = 105;
      const count = particles.length;

      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnDist) {
            const alpha = (1 - dist / maxConnDist) * 0.18 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${pRgb[0]}, ${pRgb[1]}, ${pRgb[2]}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < count; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Visibility change handler to save battery when tab is backgrounded
    document.addEventListener('visibilitychange', () => {
      isVisible = document.visibilityState === 'visible';
    });

    // Window resize observer
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    });

    resize();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAnimation);
  } else {
    initHeroAnimation();
  }
})();
