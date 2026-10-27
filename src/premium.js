const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function initPremium({ gsap, ScrollTrigger, media }) {
  document.documentElement.classList.add('premium-ready');
  serviceTransitions(gsap);
  interactiveReport(gsap, ScrollTrigger);
  accordionMotion(gsap, ScrollTrigger);
  detailMotion(gsap);
  signalExperience(gsap);
  exploreMenu(gsap);
  galleryExperience(gsap, ScrollTrigger, media);
  const ribbon = document.createElement('div');
  ribbon.className = 'brand-ribbon'; ribbon.setAttribute('aria-hidden', 'true');
  ribbon.innerHTML = `<div class="brand-ribbon-track">${Array.from({ length: 4 }, () => '<span>Good brands deserve to be found.</span><i>✳</i><span>Make every impression matter.</span><i>↗</i>').join('')}</div>`;
  $('.hero').after(ribbon);
  const ribbonTween = gsap.to('.brand-ribbon-track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting && !document.hidden) ribbonTween.play(); else ribbonTween.pause(); }).observe(ribbon);
  document.addEventListener('visibilitychange', () => { if (document.hidden) ribbonTween.pause(); else if (ribbon.getBoundingClientRect().top < innerHeight && ribbon.getBoundingClientRect().bottom > 0) ribbonTween.play(); });

  media.add('(hover: hover) and (pointer: fine) and (min-width: 681px)', () => {
    const cleanups = [contextCursor(gsap), chapterNavigation(gsap, ScrollTrigger), letterWave(gsap)];
    return () => cleanups.forEach(cleanup => cleanup());
  });
  $$('[data-billing]').forEach(button => button.addEventListener('click', () => {
    gsap.fromTo('.price-value', { rotationX: -45, y: 10, opacity: .45 }, { rotationX: 0, y: 0, opacity: 1, duration: .6, stagger: .055, overwrite: true });
  }));
  $('#audit-form').addEventListener('submit', () => {
    if (!$('#form-result').hidden) gsap.fromTo('#form-result', { y: 14, scaleY: .85, opacity: 0 }, { y: 0, scaleY: 1, opacity: 1, duration: .6, ease: 'back.out(1.2)' });
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('.button');
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('i'); ripple.className = 'button-ripple'; ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${event.detail ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${event.detail ? event.clientY - rect.top : rect.height / 2}px`;
    button.append(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: .2 }, { scale: 4, opacity: 0, duration: .7, onComplete: () => ripple.remove() });
  });
}

function serviceTransitions(gsap) {
  const panel = $('#service-panel');
  let outgoing = null, direction = 1;
  function removeSnapshot() { if (outgoing) { gsap.killTweensOf(outgoing); outgoing.remove(); outgoing = null; } $$('.service-scan,.service-transition-label', panel).forEach(el => { gsap.killTweensOf(el); el.remove(); }); }
  document.addEventListener('reachwise:service-before', event => {
    removeSnapshot(); direction = event.detail.direction;
    outgoing = panel.cloneNode(true);
    outgoing.classList.remove('reveal', 'is-visible'); outgoing.classList.add('service-outgoing');
    outgoing.removeAttribute('id'); outgoing.removeAttribute('role'); outgoing.removeAttribute('aria-labelledby');
    outgoing.setAttribute('aria-hidden', 'true'); outgoing.inert = true;
    $$('[id]', outgoing).forEach(el => el.removeAttribute('id'));
    panel.append(outgoing);
  });
  document.addEventListener('reachwise:service-change', event => {
    const snapshot = outgoing;
    if (snapshot) gsap.to(snapshot, { clipPath: direction > 0 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)', y: direction * -18, duration: .72, ease: 'power3.inOut', onComplete: () => { snapshot.remove(); if (outgoing === snapshot) outgoing = null; } });
    gsap.fromTo($('#service-demo>div'), { y: direction * 40, rotationY: direction * -16, scale: .93, opacity: .25 }, { y: 0, rotationY: 0, scale: 1, opacity: 1, duration: .85, ease: 'power3.out', overwrite: true });
    gsap.fromTo($$('#service-panel>.service-detail>h3,#service-panel>.service-detail>p,#service-panel>.service-detail>.included,#service-panel>.service-detail>.service-bottom'), { y: direction * 18, opacity: .3 }, { y: 0, opacity: 1, stagger: .05, duration: .55, delay: .12, overwrite: true });
    const scan = document.createElement('i'); scan.className = 'service-scan'; scan.setAttribute('aria-hidden', 'true'); panel.append(scan);
    gsap.fromTo(scan, { y: direction > 0 ? 0 : panel.clientHeight }, { y: direction > 0 ? panel.clientHeight : 0, opacity: 0, duration: .75, ease: 'power3.inOut', onComplete: () => scan.remove() });
    const label = document.createElement('span'); label.className = 'service-transition-label'; label.setAttribute('aria-hidden', 'true'); label.textContent = `CHANNEL ${String(event.detail.index + 1).padStart(2, '0')} ↗`; panel.append(label);
    gsap.fromTo(label, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .35 });
    gsap.to(label, { opacity: 0, delay: 1.1, duration: .3, onComplete: () => label.remove() });
  });
}

function interactiveReport(gsap, ScrollTrigger) {
  const chart = $('.report-chart'), line = $('#report-line'), report = $('.report');
  const namespace = 'http://www.w3.org/2000/svg';
  const cursor = document.createElementNS(namespace, 'g'); cursor.classList.add('chart-cursor'); cursor.setAttribute('aria-hidden', 'true');
  const vertical = document.createElementNS(namespace, 'line'); vertical.setAttribute('stroke', '#0d0e1040'); vertical.setAttribute('stroke-dasharray', '4 4'); vertical.setAttribute('y1', '0'); vertical.setAttribute('y2', '200');
  const point = document.createElementNS(namespace, 'circle'); point.setAttribute('r', '6'); point.setAttribute('fill', '#0d0e10'); point.setAttribute('stroke', '#d4ff3a'); point.setAttribute('stroke-width', '3'); cursor.append(vertical, point); chart.append(cursor);
  const tooltip = document.createElement('div'); tooltip.className = 'report-tooltip'; tooltip.setAttribute('aria-hidden', 'true'); report.append(tooltip);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const samples = { overview: [1.1, 1.4, 1.8, 2.1, 2.4, 2.8, 3.1, 3.3, 3.8, 4.1, 4.5, 5.6], seo: [82, 88, 96, 111, 124, 140, 156, 171, 184, 195, 208, 212], social: [.3, .6, .8, 1.1, 1.4, 1.8, 2.2, 2.5, 2.8, 3.2, 3.7, 4.1], ads: [2.1, 2.3, 2.8, 3.1, 3.4, 3.7, 4.2, 4.5, 4.8, 5.2, 5.8, 6.2] };
  let active = 'overview';
  function trace() { const length = line.getTotalLength(); gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', overwrite: true }); }
  const lineLength = line.getTotalLength();
  gsap.fromTo(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength }, {
    strokeDasharray: lineLength, strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: chart, start: 'top 88%', end: 'top 35%', scrub: .8 }
  });
  $$('[data-report]').forEach(button => button.addEventListener('click', () => { active = button.dataset.report; trace(); gsap.fromTo('.report-metrics b', { y: 12, opacity: .3 }, { y: 0, opacity: 1, duration: .55, stagger: .06, overwrite: true }); }));
  function explore(event) {
    const rect = chart.getBoundingClientRect(), parent = report.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const month = Math.round(fraction * 11), desiredX = fraction * 1100;
    let low = 0, high = line.getTotalLength();
    for (let i = 0; i < 12; i++) { const mid = (low + high) / 2; if (line.getPointAtLength(mid).x < desiredX) low = mid; else high = mid; }
    const position = line.getPointAtLength((low + high) / 2);
    vertical.setAttribute('x1', position.x); vertical.setAttribute('x2', position.x); point.setAttribute('cx', position.x); point.setAttribute('cy', position.y);
    const value = samples[active][month], suffix = active === 'seo' ? ' #1 keywords' : active === 'ads' ? '× ROAS' : 'M reach';
    tooltip.replaceChildren(); const title = document.createElement('b'); title.textContent = `${months[month]} 2025 · SAMPLE`; const data = document.createElement('span'); data.textContent = `${value}${suffix}`; tooltip.append(title, data);
    tooltip.style.left = `${Math.max(100, Math.min(parent.width - 100, event.clientX - parent.left))}px`;
    tooltip.style.top = `${rect.top - parent.top + position.y / 200 * rect.height}px`;
    gsap.to([cursor, tooltip], { opacity: 1, duration: .18, overwrite: true });
  }
  chart.addEventListener('pointermove', explore);
  chart.addEventListener('pointerleave', () => gsap.to([cursor, tooltip], { opacity: 0, duration: .2, overwrite: true }));
}

function accordionMotion(gsap, ScrollTrigger) {
  $$('#faq-list details').forEach(details => {
    $('summary', details).addEventListener('click', event => {
      event.preventDefault();
      const summary = $('summary', details), paragraph = $('p', details);
      const opening = !details.open || details.dataset.transition === 'closing';
      const start = details.getBoundingClientRect().height;
      gsap.killTweensOf([details, paragraph]);
      if (opening) {
        details.open = true; details.style.height = 'auto'; const end = details.getBoundingClientRect().height;
        details.dataset.transition = 'opening';
        gsap.fromTo(details, { height: start }, { height: end, duration: .45, ease: 'power3.inOut', onComplete: () => { details.style.height = ''; delete details.dataset.transition; ScrollTrigger.refresh(); } });
        gsap.fromTo(paragraph, { y: -10, opacity: 0 }, { y: 0, opacity: 1, delay: .1, duration: .3 });
      } else {
        details.dataset.transition = 'closing';
        gsap.to(paragraph, { opacity: 0, y: -6, duration: .18 });
        gsap.to(details, { height: summary.getBoundingClientRect().height, duration: .35, ease: 'power3.inOut', onComplete: () => { details.open = false; details.style.height = ''; delete details.dataset.transition; gsap.set(paragraph, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
      }
    });
  });
}

function detailMotion(gsap) {
  const dialog = $('#detail-dialog');
  let closing = false;
  document.addEventListener('reachwise:dialog-open', event => {
    closing = false; gsap.killTweensOf(dialog);
    if (!event.detail.wasOpen) gsap.fromTo(dialog, { y: 65, rotationX: 8, scale: .94, opacity: .1 }, { y: 0, rotationX: 0, scale: 1, opacity: 1, duration: .65, ease: 'power3.out' });
    else gsap.to(dialog, { y: 0, rotationX: 0, scale: 1, opacity: 1, duration: .3, overwrite: true });
    gsap.fromTo($('#dialog-content'), { y: 17, opacity: .35 }, { y: 0, opacity: 1, duration: .45, overwrite: true });
  });
  document.addEventListener('reachwise:dialog-close', event => {
    event.preventDefault(); if (closing) return; closing = true;
    gsap.to(dialog, { y: 25, scale: .97, opacity: 0, duration: .24, overwrite: true, onComplete: () => { dialog.close(); gsap.set(dialog, { clearProps: 'transform,opacity' }); closing = false; } });
  });
}

function signalExperience(gsap) {
  const hero = $('.hero'), hint = $('.hero-hint');
  hint.setAttribute('role', 'button'); hint.tabIndex = 0; hint.setAttribute('aria-label', 'Send a demo campaign signal');
  hint.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); hint.click(); } });
  hero.addEventListener('click', event => {
    if (event.target.closest('a,button,nav')) return;
    const rect = hero.getBoundingClientRect(); const x = event.detail ? event.clientX - rect.left : rect.width * .75, y = event.detail ? event.clientY - rect.top : rect.height * .65;
    for (let i = 0; i < 2; i++) {
      const wave = document.createElement('i'); wave.className = 'campaign-wave'; wave.setAttribute('aria-hidden', 'true'); wave.style.left = `${x}px`; wave.style.top = `${y}px`; hero.append(wave);
      gsap.fromTo(wave, { scale: .1, opacity: .8 }, { scale: 7, opacity: 0, delay: i * .13, duration: 1.25, ease: 'power2.out', onComplete: () => wave.remove() });
    }
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement('i'); spark.className = 'campaign-spark'; spark.setAttribute('aria-hidden', 'true'); spark.style.left = `${x}px`; spark.style.top = `${y}px`; hero.append(spark);
      const angle = i / 10 * Math.PI * 2;
      gsap.to(spark, { x: Math.cos(angle) * 100, y: Math.sin(angle) * 100, opacity: 0, scale: .1, duration: .9, ease: 'power2.out', onComplete: () => spark.remove() });
    }
    $$('.campaign-note', hero).forEach(el => { gsap.killTweensOf(el); el.remove(); });
    const note = document.createElement('div'); note.className = 'campaign-note'; note.setAttribute('aria-hidden', 'true'); note.innerHTML = '<b>+312</b><span>Right people. Reached.<br>A little signal. A bigger impact.</span>'; hero.append(note);
    gsap.fromTo(note, { y: 20, scale: .95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.4)' });
    gsap.to(note, { y: -10, opacity: 0, delay: 2.2, duration: .4, onComplete: () => note.remove() });
  });
}

function exploreMenu(gsap) {
  const open = document.createElement('button'); open.className = 'desktop-explore'; open.setAttribute('aria-label', 'Explore the site'); open.setAttribute('aria-haspopup', 'dialog'); open.innerHTML = '<span></span><span></span>'; $('.nav').append(open);
  const menu = document.createElement('dialog'); menu.id = 'explore-menu'; menu.setAttribute('aria-labelledby', 'explore-title');
  const rows = [['services', 'Services', 'Six ways to grow'], ['work', 'Selected work', 'Results in plain numbers'], ['about', 'Our approach', 'The people behind the plan'], ['content', 'The creative', 'Made to stop the scroll'], ['pricing', 'Plans & pricing', 'Find your next move'], ['contact', 'Let’s talk', 'Your brand, only bigger']];
  menu.innerHTML = `<div class="explore-header"><a href="#home" class="brand" data-explore-link><span class="brand-symbol">◉</span>Reachwise</a><button class="explore-close" aria-label="Close exploration menu">×</button></div><div class="explore-intro"><span id="explore-title">FIND YOUR NEXT MOVE</span><span>STRATEGY / CREATIVE / GROWTH</span></div><nav class="explore-links" aria-label="Explore the site">${rows.map(([id, label, caption], i) => `<a href="#${id}" data-explore-link><span class="mono">0${i + 1}</span><b>${label}</b><span class="explore-caption">${caption}</span><span class="explore-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav><div class="explore-footer"><span>GOOD BRANDS DESERVE TO BE FOUND.</span><span>NEW YORK + EVERYWHERE ↗</span></div>`;
  document.body.append(menu);
  function close(after) {
    gsap.to(menu, { opacity: 0, yPercent: -4, duration: .28, overwrite: true, onComplete: () => { menu.close(); document.body.style.overflow = ''; document.documentElement.classList.remove('explore-open'); gsap.set(menu, { clearProps: 'all' }); if (after) after(); } });
  }
  open.addEventListener('click', () => {
    menu.showModal(); document.body.style.overflow = 'hidden'; document.documentElement.classList.add('explore-open');
    gsap.fromTo(menu, { yPercent: -12, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out' });
    gsap.fromTo($$('.explore-links>a', menu), { y: 45, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .65, delay: .12 });
  });
  $('.explore-close', menu).addEventListener('click', () => close());
  menu.addEventListener('cancel', event => { event.preventDefault(); close(); });
  $$('[data-explore-link]', menu).forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); const href = link.getAttribute('href');
    close(() => { const target = $(href); history.pushState(null, '', href); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }));
}

function galleryExperience(gsap, ScrollTrigger, media) {
  const track = $('.social-grid');
  const shell = document.createElement('div'); shell.className = 'gallery-shell'; track.before(shell); shell.append(track);
  const posters = [['@verde.studio', 'Small ideas.<br>Big presence.', 'VERDE', 'poster-lime', '2,807'], ['@brightline.run', 'Keep moving.<br>Keep growing.', '↗', 'poster-ink', '8,410']];
  posters.forEach(([account, copy, name, theme, likes], i) => {
    const post = document.createElement('article'); post.className = `social-post ${theme}${i === 0 ? ' post-tall' : ''}`;
    post.innerHTML = `<div class="poster-art" aria-hidden="true"><i></i><i></i><i></i><b>${name}</b></div><div class="post-header mono">${account}<span>↗</span></div><div class="post-copy">${copy}</div><button class="like-button" aria-label="Like the ${account} post" aria-pressed="false">♡ <span>${likes}</span></button>`;
    const button = $('.like-button', post), count = Number(likes.replaceAll(',', ''));
    button.addEventListener('click', () => { const liked = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed', String(liked)); button.firstChild.textContent = liked ? '♥ ' : '♡ '; $('span', button).textContent = (count + Number(liked)).toLocaleString('en-US'); });
    track.append(post);
  });
  const controls = document.createElement('div'); controls.className = 'gallery-controls';
  controls.innerHTML = '<span><b class="gallery-position">01 / 06</b><span class="gallery-instruction">Drag or scroll to explore ↗</span></span><span class="gallery-progress" aria-hidden="true"><i></i></span><div class="gallery-arrows"><button class="gallery-prev" aria-label="Previous creative">←</button><button class="gallery-next" aria-label="Next creative">→</button></div>';
  shell.after(controls);
  let pin = null, tween = null, drag = null;
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  function updateControls() {
    const max = maxScroll(), fraction = max ? track.scrollLeft / max : 0;
    $('.gallery-position').textContent = `${String(Math.min(6, 1 + Math.round(fraction * 5))).padStart(2, '0')} / 06`;
    gsap.set('.gallery-progress>i', { scaleX: fraction });
    $('.gallery-prev').disabled = track.scrollLeft < 3;
    $('.gallery-next').disabled = track.scrollLeft > max - 3;
  }
  function moveTo(left, smooth = true) {
    const value = Math.max(0, Math.min(maxScroll(), left));
    if (pin && pin.isActive && maxScroll()) window.scrollTo({ top: pin.start + value / maxScroll() * (pin.end - pin.start), behavior: smooth ? 'smooth' : 'instant' });
    else track.scrollTo({ left: value, behavior: smooth ? 'smooth' : 'instant' });
  }
  $('.gallery-prev').addEventListener('click', () => moveTo(track.scrollLeft - $('.social-post', track).clientWidth - 26));
  $('.gallery-next').addEventListener('click', () => moveTo(track.scrollLeft + $('.social-post', track).clientWidth + 26));
  track.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(track); updateControls();
  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0 || event.target.closest('button,a')) return;
    drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, started: false };
  });
  track.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const distance = event.clientX - drag.x;
    if (!drag.started && Math.abs(distance) > 6) { drag.started = true; track.setPointerCapture(event.pointerId); track.classList.add('is-dragging'); }
    if (drag.started) { event.preventDefault(); moveTo(drag.left - distance, false); }
  });
  function release() { if (drag && track.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id); drag = null; track.classList.remove('is-dragging'); }
  track.addEventListener('pointerup', release); track.addEventListener('pointercancel', release); track.addEventListener('lostpointercapture', release);
  track.addEventListener('focusin', event => { const post = event.target.closest('.social-post'); if (post && event.target.matches(':focus-visible')) moveTo(post.offsetLeft - track.offsetLeft - 14); });
  media.add('(min-width: 1000px) and (min-height: 740px)', () => {
    const section = $('#content'), wrap = $('#content>.wrap'); section.classList.add('gallery-pinned');
    pin = ScrollTrigger.create({ id: 'gallery-pin', trigger: wrap, pin: true, start: 'top 45px', end: () => `+=${maxScroll() + innerHeight * .65}`, anticipatePin: 1, invalidateOnRefresh: true });
    const state = { progress: 0 };
    tween = gsap.to(state, { progress: 1, ease: 'none', onUpdate: () => { if (pin?.isActive) track.scrollLeft = state.progress * maxScroll(); }, scrollTrigger: { trigger: wrap, start: () => pin.start, end: () => pin.end, scrub: .65, invalidateOnRefresh: true } });
    return () => { pin = null; tween = null; section.classList.remove('gallery-pinned'); track.scrollLeft = 0; };
  });
  // On touch screens the native horizontal scrollbar handles swipes.
}

function contextCursor(gsap) {
  const cursor = document.createElement('div'); cursor.className = 'cursor-orbit'; cursor.setAttribute('aria-hidden', 'true'); cursor.dataset.label = ''; cursor.innerHTML = '<span></span>'; document.body.append(cursor);
  const x = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3.out' }), y = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3.out' });
  function move(event) {
    if ($('dialog[open]')) { cursor.style.opacity = '0'; return; }
    x(event.clientX); y(event.clientY); cursor.style.opacity = '1';
    const target = event.target;
    const label = target.closest('.like-button') ? 'LOVE' : target.closest('.social-grid') ? 'DRAG' : target.closest('.insight-card,[data-open]') ? 'READ' : target.closest('.hero-hint') ? 'SEND' : target.closest('a,.button,.desktop-explore') ? 'GO ↗' : '';
    cursor.dataset.label = label; $('span', cursor).textContent = label;
    cursor.dataset.theme = target.closest('.dark,.hero,.brand-ribbon') ? 'dark' : 'light';
  }
  const leave = () => { cursor.style.opacity = '0'; };
  document.addEventListener('pointermove', move); document.documentElement.addEventListener('pointerleave', leave);
  return () => { document.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); gsap.killTweensOf(cursor); cursor.remove(); };
}

