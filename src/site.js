import { createExperience } from './experience.js';

const { gsap, ScrollTrigger, ScrollSmoother, SplitText } = window;
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
// The phone address bar resizing the viewport must not recalculate every trigger.
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const DESKTOP = '(min-width: 821px)';
const MOBILE = '(max-width: 820px)';

let smoother = null;
let experience = null;
const loops = [];

/* ---------------------------------------------------------------- 3D states */
// Positions are viewport fractions (-1..1); the experience converts them to world units.
const SCENES = {
  desktop: {
    hero:        { x: .34, y: .34, scale: .84, rotX: -.2, rotY: -.38, rotZ: -.3, opening: 0, spin: 0, glow: 1, camZ: 0 },
    heroOut:     { x: 1.7, y: .02, scale: 1.2, rotX: 0, rotY: .3, rotZ: -.2, opening: .2, spin: .4, glow: .6, camZ: 0 },
    manifesto:   { x: .96, y: .02, scale: 1.2, rotX: .12, rotY: .7, rotZ: -.1, opening: .4, spin: .8, glow: .6, camZ: 0 },
    services:    { x: -.6, y: -.42, scale: .66, rotX: .35, rotY: 1.2, rotZ: .2, opening: .9, spin: 1.6, glow: .85, camZ: 0 },
    servicesEnd: { x: -.6, y: -.42, scale: .66, rotX: -.25, rotY: 2.6, rotZ: -.2, opening: 1.2, spin: 3.4, glow: .85, camZ: 0 },
    work:        { x: .9, y: 1.5, scale: .42, rotX: .2, rotY: 3.2, rotZ: 0, opening: .3, spin: 4, glow: .35, camZ: 0 },
    method:      { x: -.5, y: .06, scale: 1, rotX: .3, rotY: 4.2, rotZ: .3, opening: 1.7, spin: 4.6, glow: .7, camZ: 0 },
    methodEnd:   { x: -.5, y: .06, scale: 1, rotX: -.2, rotY: 5.6, rotZ: -.3, opening: 0, spin: 6.2, glow: .95, camZ: 0 },
    contact:     { x: 0, y: -1.8, scale: 1, rotX: -.25, rotY: 6.9, rotZ: -.25, opening: .12, spin: 7, glow: .9, camZ: 0 },
    footer:      { x: 0, y: -1, scale: 1.35, rotX: .5, rotY: 6.3, rotZ: 0, opening: .55, spin: 7.8, glow: .75, camZ: 0 }
  },
  // Phones have no free column: the core has its own stage in the hero and in the method, and leaves in between.
  mobile: {
    hero:        { x: 0, y: .56, scale: .62, rotX: -.2, rotY: -.38, rotZ: -.3, opening: 0, spin: 0, glow: 1, camZ: 0 },
    manifesto:   { x: 0, y: 1.8, scale: .85, rotX: .12, rotY: .7, rotZ: -.1, opening: .4, spin: .8, glow: .6, camZ: 0 },
    services:    { x: 0, y: 1.8, scale: .85, rotX: .35, rotY: 1.2, rotZ: .2, opening: 1, spin: 1.6, glow: .6, camZ: 0 },
    servicesEnd: { x: 0, y: 1.8, scale: .85, rotX: -.25, rotY: 2.6, rotZ: -.2, opening: 1.2, spin: 3.4, glow: .6, camZ: 0 },
    work:        { x: 0, y: -1.8, scale: .85, rotX: .2, rotY: 3.2, rotZ: 0, opening: 1.6, spin: 4, glow: .6, camZ: 0 },
    method:      { x: 0, y: .42, scale: .85, rotX: .3, rotY: 4.2, rotZ: .3, opening: 1.4, spin: 4.6, glow: .8, camZ: 0 },
    methodEnd:   { x: 0, y: 1.8, scale: .85, rotX: -.2, rotY: 5.6, rotZ: -.3, opening: 0, spin: 6.2, glow: .9, camZ: 0 },
    contact:     { x: 0, y: 1.8, scale: .85, rotX: -.25, rotY: 6.9, rotZ: -.25, opening: 0, spin: 7, glow: .8, camZ: 0 },
    footer:      { x: 0, y: 1.8, scale: .85, rotX: .45, rotY: 6.3, rotZ: 0, opening: .55, spin: 7.8, glow: .5, camZ: 0 }
  }
};

