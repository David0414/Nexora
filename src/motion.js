const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const { gsap, ScrollTrigger } = window;
import { initPremium } from './premium.js';

function heroWords() {
  const heading = $('#hero-title');
  heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
  [...heading.children].forEach(line => {
    const fragment = document.createDocumentFragment();
    [...line.childNodes].forEach(node => {
      const words = node.nodeType === Node.TEXT_NODE ? node.textContent.split(/(\s+)/) : [node];
      words.forEach(word => {
        if (typeof word === 'string' && !word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const mask = document.createElement('span'); mask.className = 'motion-word-mask'; mask.setAttribute('aria-hidden', 'true');
        const inside = document.createElement('span'); inside.className = 'motion-word';
        if (typeof word === 'string') inside.textContent = word;
        else inside.append(word);
        mask.append(inside); fragment.append(mask);
      });
    });
    line.replaceChildren(fragment);
  });
}

function tilt(element, amount = 8, restingZ = 0) {
  element.classList.add('motion-tilt');
  gsap.set(element, { transformPerspective: 1100, rotationZ: restingZ });
  const xTo = gsap.quickTo(element, 'rotationX', { duration: .65, ease: 'power3.out' });
  const yTo = gsap.quickTo(element, 'rotationY', { duration: .65, ease: 'power3.out' });
  element.addEventListener('pointermove', event => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    xTo(-y * amount); yTo(x * amount);
    element.style.setProperty('--glare-x', `${(x + .5) * 100}%`);
    element.style.setProperty('--glare-y', `${(y + .5) * 100}%`);
  });
  element.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  element.addEventListener('focusout', () => { xTo(0); yTo(0); });
}

function revealGroups() {
  const reversible = (trigger, start) => ({ trigger, start, toggleActions: 'play reverse play reverse' });
  // Animate individual headings and blocks rather than hiding entire sections.
  $$('.section h2').forEach(heading => {
    gsap.from(heading, { y: 48, rotationX: -23, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: reversible(heading, 'top 91%') });
    const marks = [...heading.querySelectorAll('mark')];
    if (marks.length) gsap.from(marks, { clipPath: 'inset(0 100% 0 0)', duration: .9, delay: .2, stagger: .1, ease: 'power3.inOut', scrollTrigger: reversible(heading, 'top 90%') });
  });
  $$('.eyebrow').forEach(label => gsap.from(label, { x: -20, opacity: 0, duration: .65, ease: 'power2.out', scrollTrigger: reversible(label, 'top 93%') }));
  $$('.heading-aside,.section-copy>p,.faq-aside').forEach(element => gsap.from(element, { y: 32, opacity: 0, duration: .85, scrollTrigger: reversible(element, 'top 94%') }));
  gsap.from('.social-grid', { y: 38, rotationX: 5, scale: .985, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: reversible('.social-grid', 'top 88%') });
  gsap.from('.reviews-layout>.reveal', { y: 34, rotationX: -6, opacity: 0, duration: .9, scrollTrigger: reversible('.reviews-layout>.reveal', 'top 88%') });
  gsap.from('.team-foot', { y: 24, opacity: 0, duration: .75, scrollTrigger: reversible('.team-foot', 'top 93%') });
  gsap.from('.faq-list', { y: 26, rotationY: 2, opacity: 0, duration: .85, scrollTrigger: reversible('.faq-list', 'top 90%') });
  ['.team-grid', '.pricing-grid', '.insight-grid'].forEach(selector => {
    const group = $(selector);
    // Each card returns to its starting pose when it leaves, then unfolds again
    // on the way back up. Keeping the end opacity lets the reverse play cleanly.
    gsap.fromTo([...group.children],
      { y: 65, rotationX: -8, opacity: 0 },
      { y: 0, rotationX: 0, opacity: 1, stagger: .1, duration: .85, ease: 'power3.out', scrollTrigger: reversible(group, 'top 88%') }
    );
  });
  gsap.from('.case-card', { y: 70, rotationX: 10, scale: .96, opacity: 0, duration: 1.15, ease: 'power3.out', scrollTrigger: reversible('.case-card', 'top 87%') });
  gsap.from('.crowd-panel', { y: 40, opacity: 0, duration: .9, scrollTrigger: reversible('.crowd-panel', 'top 90%') });
  gsap.from('.contact-layout>div,.contact-aside', { y: 40, opacity: 0, duration: .9, stagger: .16, scrollTrigger: reversible('#contact', 'top 80%') });
}

