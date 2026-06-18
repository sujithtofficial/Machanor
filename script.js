// ============================================================
// MACHANOR — interaction & motion layer
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────
// NAV SCROLL STATE + PROGRESS BAR
// ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');
const progressBar = document.getElementById('progressBar');

function onScroll() {
  const scrolled = window.scrollY;
  nav.classList.toggle('scrolled', scrolled > 20);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ─────────────────────────────────────────────
// HERO LOAD-IN SEQUENCE
// ─────────────────────────────────────────────
const hero = document.querySelector('.hero');
requestAnimationFrame(() => {
  setTimeout(() => hero.classList.add('loaded'), 150);
});

// ─────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav-links');
let mobileOpen = false;
mobileToggle?.addEventListener('click', () => {
  mobileOpen = !mobileOpen;
  if (mobileOpen) {
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'fixed';
    navLinks.style.top = '70px';
    navLinks.style.left = '0'; navLinks.style.right = '0';
    navLinks.style.background = 'rgba(255,255,255,0.98)';
    navLinks.style.backdropFilter = 'blur(20px)';
    navLinks.style.padding = '20px 24px';
    navLinks.style.gap = '4px';
    navLinks.style.borderBottom = '1px solid #E7E9EE';
    navLinks.style.borderTop = '1px solid #E7E9EE';
  } else {
    navLinks.style.display = 'none';
  }
  mobileToggle.classList.toggle('active', mobileOpen);
});
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  if (window.innerWidth <= 768) { mobileOpen = false; navLinks.style.display = 'none'; }
}));

// ─────────────────────────────────────────────
// SCROLL REVEAL (staggered within groups)
// ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal-up');
const groups = new Map();
revealEls.forEach(el => {
  const parent = el.parentElement;
  if (!groups.has(parent)) groups.set(parent, []);
  groups.get(parent).push(el);
});
groups.forEach(list => {
  list.forEach((el, i) => { el.style.transitionDelay = (i * 0.08) + 's'; });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ─────────────────────────────────────────────
// JOURNEY RAIL FILL (scroll-linked)
// ─────────────────────────────────────────────
const journeySection = document.querySelector('.journey-section');
const journeyFill = document.getElementById('journeyFill');
const journeySteps = document.querySelectorAll('.journey-step');

if (journeySection) {
  const journeyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        journeyFill.style.width = '100%';
      }
    });
  }, { threshold: 0.4 });
  journeyObserver.observe(journeySection);

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const i = Array.from(journeySteps).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), i * 150);
      }
    });
  }, { threshold: 0.5 });
  journeySteps.forEach(s => stepObserver.observe(s));
}

// ─────────────────────────────────────────────
// ANIMATED COUNTERS
// ─────────────────────────────────────────────
const counters = document.querySelectorAll('.outcome-metric[data-count]');
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1400;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
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
}, { threshold: 0.6 });
counters.forEach(c => counterObserver.observe(c));

// ─────────────────────────────────────────────
// MAGNETIC BUTTONS
// ─────────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    let bounds;
    btn.addEventListener('mouseenter', () => { bounds = btn.getBoundingClientRect(); });
    btn.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = btn.getBoundingClientRect();
      const relX = e.clientX - bounds.left - bounds.width / 2;
      const relY = e.clientY - bounds.top - bounds.height / 2;
      btn.style.transform = `translate(${relX * 0.18}px, ${relY * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

// ============================================================
// CANVAS — AI NETWORK VISUAL (hero)
// ============================================================
(function heroCanvas() {
  const canvas = document.getElementById('aiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let nodes = [];
  let mouse = { x: null, y: null, active: false };
  let animId;

  const COLORS = {
    node: 'rgba(7,17,31,0.55)',
    nodeAccent: 'rgba(79,140,255,0.9)',
    nodeGold: 'rgba(184,148,90,0.85)',
    line: 'rgba(7,17,31,0.08)',
    lineNear: 'rgba(79,140,255,0.28)'
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
    const density = Math.min(w, 1400) / 1400;
    const count = Math.floor((w * h) / 16000 * density) + 18;
    nodes = [];
    for (let i = 0; i < count; i++) {
      const isAccent = Math.random() < 0.12;
      const isGold = !isAccent && Math.random() < 0.08;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: isAccent ? 2.6 : isGold ? 2.2 : 1.6 + Math.random() * 0.8,
        type: isAccent ? 'accent' : isGold ? 'gold' : 'normal',
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // update + draw nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;

      // gentle mouse attraction
      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const force = (1 - dist / 160) * 0.012;
          n.vx += dx * force * 0.02;
          n.vy += dy * force * 0.02;
        }
      }
      // gentle damping so velocity doesn't blow up
      n.vx *= 0.992;
      n.vy *= 0.992;
    });

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(7,17,31,${opacity * 0.07})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // line to mouse
      if (mouse.active) {
        const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(79,140,255,${(1 - dist / 180) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // draw nodes on top
    nodes.forEach(n => {
      const pulseR = n.r + Math.sin(n.pulse) * 0.4;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = n.type === 'accent' ? COLORS.nodeAccent : n.type === 'gold' ? COLORS.nodeGold : COLORS.node;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.active = false; });
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.active = false; });

  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!prefersReducedMotion) {
    draw();
  } else {
    // static single frame
    draw();
    cancelAnimationFrame(animId);
  }
})();

// ============================================================
// CANVAS — CTA SECTION SUBTLE GRID PULSE
// ============================================================
(function ctaCanvas() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((w * h) / 28000) + 10;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vy: -0.15 - Math.random() * 0.25,
        r: 0.8 + Math.random() * 1.4,
        opacity: 0.1 + Math.random() * 0.25
      });
    }
  }

  let visible = false;
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { visible = e.isIntersecting; if (visible && !prefersReducedMotion) loop(); });
  }, { threshold: 0.1 });
  ctaObserver.observe(canvas.parentElement);

  function loop() {
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,168,107,${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