function morph(from, to, scrollTrigger) {
  if (!experience) return null;
  return gsap.fromTo(experience.state, { ...from }, { ...to, ease: 'none', immediateRender: false, scrollTrigger: { scrub: true, ...scrollTrigger } });
}

/* ---------------------------------------------------------------- boot */
document.addEventListener('DOMContentLoaded', async () => {
  initExperience();
  initNavigation();
  initClock();
  initMotionToggle();
  initForm();
  initVideos();
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  if (reducedMotion) {
    root.classList.remove('is-loading');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => setProgress(self.progress) });
    return;
  }

  if (finePointer) {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: .9, effects: false, smoothTouch: false });
  }

  await Promise.race([document.fonts?.ready, new Promise(resolve => setTimeout(resolve, 1500))]);

  root.classList.add('has-motion');
  initCursor();
  initMagnetic();
  initHeaderBehavior();
  initMarquee();
  initReveals();
  initManifesto();
  initServices();
  initWork();
  initMethod();
  initFooter();
  initChoreography();
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => setProgress(self.progress) });
  ScrollTrigger.refresh();
  playIntro();
});

function setProgress(value) {
  const bar = $('[data-progress]');
  if (bar) bar.style.transform = `scaleX(${value.toFixed(4)})`;
}

/* ---------------------------------------------------------------- experience */
function initExperience() {
  const canvas = $('#webgl');
  experience = canvas ? createExperience(canvas, { reducedMotion }) : null;
  if (!experience) {
    root.classList.add('no-webgl');
    return;
  }
  const isMobile = window.matchMedia(MOBILE).matches;
  Object.assign(experience.state, (isMobile ? SCENES.mobile : SCENES.desktop).hero);
  if (!reducedMotion) Object.assign(experience.state, { scale: .35, opening: 2.4, glow: 0, rotY: -2.2 });
  experience.sync();
}

/* ---------------------------------------------------------------- intro */
function playIntro() {
  const scenes = window.matchMedia(MOBILE).matches ? SCENES.mobile : SCENES.desktop;
  const title = $('[data-hero-title]');
  const split = SplitText.create($$('.line', title), { type: 'chars', smartWrap: true });
  gsap.set(split.chars, { yPercent: 115, opacity: 0 });
  gsap.set('[data-fade]', { opacity: 0, y: 24 });

  let seen = false;
  try { seen = sessionStorage.getItem('nexora-intro') === '1'; } catch {}
  try { sessionStorage.setItem('nexora-intro', '1'); } catch {}

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (!seen) {
    const counter = { value: 0 };
    tl.to(counter, {
      value: 100, duration: 1.1, ease: 'power2.inOut',
      onUpdate: () => {
        $('[data-loader-count]').textContent = String(Math.round(counter.value)).padStart(3, '0');
        $('[data-loader-bar]').style.transform = `scaleX(${counter.value / 100})`;
      }
    })
      .to('.loader-inner', { opacity: 0, duration: .35, ease: 'power2.in' })
      .to('.loader-panel-top', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<.1')
      .to('.loader-panel-bottom', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<');
  }
  tl.add(() => root.classList.remove('is-loading'), seen ? 0 : '-=.2');
  if (experience) tl.to(experience.state, { ...scenes.hero, duration: 2.4, ease: 'expo.out' }, seen ? 0 : '-=.75');
  tl.to(split.chars, { yPercent: 0, opacity: 1, duration: 1.2, stagger: .018 }, seen ? .05 : '<.05')
    .to('[data-fade]', { opacity: 1, y: 0, duration: 1, stagger: .09 }, '<.3')
    .fromTo('.site-header', { opacity: 0 }, { opacity: 1, duration: 1, clearProps: 'opacity' }, '<');
}

/* ---------------------------------------------------------------- choreography */
function initChoreography() {
  if (!experience) return;
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    const scenes = SCENES.desktop;
    morph(scenes.hero, scenes.heroOut, { trigger: '.hero', start: 'top top', end: '55% top' });
    morph(scenes.heroOut, scenes.manifesto, { trigger: '.manifesto-text', start: 'top 80%', end: 'top 45%' });
    morph(scenes.manifesto, scenes.services, { trigger: '.services', start: 'top bottom', end: 'top top' });
    morph(scenes.services, scenes.servicesEnd, { trigger: '.services', start: 'top top', end: () => `+=${servicesDistance()}` });
    morph(scenes.servicesEnd, scenes.work, { trigger: '.work', start: 'top bottom', end: 'top 30%' });
    morph(scenes.work, scenes.method, { trigger: '.method', start: 'top bottom', end: 'top top' });
    morph(scenes.method, scenes.methodEnd, { trigger: '.method', start: 'top top', end: '+=260%' });
    morph(scenes.methodEnd, scenes.contact, { trigger: '.contact', start: 'top bottom', end: 'top 45%' });
    morph(scenes.contact, scenes.footer, { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom' });
  });
  mm.add(MOBILE, () => {
    const scenes = SCENES.mobile;
    morph(scenes.hero, scenes.manifesto, { trigger: '.hero', start: 'top top', end: '45% top' });
    morph(scenes.work, scenes.method, { trigger: '.method', start: 'top bottom', end: 'top top' });
    morph(scenes.method, scenes.methodEnd, { trigger: '.method', start: 'top top', end: () => `+=${window.innerHeight * .6}` });
  });
}

/* ---------------------------------------------------------------- text */
function initReveals() {
  $$('[data-split]').forEach(element => {
    SplitText.create(element, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: self => gsap.from(self.lines, {
        yPercent: 110, duration: 1.2, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: element, start: 'top 85%', once: true }
      })
    });
  });
  gsap.set('[data-reveal]', { opacity: 0 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: .1, ease: 'expo.out' })
  });
}