function pinnedFunnel() {
  const section = $('#process'), wrap = $('#process>.wrap');
  section.classList.add('motion-process');
  const note = document.createElement('div');
  note.className = 'process-scroll-note';
  note.innerHTML = '<span>Scroll to follow the funnel ↓</span><span><b class="process-stage">01 / 04</b><span class="process-progress-track"><i></i></span></span>';
  wrap.append(note);
  const tiers = $$('.funnel-tier'), buttons = $$('[data-step]');
  let lastStage = -1;
  let manualUntil = 0;
  function setStage(index) {
    if (lastStage === index) return;
    lastStage = index;
    buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
    tiers.forEach((tier, i) => {
      tier.classList.toggle('highlight', i === index);
      gsap.to(tier, { z: i === index ? 34 : 0, scale: i === index ? 1.04 : 1, duration: .55, ease: 'power3.out', overwrite: 'auto' });
    });
    $('.process-stage').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
  }
  const trigger = ScrollTrigger.create({
    id: 'process-pin', trigger: wrap, pin: true, start: 'top 65px', end: () => `+=${innerHeight * 2.1}`, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate(self) {
      gsap.set('.process-progress-track i', { scaleX: self.progress });
      if (performance.now() > manualUntil) setStage(Math.min(3, Math.floor(self.progress * 4)));
    }
  });
  gsap.fromTo('.funnel', { rotationX: 8, rotationY: -12 }, { rotationX: -3, rotationY: 10, ease: 'none', scrollTrigger: { trigger: wrap, start: () => trigger.start, end: () => trigger.end, scrub: 1 } });
  // Clicking a step stays available even while a section is pinned.
  buttons.forEach((button, index) => {
    const onClick = () => { manualUntil = performance.now() + 1200; setStage(index); };
    button.addEventListener('click', onClick);
    cleanup.push(() => button.removeEventListener('click', onClick));
  });
  setStage(0);
  return () => { section.classList.remove('motion-process'); note.remove(); tiers.forEach(tier => tier.classList.remove('highlight')); };
}
const cleanup = [];