function chapterNavigation(gsap, ScrollTrigger) {
  const dock = document.createElement('nav'); dock.className = 'chapter-dock'; dock.setAttribute('aria-label', 'Page chapters');
  const chapters = [['home', 'Home'], ['services', 'Services'], ['work', 'Selected work'], ['content', 'Creative'], ['pricing', 'Pricing'], ['contact', 'Free audit']];
  dock.innerHTML = chapters.map(([id, label]) => `<a href="#${id}" aria-label="${label}"><span>${label}</span></a>`).join(''); document.body.append(dock);
  const triggers = chapters.map(([id], index) => ScrollTrigger.create({ trigger: `#${id}`, start: 'top 55%', end: 'bottom 45%', onToggle(self) { if (self.isActive) $$('a', dock).forEach((link, i) => link.setAttribute('aria-current', String(i === index))); } }));
  const wipe = document.createElement('div'); wipe.className = 'page-wipe'; wipe.setAttribute('aria-hidden', 'true'); wipe.innerHTML = '<span>Reachwise↗</span>'; document.body.append(wipe);
  let navigating = false;
  function navigate(event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || anchor.closest('#explore-menu') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = anchor.getAttribute('href'); if (href.length < 2) return;
    const target = $(href); if (!target) return;
    event.preventDefault(); if (navigating) return; navigating = true;
    gsap.set(wipe, { transformOrigin: 'bottom', pointerEvents: 'auto' });
    gsap.timeline({ onComplete: () => { navigating = false; wipe.style.pointerEvents = 'none'; } })
      .to(wipe, { scaleY: 1, duration: .32, ease: 'power3.inOut' })
      .call(() => { history.pushState(null, '', href); window.scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: 'instant' }); ScrollTrigger.update(); })
      .set(wipe, { transformOrigin: 'top' })
      .to(wipe, { scaleY: 0, duration: .45, ease: 'power3.inOut' });
  }
  document.addEventListener('click', navigate);
  return () => { document.removeEventListener('click', navigate); triggers.forEach(trigger => trigger.kill()); gsap.killTweensOf(wipe); dock.remove(); wipe.remove(); };
}