function initManifesto() {
  const text = $('[data-manifesto]');
  if (!text) return;
  SplitText.create(text, {
    type: 'words', wordsClass: 'word', autoSplit: true,
    onSplit: self => gsap.fromTo(self.words, { opacity: .5 }, {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: true }
    })
  });
}

/* ---------------------------------------------------------------- marquee */
let marqueeOnScreen = false;

function syncLoops() {
  const paused = !marqueeOnScreen || root.classList.contains('motion-paused');
  loops.forEach(loop => loop.paused(paused));
}

function initMarquee() {
  $$('[data-marquee]').forEach(row => {
    const track = $('.marquee-track', row);
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    row.append(clone);
    loops.push(gsap.to([track, clone], { xPercent: -100, duration: 32, ease: 'none', repeat: -1, paused: true }));
  });
  const speed = { value: 1 };
  const applySpeed = () => loops.forEach(loop => loop.timeScale(speed.value));
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onToggle: self => { marqueeOnScreen = self.isActive; syncLoops(); },
    onUpdate: self => {
      const velocity = self.getVelocity();
      const target = (1 + Math.min(Math.abs(velocity) / 500, 5)) * (velocity < 0 ? -1 : 1);
      gsap.to(speed, { value: target, duration: .2, overwrite: true, onUpdate: applySpeed, onComplete: () => gsap.to(speed, { value: 1, duration: 1.2, onUpdate: applySpeed }) });
    }
  });
}

/* ---------------------------------------------------------------- services */
function servicesDistance() {
  const track = $('[data-services-track]');
  return track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0;
}

