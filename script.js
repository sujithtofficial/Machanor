// ═══════════════════════════════════════════════════════════
// MACHANOR — Interactive Animations Engine
// Neural network hero + getlayers.ai-style motion
// ═══════════════════════════════════════════════════════════

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth <= 768;

// ═══════════════════════════════════════════════════════════
// 1. CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════
(function initCursor() {
  if (isMobile || prefersReducedMotion) return;

  const cursor = document.getElementById('cursor');
  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll('a, button, [data-cursor]');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
})();

// ═══════════════════════════════════════════════════════════
// 2. PROGRESS BAR
// ═══════════════════════════════════════════════════════════
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ═══════════════════════════════════════════════════════════
// 3. NAV SCROLL
// ═══════════════════════════════════════════════════════════
const nav = document.getElementById('main-nav');
function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}

// ═══════════════════════════════════════════════════════════
// 4. MOBILE NAV
// ═══════════════════════════════════════════════════════════
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav-links');
let mobileOpen = false;
mobileToggle?.addEventListener('click', () => {
  mobileOpen = !mobileOpen;
  navLinks.classList.toggle('mobile-open', mobileOpen);
  mobileToggle.classList.toggle('active', mobileOpen);
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    if (isMobile) {
      mobileOpen = false;
      navLinks.classList.remove('mobile-open');
      mobileToggle.classList.remove('active');
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 5. HERO — ADVANCED NEURAL NETWORK CANVAS
// ═══════════════════════════════════════════════════════════
const hero = document.querySelector('.hero');

window.addEventListener('load', () => {
  setTimeout(() => hero?.classList.add('loaded'), 200);
});

(function neuralNetwork() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let nodes = [];
  let mouse = { x: null, y: null, active: false };
  let time = 0;

  // Node types: hub (larger, fewer), relay (medium), signal (small, many)
  const NODE_TYPES = {
    hub: { minR: 4, maxR: 7, count: 0.08, speed: 0.15, opacity: 0.7 },
    relay: { minR: 2.5, maxR: 4, count: 0.25, speed: 0.25, opacity: 0.5 },
    signal: { minR: 1, maxR: 2, count: 0.67, speed: 0.4, opacity: 0.35 }
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function initNodes() {
    const area = w * h;
    const totalCount = Math.floor(area / 12000) + 30;
    nodes = [];

    for (let i = 0; i < totalCount; i++) {
      let type;
      const r = Math.random();
      if (r < NODE_TYPES.hub.count) type = 'hub';
      else if (r < NODE_TYPES.hub.count + NODE_TYPES.relay.count) type = 'relay';
      else type = 'signal';

      const cfg = NODE_TYPES[type];
      const radius = cfg.minR + Math.random() * (cfg.maxR - cfg.minR);

      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r: radius,
        baseR: radius,
        type: type,
        opacity: cfg.opacity * (0.6 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02
      });
    }
  }

  function draw() {
    time += 1;
    ctx.clearRect(0, 0, w, h);

    // Update nodes
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      // Wrap around
      if (node.x < -20) node.x = w + 20;
      if (node.x > w + 20) node.x = -20;
      if (node.y < -20) node.y = h + 20;
      if (node.y > h + 20) node.y = -20;

      // Pulse animation
      node.r = node.baseR + Math.sin(time * node.pulseSpeed + node.phase) * (node.baseR * 0.3);

      // Mouse attraction for hub nodes, repulsion for signals
      if (mouse.active) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.6;
          if (node.type === 'hub') {
            // Attract hubs toward mouse
            node.vx -= (dx / dist) * force * 0.3;
            node.vy -= (dy / dist) * force * 0.3;
          } else {
            // Repel smaller nodes
            node.vx += (dx / dist) * force * 0.5;
            node.vy += (dy / dist) * force * 0.5;
          }
        }
      }

      // Speed limiting
      const maxSpeed = node.type === 'hub' ? 0.8 : node.type === 'relay' ? 1.2 : 1.5;
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > maxSpeed) {
        node.vx = (node.vx / speed) * maxSpeed;
        node.vy = (node.vy / speed) * maxSpeed;
      }

      // Damping
      node.vx *= 0.995;
      node.vy *= 0.995;
    });

    // Draw connections between nodes
    const connectionDist = 160;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist);
          // Gradient connection based on node types
          let lineAlpha = alpha * 0.12;
          if (nodes[i].type === 'hub' || nodes[j].type === 'hub') {
            lineAlpha = alpha * 0.2;
          }

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);

          // Use accent color for hub connections
          if (nodes[i].type === 'hub' && nodes[j].type === 'hub') {
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha * 1.5})`;
            ctx.lineWidth = 1.2;
          } else if (nodes[i].type === 'hub' || nodes[j].type === 'hub') {
            ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = `rgba(15, 20, 25, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
          }
          ctx.stroke();
        }
      }
    }

    // Draw mouse connections (bright accent lines to nearby nodes)
    if (mouse.active) {
      nodes.forEach(node => {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250) {
          const alpha = (1 - dist / 250);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha * 0.35})`;
          ctx.lineWidth = alpha * 1.5;
          ctx.stroke();
        }
      });

      // Draw mouse glow
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw nodes
    nodes.forEach(node => {
      // Outer glow for hubs
      if (node.type === 'hub') {
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 4);
        glow.addColorStop(0, `rgba(37, 99, 235, ${node.opacity * 0.15})`);
        glow.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);

      if (node.type === 'hub') {
        ctx.fillStyle = `rgba(37, 99, 235, ${node.opacity})`;
      } else if (node.type === 'relay') {
        ctx.fillStyle = `rgba(15, 20, 25, ${node.opacity * 0.7})`;
      } else {
        ctx.fillStyle = `rgba(15, 20, 25, ${node.opacity * 0.5})`;
      }
      ctx.fill();
    });

    // Traveling signals along connections (data pulses)
    const pulseTime = (time * 0.02) % 1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].type !== 'hub') continue;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j || nodes[j].type === 'signal') continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140 && dist > 40) {
          const t = (pulseTime + nodes[i].phase / (Math.PI * 2)) % 1;
          const px = nodes[j].x + (nodes[i].x - nodes[j].x) * t;
          const py = nodes[j].y + (nodes[i].y - nodes[j].y) * t;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(37, 99, 235, ${0.6 * Math.sin(t * Math.PI)})`;
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  // Mouse tracking
  hero.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  hero.addEventListener('mouseleave', () => { mouse.active = false; });

  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!prefersReducedMotion) {
    draw();
  }
})();

