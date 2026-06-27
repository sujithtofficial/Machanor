// ═══════════════════════════════════════════════════════════
// MACHANOR — Parallax Scrolling & Interactive Motion
// ═══════════════════════════════════════════════════════════

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────
// NAV SCROLL STATE
// ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');

function handleNavScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ─────────────────────────────────────────────
// MOBILE NAV TOGGLE
// ─────────────────────────────────────────────
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
    if (window.innerWidth <= 768) {
      mobileOpen = false;
      navLinks.classList.remove('mobile-open');
      mobileToggle.classList.remove('active');
    }
  });
});

// ─────────────────────────────────────────────
// PARALLAX SCROLLING
// ─────────────────────────────────────────────
const parallaxSections = document.querySelectorAll('.parallax-section');

function updateParallax() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  parallaxSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + scrollY;
    const speed = parseFloat(section.dataset.speed) || 0.3;

    // Only animate when section is near viewport
    if (rect.bottom > -windowHeight && rect.top < windowHeight * 2) {
      const offset = (scrollY - sectionTop) * speed;
      const bg = section.querySelector('.parallax-bg');
      if (bg) {
        bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
      }
    }
  });
}

if (!prefersReducedMotion) {
  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  updateParallax();
}

// ─────────────────────────────────────────────
// SCROLL REVEAL (Intersection Observer)
// ─────────────────────────────────────────────
const revealElements = document.querySelectorAll('.reveal');

// Group by parent to stagger
const parentGroups = new Map();
revealElements.forEach(el => {
  const parent = el.parentElement;
  if (!parentGroups.has(parent)) parentGroups.set(parent, []);
  parentGroups.get(parent).push(el);
});

parentGroups.forEach(group => {
  group.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

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

// ─────────────────────────────────────────────
// MAGNETIC BUTTONS (desktop only)
// ─────────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    let bounds;

    btn.addEventListener('mouseenter', () => {
      bounds = btn.getBoundingClientRect();
    });

    btn.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = btn.getBoundingClientRect();
      const relX = e.clientX - bounds.left - bounds.width / 2;
      const relY = e.clientY - bounds.top - bounds.height / 2;
      btn.style.transform = `translate(${relX * 0.15}px, ${relY * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

// ─────────────────────────────────────────────
// SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});

// ─────────────────────────────────────────────
// HERO ENTRANCE ANIMATION
// ─────────────────────────────────────────────
window.addEventListener('load', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.querySelectorAll('.reveal, .hero-badge, .hero-headline, .hero-sub, .hero-actions').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }
});
