import { initCoreScenes } from './nexora-core.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initReveal();
  initCursor();
  initInteractiveDepth();
  initScrollScenes();
  initFilters();
  initContactForm();
  initIntro();
  initCoreScenes();
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
});

function initNavigation() {
  const header = $('[data-header]');
  const menuButton = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
  };
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

function initScrollScenes() {
  const servicesSection = $('.services-section');
  const serviceCards = $$('.services-grid .service-card');
  const heroSection = $('.hero-section');
  if ((!servicesSection || !serviceCards.length) && !heroSection) return;
  if (reducedMotion) return;
  let ticking = false;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = value => value * value * (3 - 2 * value);
  const update = () => {
    ticking = false;
    const viewport = window.innerHeight || 800;
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(rect.height * .72, 1));
      heroSection.style.setProperty('--hero-scroll', progress.toFixed(3));
    }
    if (!servicesSection) return;
    const sectionRect = servicesSection.getBoundingClientRect();
    const sectionProgress = clamp((viewport * .82 - sectionRect.top) / Math.max(sectionRect.height - viewport * .28, 1));
    servicesSection.style.setProperty('--services-scroll', sectionProgress.toFixed(3));
    serviceCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = (viewport * .72 - rect.top) / Math.max(viewport * .72, 1);
      const entry = ease(clamp(distance));
      const exit = ease(clamp((viewport * .08 + rect.height - rect.top) / Math.max(rect.height, 1)));
      const intensity = clamp(entry * (1 - Math.max(0, exit - .78) * .32));
      card.style.setProperty('--panel-in', intensity.toFixed(3));
      card.style.setProperty('--panel-index', index);
      const inViewport = rect.bottom > viewport * .14 && rect.top < viewport * .86;
      card.classList.toggle('is-current', inViewport && intensity > .62 && rect.top < viewport * .62);
    });
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
}

function initReveal() {
  const elements = $$('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    elements.forEach(element => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -35px' });
  elements.forEach(element => observer.observe(element));
}

function initCursor() {
  const glow = $('.cursor-glow');
  if (!glow || !window.matchMedia('(pointer: fine)').matches || reducedMotion) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  window.addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; }, { passive: true });
  const tick = () => {
    x += (tx - x) * .1;
    y += (ty - y) * .1;
    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
    requestAnimationFrame(tick);
  };
  tick();
}

function initInteractiveDepth() {
  if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
  // Service panels use their transform for the scroll narrative; keep the
  // pointer tilt on project media where it cannot fight that motion.
  const elements = $$('.project-media');
  elements.forEach(element => {
    element.classList.add('interactive-depth');
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      element.style.setProperty('--tilt-x', `${(-y * 5.5).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${(x * 6.5).toFixed(2)}deg`);
      element.style.setProperty('--shine-x', `${((x + .5) * 100).toFixed(1)}%`);
      element.style.setProperty('--shine-y', `${((y + .5) * 100).toFixed(1)}%`);
      element.style.transform = `perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateY(-4px)`;
    }, { passive: true });
    element.addEventListener('pointerleave', () => {
      element.style.removeProperty('transform');
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
    });
  });
}

function initFilters() {
  const buttons = $$('[data-filter]');
  const projects = $$('.project-card[data-category]');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.classList.toggle('is-active', item === button));
    const filter = button.dataset.filter;
    projects.forEach(project => {
      const visible = filter === 'all' || project.dataset.category === filter;
      if (visible) {
        project.hidden = false;
        requestAnimationFrame(() => project.classList.add('is-visible'));
      } else {
        project.hidden = true;
        project.classList.remove('is-visible');
      }
    });
  }));
}

function initContactForm() {
  const form = $('#contact-form');
  const success = $('#form-success');
  if (!form || !success) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const button = $('button[type="submit"]', form);
    button.disabled = true;
    button.innerHTML = 'Mensaje enviado <span>✓</span>';
    success.hidden = false;
    form.reset();
  });
}

function initIntro() {
  const screen = $('#intro-screen');
  if (!screen) return;
  let seen = false;
  try { seen = sessionStorage.getItem('nexora-core-intro') === '1'; } catch {}
  if (seen || reducedMotion) { screen.remove(); return; }
  try { sessionStorage.setItem('nexora-core-intro', '1'); } catch {}
  const close = () => {
    screen.classList.add('is-closing');
    window.setTimeout(() => screen.remove(), 600);
  };
  window.setTimeout(close, 700);
}