function initServices() {
  const track = $('[data-services-track]');
  if (!track) return;
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    const cards = $$('.service-card', track);
    gsap.to(track, {
      x: () => -servicesDistance(), ease: 'none',
      scrollTrigger: {
        trigger: '.services', start: 'top top', end: () => `+=${servicesDistance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => experience?.nudge(self.getVelocity() / 6000)
      }
    });
    gsap.from(cards, {
      y: 80, opacity: 0, rotate: 2, duration: 1.2, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: '.services', start: 'top 70%', once: true }
    });
  });
  mm.add(MOBILE, () => {
    $$('.service-card', track).forEach(card => gsap.from(card, {
      y: 60, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true }
    }));
  });
}

/* ---------------------------------------------------------------- work */
function initWork() {
  const cards = $$('[data-project]');
  if (!cards.length) return;
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    const offset = () => $('[data-header]').offsetHeight + 24;
    const last = cards[cards.length - 1];
    cards.forEach((card, index) => {
      gsap.fromTo(card.querySelector('.iphone, .laptop'), { y: 48, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true }
      });
      if (card === last) return;
      ScrollTrigger.create({ trigger: card, start: () => `top top+=${offset()}`, endTrigger: last, end: () => `top top+=${offset()}`, pin: true, pinSpacing: false });
      const inner = card.querySelector('.project-inner');
      const dim = document.createElement('i');
      dim.className = 'project-dim';
      inner.append(dim);
      const next = cards[index + 1];
      gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top top+=${offset()}`, scrub: true } })
        .to(inner, { scale: .9 + index * .015, ease: 'none' }, 0)
        .to(dim, { opacity: .65, ease: 'none' }, 0);
      // A card buried under the next one stops decoding its video.
      const video = card.querySelector('video');
      if (video) ScrollTrigger.create({
        trigger: next, start: () => `top top+=${offset()}`, end: 'max',
        onEnter: () => { video.dataset.covered = '1'; syncVideo(video); },
        onLeaveBack: () => { video.dataset.covered = '0'; syncVideo(video); }
      });
    });
  });
  mm.add(MOBILE, () => {
    cards.forEach(card => gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } }));
  });
}

/* ---------------------------------------------------------------- method */
function initMethod() {
  const steps = $$('.method-step');
  const phase = $('[data-method-phase]');
  const names = ['Alinear', 'Diseñar', 'Implementar', 'Evolucionar'];
  let active = 0;
  const activate = step => {
    if (step === active) return;
    active = step;
    steps.forEach((element, index) => element.classList.toggle('is-active', index === step));
    if (phase) gsap.fromTo(phase, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out', onStart: () => { phase.textContent = names[step]; } });
  };
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    ScrollTrigger.create({
      trigger: '.method', start: 'top top', end: '+=260%', pin: true, anticipatePin: 1,
      onUpdate: self => activate(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * .999)))
    });
  });
}

/* ---------------------------------------------------------------- footer */
function initFooter() {
  const wordmark = $('[data-wordmark]');
  if (!wordmark) return;
  const split = SplitText.create(wordmark, { type: 'chars', charsClass: 'char' });
  gsap.from(split.chars, {
    yPercent: 70, stagger: .06, ease: 'none',
    scrollTrigger: { trigger: '.site-footer', start: 'top 85%', end: 'bottom bottom', scrub: true }
  });
}

/* ---------------------------------------------------------------- navigation */
function scrollToTarget(hash) {
  const target = hash === '#inicio' ? 0 : $(hash);
  if (target === null) return;
  if (smoother) smoother.scrollTo(target, true, 'top top');
  else if (target === 0) window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: reducedMotion ? 'auto' : 'smooth' });
}

function initNavigation() {
  const menuButton = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && !reducedMotion) gsap.from($$('a, p', mobileNav), { y: 40, opacity: 0, duration: .8, stagger: .06, ease: 'expo.out' });
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuButton.focus(); }
  });
  $$('[data-scroll-link]').forEach(link => link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash?.startsWith('#')) return;
    event.preventDefault();
    if (!mobileNav.hidden) setMenu(false);
    scrollToTarget(hash);
    history.replaceState(null, '', hash);
  }));
}

function initHeaderBehavior() {
  const header = $('[data-header]');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 24);
      header.classList.toggle('is-hidden', y > 400 && y > lastY && self.direction === 1);
      lastY = y;
    }
  });
  $$('.desktop-nav a').forEach(link => {
    const section = $(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({ trigger: section, start: 'top 50%', end: 'bottom 50%', toggleClass: { targets: link, className: 'is-active' } });
  });
}

function initClock() {
  const clock = $('[data-clock]');
  if (!clock) return;
  const format = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false });
  const update = () => { clock.textContent = format.format(new Date()); };
  update();
  setInterval(update, 20000);
}