// ═══════════════════════════════════════════════════════════
// 6. PARALLAX ON SCROLL (image backgrounds)
// ═══════════════════════════════════════════════════════════
const parallaxElements = document.querySelectorAll('[data-parallax-depth]');

function updateParallax() {
  if (prefersReducedMotion) return;
  const scrollY = window.scrollY;

  parallaxElements.forEach(el => {
    const depth = parseFloat(el.dataset.parallaxDepth);
    const rect = el.parentElement.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const windowCenter = window.innerHeight / 2;
    const offset = (centerY - windowCenter) * depth;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

// ═══════════════════════════════════════════════════════════
// 7. SCROLL REVEAL — Multi-type animations
// ═══════════════════════════════════════════════════════════
function createRevealObserver(selector, options = {}) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const groups = new Map();
  elements.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(group => {
    group.forEach((el, i) => {
      el.style.transitionDelay = `${i * (options.stagger || 0.1)}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: options.threshold || 0.15,
    rootMargin: options.rootMargin || '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

createRevealObserver('.anim-fade-up', { stagger: 0.1 });
createRevealObserver('.anim-scale-in', { stagger: 0.12 });
createRevealObserver('.anim-reveal-clip', { stagger: 0.15, threshold: 0.2 });
createRevealObserver('.anim-slide-right', { stagger: 0.08 });

// ═══════════════════════════════════════════════════════════
// 8. WORD SPLIT ANIMATION
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.split-words').forEach(el => {
  const text = el.innerHTML;
  const parts = text.split(/(<br\s*\/?>)/gi);
  let html = '';
  parts.forEach(part => {
    if (part.match(/<br\s*\/?>/i)) {
      html += '<br/>';
    } else {
      const words = part.trim().split(/\s+/);
      words.forEach((word, i) => {
        if (word) {
          html += `<span class="word"><span class="word-inner" style="transition-delay:${i * 0.04}s">${word}</span></span>`;
        }
      });
    }
  });
  el.innerHTML = html;
});

const splitWordsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      splitWordsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.split-words').forEach(el => splitWordsObserver.observe(el));

// ═══════════════════════════════════════════════════════════
// 9. 3D TILT CARDS
// ═══════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    let bounds;
    let raf;

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 10. MAGNETIC BUTTONS
// ═══════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    let bounds;

    btn.addEventListener('mouseenter', () => {
      bounds = btn.getBoundingClientRect();
    });

    btn.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = btn.getBoundingClientRect();
      const relX = e.clientX - bounds.left - bounds.width / 2;
      const relY = e.clientY - bounds.top - bounds.height / 2;
      btn.style.transform = `translate(${relX * 0.2}px, ${relY * 0.35}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform = 'translate(0, 0)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 11. HORIZONTAL SCROLL (Showcase)
// ═══════════════════════════════════════════════════════════
const showcaseTrack = document.querySelector('.showcase-track');
if (showcaseTrack) {
  let isDown = false;
  let startX;
  let scrollLeft;

  showcaseTrack.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - showcaseTrack.offsetLeft;
    scrollLeft = showcaseTrack.scrollLeft;
  });
  showcaseTrack.addEventListener('mouseleave', () => { isDown = false; });
  showcaseTrack.addEventListener('mouseup', () => { isDown = false; });
  showcaseTrack.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - showcaseTrack.offsetLeft;
    const walk = (x - startX) * 1.5;
    showcaseTrack.scrollLeft = scrollLeft - walk;
  });
}

// ═══════════════════════════════════════════════════════════
// 12. ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════════
const counters = document.querySelectorAll('.outcome-num[data-count]');

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + target + suffix;
    }
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// ═══════════════════════════════════════════════════════════
// 13. METHOD TIMELINE — Scroll-linked progress
// ═══════════════════════════════════════════════════════════
const methodSection = document.querySelector('.method');
const timelineProgress = document.getElementById('timelineProgress');
const methodSteps = document.querySelectorAll('.method-step');

function updateTimeline() {
  if (!methodSection || !timelineProgress) return;

  const rect = methodSection.getBoundingClientRect();
  const sectionHeight = rect.height;
  const scrolled = -rect.top;
  const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight - window.innerHeight)));
  
  timelineProgress.style.height = (progress * 100) + '%';

  methodSteps.forEach((step, i) => {
    const stepProgress = (i + 1) / methodSteps.length;
    if (progress >= stepProgress - 0.2) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// ═══════════════════════════════════════════════════════════
// 14. IMAGE HOVER ZOOM (inside cards)
// ═══════════════════════════════════════════════════════════
if (!isMobile) {
  document.querySelectorAll('.card-img-wrap, .service-visual').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 15. SMOOTH SCROLL for anchor links
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const pos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 16. SCROLL EVENT HANDLER (batched)
// ═══════════════════════════════════════════════════════════
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      updateNav();
      updateParallax();
      updateTimeline();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  updateParallax();
  updateTimeline();
}, { passive: true });

// Initial calls
updateProgress();
updateNav();
updateParallax();

// ═══════════════════════════════════════════════════════════
// 17. FLOATING ANIMATION for AI image card
// ═══════════════════════════════════════════════════════════
if (!prefersReducedMotion) {
  const floatingEl = document.querySelector('.floating');
  if (floatingEl) {
    let t = 0;
    function floatLoop() {
      t += 0.015;
      const y = Math.sin(t) * 12;
      const r = Math.sin(t * 0.7) * 2;
      floatingEl.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      requestAnimationFrame(floatLoop);
    }
    floatLoop();
  }
}