export function initMotion() {
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.motion = 'reduced';
    return;
  }
  document.documentElement.classList.add('motion-ready');
  document.documentElement.dataset.motion = 'ready';
  heroWords();
  const progress = document.createElement('div'); progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
  gsap.to(progress, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });
  const cue = document.createElement('div'); cue.className = 'scroll-cue'; cue.setAttribute('aria-hidden', 'true'); cue.innerHTML = '<i></i>Scroll to explore'; $('.hero').append(cue);

  // Perspective typography unfolds as the opening screen clears.
  const intro = gsap.timeline({ delay: 1.1 });
  intro.from('.motion-word', { yPercent: 105, rotationX: -65, opacity: 0, duration: 1.2, stagger: .075, ease: 'power4.out' })
    .from('.hero .availability', { y: 15, opacity: 0, duration: .6 }, '<.1')
    .from('.hero-description,.hero-actions', { y: 28, opacity: 0, duration: .85, stagger: .1 }, '-=.8')
    .from('.floating-chip', { scale: .45, opacity: 0, duration: .8, stagger: .1, ease: 'back.out(1.4)' }, '-=.5');
  // A manual skip also skips the typography entrance.
  $('.intro').addEventListener('click', () => intro.progress(1));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && scrollY < 20) intro.progress(1); });
  const heroScroll = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .85 } });
  heroScroll.to('.hero-photo,#hero-canvas', { yPercent: 22, scale: 1.12, ease: 'none' }, 0)
    .to('.hero-content', { yPercent: 15, rotationX: 5, scale: .94, ease: 'none' }, 0)
    .to('.hero-chips', { yPercent: -18, ease: 'none' }, 0)
    .to('.hero-content,.hero-bottom,.hero-hint,.scroll-cue', { opacity: 0, ease: 'none', duration: .6 }, .4);
  revealGroups();

  const media = gsap.matchMedia();
  media.add('(min-width: 1000px) and (min-height: 740px)', () => {
    const undoFunnel = pinnedFunnel();
    return () => { cleanup.splice(0).forEach(fn => fn()); undoFunnel(); };
  });
  media.add('(min-width: 681px)', () => {
    gsap.fromTo('.radar-disc', { rotationX: 30, rotationZ: -12, scale: .87 }, { rotationX: 0, rotationZ: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.clients', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.fromTo('.report', { rotationX: 17, y: 50, scale: .95 }, { rotationX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.report', start: 'top 95%', end: 'top 25%', scrub: 1 } });
    gsap.fromTo('.review-phone', { rotationY: -18, rotationZ: -7, y: 50 }, { rotationY: 7, rotationZ: 4, y: -25, ease: 'none', scrollTrigger: { trigger: '.reviews', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    $$('.social-post').forEach((post, index) => {
      gsap.fromTo(post, { y: index % 2 ? 70 : -35, rotationZ: index % 2 ? -9 : 8, rotationY: index % 2 ? -12 : 12 }, { y: index % 2 ? -35 : 40, rotationZ: index % 2 ? 3 : -3, rotationY: 0, ease: 'none', scrollTrigger: { trigger: '.social-grid', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    $$('.team-image img,.insight-image img').forEach(image => gsap.fromTo(image, { scale: 1.16, yPercent: -5 }, { scale: 1.02, yPercent: 5, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
  });
  media.add('(max-width: 680px)', () => {
    // Lighter touch-sized 3D parallax keeps the same motion going on phones
    // without hover effects, pinned sections, or expensive full-screen layers.
    gsap.fromTo('.radar-disc', { y: 22, rotationZ: -3, scale: .96 }, { y: 0, rotationZ: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.clients', start: 'top bottom', end: 'center center', scrub: .8 } });
    gsap.fromTo('.report', { rotationX: 6, y: 24, scale: .985 }, { rotationX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.report', start: 'top 95%', end: 'top 22%', scrub: .8 } });
    gsap.fromTo('.review-phone', { rotationY: -5, rotationZ: 1, y: 24 }, { rotationY: 0, rotationZ: 3, y: -12, ease: 'none', scrollTrigger: { trigger: '.reviews', start: 'top bottom', end: 'bottom top', scrub: .8 } });
    $$('.team-image img,.insight-image img').forEach(image => gsap.fromTo(image, { scale: 1.08, yPercent: -3 }, { scale: 1.025, yPercent: 3, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .8 } }));
  });
  media.add('(hover: hover) and (pointer: fine)', () => {
    $$('.price-card').forEach(card => tilt(card, 10));
    $$('.team-image,.insight-image').forEach(card => tilt(card, 9));
    tilt($('.service-demo'), 7);
    tilt($('.radar'), 8);
    $$('.button').forEach(button => {
      const xTo = gsap.quickTo(button, 'x', { duration: .4, ease: 'power3.out' });
      const yTo = gsap.quickTo(button, 'y', { duration: .4, ease: 'power3.out' });
      button.addEventListener('pointermove', event => { const bounds = button.getBoundingClientRect(); xTo((event.clientX - bounds.left - bounds.width / 2) * .12); yTo((event.clientY - bounds.top - bounds.height / 2) * .2); });
      button.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  });
  gsap.fromTo('.footer-wordmark', { y: 75, rotationX: 35, opacity: .15 }, { y: 0, rotationX: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 90%', end: 'bottom bottom', scrub: 1 } });

  initPremium({ gsap, ScrollTrigger, media });

  // WebGL is optional. Low-power/mobile devices and unsupported browsers keep the 2D scene.
  import('./scene.js').then(({ createAudienceScene }) => {
    const scene = createAudienceScene($('#audience-3d'));
    if (!scene) return;
    gsap.to(scene.motion, { progress: 1, ease: 'none', scrollTrigger: { trigger: '.crowd-panel', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  }).catch(() => { $('#audience-3d').dataset.state = 'fallback'; });
  Promise.all([document.fonts.ready, new Promise(resolve => { if (document.readyState === 'complete') resolve(); else window.addEventListener('load', resolve, { once: true }); })]).then(() => ScrollTrigger.refresh());
}