/* ---------------------------------------------------------------- pointer */
function initCursor() {
  if (!finePointer) return;
  const cursor = $('.cursor');
  const ring = $('.cursor-ring', cursor);
  const dot = $('.cursor-dot', cursor);
  const label = $('[data-cursor-label]', cursor);
  root.classList.add('has-cursor');
  gsap.set(cursor, { opacity: 0 });
  window.addEventListener('pointermove', () => gsap.to(cursor, { opacity: 1, duration: .3 }), { once: true });
  const ringX = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
  const dotX = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
  window.addEventListener('pointermove', event => {
    ringX(event.clientX); ringY(event.clientY); dotX(event.clientX); dotY(event.clientY);
  }, { passive: true });
  document.addEventListener('pointerover', event => {
    const labelled = event.target.closest('[data-cursor]');
    const interactive = event.target.closest('a, button, input, textarea, label');
    cursor.classList.toggle('is-label', Boolean(labelled));
    cursor.classList.toggle('is-hover', Boolean(interactive) && !labelled);
    label.textContent = labelled ? labelled.dataset.cursor : '';
  });
  document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0, duration: .3 }));
  document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1, duration: .3 }));
}

function initMagnetic() {
  if (!finePointer) return;
  $$('.magnetic').forEach(element => {
    const x = gsap.quickTo(element, 'x', { duration: .6, ease: 'power3' });
    const y = gsap.quickTo(element, 'y', { duration: .6, ease: 'power3' });
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      x((event.clientX - rect.left - rect.width / 2) * .32);
      y((event.clientY - rect.top - rect.height / 2) * .32);
    });
    element.addEventListener('pointerleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' });
    });
  });
}

/* ---------------------------------------------------------------- motion toggle */
function initMotionToggle() {
  const button = $('[data-motion-toggle]');
  if (!button) return;
  if (reducedMotion) { button.hidden = true; return; }
  const label = $('[data-motion-label]', button);
  const apply = paused => {
    button.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'Reanudar movimiento' : 'Pausar movimiento';
    root.classList.toggle('motion-paused', paused);
    experience?.setPaused(paused);
    syncLoops();
    $$('video[data-lazy-video]').forEach(syncVideo);
    try { localStorage.setItem('nexora-motion-paused', paused ? '1' : '0'); } catch {}
  };
  let stored = false;
  try { stored = localStorage.getItem('nexora-motion-paused') === '1'; } catch {}
  button.addEventListener('click', () => apply(button.getAttribute('aria-pressed') !== 'true'));
  // Apply after the marquee loops exist.
  requestAnimationFrame(() => setTimeout(() => apply(stored), 0));
  // A paused core still follows the scroll; it only redraws when its target state changes.
  gsap.ticker.add(() => { if (root.classList.contains('motion-paused')) experience?.redraw(); });
}

/* ---------------------------------------------------------------- media */
function syncVideo(video) {
  const shouldPlay = video.dataset.inView === '1' && video.dataset.covered !== '1'
    && !reducedMotion && !root.classList.contains('motion-paused');
  if (shouldPlay) video.play().catch(() => {});
  else video.pause();
}

function initVideos() {
  const videos = $$('video[data-lazy-video]');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const video = entry.target;
    video.dataset.inView = entry.isIntersecting ? '1' : '0';
    const source = $('source[data-src]', video);
    if (entry.isIntersecting && source) {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
      video.load();
    }
    syncVideo(video);
  }), { rootMargin: '200px 0px' });
  videos.forEach(video => observer.observe(video));
}

/* ---------------------------------------------------------------- form */
function initForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form || !status) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = $$('input, textarea', form);
    let firstInvalid = null;
    fields.forEach(field => {
      const valid = field.checkValidity();
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      status.textContent = firstInvalid.type === 'email' && firstInvalid.value ? 'Revisa tu email: parece incompleto.' : 'Completa los campos marcados para continuar.';
      status.className = 'form-status is-error';
      firstInvalid.focus();
      return;
    }
    const data = new FormData(form);
    const subject = `Proyecto con Nexora — ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`;
    window.location.href = `mailto:hola@nexora.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Abrimos tu correo con el mensaje listo. Solo envíalo y te respondemos en 24–48 h.';
    status.className = 'form-status is-ok';
  });
  form.addEventListener('input', event => {
    if (event.target.getAttribute('aria-invalid') === 'true' && event.target.checkValidity()) event.target.setAttribute('aria-invalid', 'false');
  });
}