function letterWave(gsap) {
  const wordmark = $('.footer-wordmark'), arrow = $('span', wordmark);
  const letters = [...'Reachwise'].map(letter => { const span = document.createElement('span'); span.className = 'wordmark-letter'; span.setAttribute('aria-hidden', 'true'); span.textContent = letter; return span; });
  wordmark.replaceChildren(...letters, arrow); gsap.set(letters, { y: 0, rotationZ: 0 });
  function move(event) {
    const rect = wordmark.getBoundingClientRect(), position = (event.clientX - rect.left) / rect.width * letters.length;
    letters.forEach((letter, index) => { const distance = Math.abs(index + .5 - position), lift = Math.max(0, 1 - distance / 2.2); letter.classList.toggle('is-near', lift > .8); gsap.to(letter, { y: -lift * 28, rotationZ: (index - position) * lift * 4, duration: .4, overwrite: true }); });
  }
  function leave() { letters.forEach(letter => letter.classList.remove('is-near')); gsap.to(letters, { y: 0, rotationZ: 0, duration: .6, stagger: .02 }); }
  wordmark.addEventListener('pointermove', move); wordmark.addEventListener('pointerleave', leave);
  return () => { wordmark.removeEventListener('pointermove', move); wordmark.removeEventListener('pointerleave', leave); gsap.killTweensOf(letters); wordmark.replaceChildren(document.createTextNode('Reachwise'), arrow); };
}
