const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const formatNumber = value => Math.round(value).toLocaleString('en-US');

// Dismissible introduction, with a short automatic exit.
const intro = $('.intro');
const dismissIntro = () => intro.classList.add('dismissed');
intro.addEventListener('click', dismissIntro);
document.addEventListener('keydown', event => { if (event.key === 'Escape') dismissIntro(); });
setTimeout(dismissIntro, reducedMotion ? 0 : 1150);

// Responsive navigation and accessible anchors.
const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu() { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.hidden = !open;
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
window.addEventListener('resize', () => { if (innerWidth > 680) closeMenu(); });

// Scroll reveals and counters. Content remains visible with reduced motion.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
function observeReveals() { $$('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el)); }
observeReveals();
const counter = $('[data-count]');
if (!reducedMotion) {
  const start = performance.now() + 1250;
  function count(now) {
    const t = Math.min(1, Math.max(0, (now - start) / 1800));
    counter.textContent = formatNumber(Number(counter.dataset.count) * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(count);
  }
  requestAnimationFrame(count);
}
const backToTop = $('.back-to-top');
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { backToTop.hidden = scrollY < innerHeight; scrollQueued = false; });
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' }));

// Photo spotlight: a local canvas, independent of Framer or external runtime scripts.
const hero = $('.hero');
const heroCanvas = $('#hero-canvas');
const heroContext = heroCanvas.getContext('2d');
const photo = $('.hero-photo');
let heroSize = { w: 0, h: 0, dpr: 1 };
let pointer = { x: .78, y: .75 };
let center = { x: .78, y: .75 };
let campaignPulse = 0;
let heroVisible = true;
let heroFrame = 0;
function sizeHero() {
  heroSize = { w: hero.clientWidth, h: hero.clientHeight, dpr: Math.min(devicePixelRatio || 1, 1.5) };
  heroCanvas.width = heroSize.w * heroSize.dpr;
  heroCanvas.height = heroSize.h * heroSize.dpr;
  heroContext.setTransform(heroSize.dpr, 0, 0, heroSize.dpr, 0, 0);
}
function drawCover(ctx, image, w, h) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const iw = image.naturalWidth * scale, ih = image.naturalHeight * scale;
  ctx.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
}
function drawHero(now) {
  heroFrame = 0;
  if (!photo.complete || !photo.naturalWidth || !heroVisible || document.hidden) return;
  const { w, h } = heroSize;
  center.x += (pointer.x - center.x) * .055;
  center.y += (pointer.y - center.y) * .055;
  const idle = reducedMotion ? 0 : Math.sin(now * .00055) * 12;
  const x = center.x * w, y = center.y * h;
  const radius = Math.min(w * .28, h * .36, 390) + idle;
  heroContext.clearRect(0, 0, w, h);
  heroContext.filter = 'saturate(.45) brightness(.84)';
  drawCover(heroContext, photo, w, h);
  heroContext.filter = 'none';
  heroContext.save();
  heroContext.beginPath();
  heroContext.arc(x, y, radius, 0, Math.PI * 2);
  heroContext.clip();
  heroContext.filter = 'saturate(1.25) brightness(.99)';
  drawCover(heroContext, photo, w, h);
  heroContext.restore();
  heroContext.filter = 'none';
  const glow = heroContext.createRadialGradient(x, y, Math.max(0, radius - 35), x, y, radius + 35);
  glow.addColorStop(0, '#d4ff3a00'); glow.addColorStop(.4, '#d4ff3a12'); glow.addColorStop(.5, '#d4ff3a90'); glow.addColorStop(.6, '#d4ff3a33'); glow.addColorStop(1, '#d4ff3a00');
  heroContext.fillStyle = glow;
  heroContext.beginPath(); heroContext.arc(x, y, radius + 35, 0, Math.PI * 2); heroContext.fill();
  if (campaignPulse > 0) {
    const progress = (performance.now() - campaignPulse) / 1600;
    if (progress < 1) {
      heroContext.beginPath(); heroContext.arc(x, y, radius + progress * Math.max(w, h), 0, Math.PI * 2);
      heroContext.strokeStyle = `rgba(212,255,58,${1 - progress})`; heroContext.lineWidth = 3; heroContext.stroke();
    } else campaignPulse = 0;
  }
  heroCanvas.classList.add('ready');
  if (!reducedMotion) heroFrame = requestAnimationFrame(drawHero);
}
function startHero() { if (!heroFrame) heroFrame = requestAnimationFrame(drawHero); }
new ResizeObserver(() => { sizeHero(); startHero(); }).observe(hero);
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; if (heroVisible) startHero(); }, { threshold: 0 }).observe(hero);
photo.addEventListener('load', startHero);
hero.addEventListener('pointermove', event => {
  const rect = hero.getBoundingClientRect();
  pointer = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  if (reducedMotion) { center = { ...pointer }; startHero(); }
});
hero.addEventListener('pointerleave', () => { pointer = { x: .78, y: .75 }; });
hero.addEventListener('click', event => {
  if (event.target.closest('a,button,nav')) return;
  campaignPulse = performance.now();
  counter.textContent = formatNumber(Number(counter.dataset.count) + 312);
  startHero();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { startHero(); startCrowd(); } });

// Animated client radar and result pings.
const clients = [
  ['Northside Dental', '+212%', 61, 22], ['kinfolk coffee', '+96k', 83, 48],
  ['FITLOOP', '6.2×', 75, 59], ['HAVEN REALTY', '+122', 76, 80],
  ['Lumen Skin', '$142k', 56, 68], ['orbit legal', '57 consults', 37, 87],
  ['PARCEL & CO', '+88%', 21, 68], ['VERDE STUDIO', '+3.1×', 20, 35],
  ['Tallow', '+64%', 41, 61], ['brightline', '+41k', 33, 14]
];
$('#radar-clients').innerHTML = clients.map(([name, metric, x, y], i) => `<button class="radar-client" style="left:${x}%;top:${y}%" data-client="${i}" aria-label="${name}, ${metric}"><b>${metric}</b><span>${name}</span></button>`).join('');
function pingClient(index) {
  $$('.radar-client').forEach((el, i) => el.classList.toggle('active', i === index));
  $('#last-ping').textContent = `${clients[index][0]} · ${clients[index][1]}`;
}
$$('.radar-client').forEach(el => el.addEventListener('click', () => pingClient(Number(el.dataset.client))));
let pingIndex = 0;
setInterval(() => { if (!document.hidden && !reducedMotion) pingClient(pingIndex++ % clients.length); }, 3800);

// Audience illustration with hundreds of small people and a channel spotlight.
const crowdCanvas = $('#crowd-canvas');
const crowdContext = crowdCanvas.getContext('2d');
let crowdSize = { w: 1, h: 1, dpr: 1 };
let audienceChannel = 0;
let crowdVisible = false;
let crowdFrame = 0;
const people = Array.from({ length: 420 }, (_, i) => {
  // Deterministic distribution stays stable between redraws and resizes.
  const rand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  return { x: rand(i + 1), y: rand(i + 900), phase: rand(i + 1800) * Math.PI * 2, size: 3 + rand(i + 2700) * 3, buyer: i % 12 === 0 };
});
function drawCrowd(time) {
  crowdFrame = 0;
  if (!crowdVisible || document.hidden) return;
  const { w, h } = crowdSize;
  crowdContext.clearRect(0, 0, w, h);
  const cx = w * [.5, .3, .7][audienceChannel], cy = h * .44, radius = Math.min(w * .24, 150);
  crowdContext.fillStyle = '#d4ff3a55'; crowdContext.beginPath(); crowdContext.arc(cx, cy, radius, 0, Math.PI * 2); crowdContext.fill();
  crowdContext.strokeStyle = '#0d0e1035'; crowdContext.lineWidth = 1; crowdContext.setLineDash([3, 4]);
  crowdContext.beginPath(); crowdContext.arc(cx, cy, radius + 10, 0, Math.PI * 2); crowdContext.stroke(); crowdContext.setLineDash([]);
  people.forEach(person => {
    const x = 14 + person.x * (w - 28) + (reducedMotion ? 0 : Math.sin(time * .00024 + person.phase) * 5);
    const y = 55 + person.y * (h - 145);
    const reached = Math.hypot(x - cx, y - cy) < radius;
    crowdContext.fillStyle = person.buyer && reached ? '#ff3e88' : reached ? '#0d0e10' : '#0d0e1038';
    const r = person.size;
    crowdContext.beginPath(); crowdContext.arc(x, y - r * 1.7, r * .7, 0, Math.PI * 2); crowdContext.fill();
    crowdContext.beginPath(); crowdContext.ellipse(x, y + r * .2, r, r * 1.25, 0, 0, Math.PI * 2); crowdContext.fill();
  });
  if (!reducedMotion) crowdFrame = requestAnimationFrame(drawCrowd);
}
function startCrowd() { if (!crowdFrame) crowdFrame = requestAnimationFrame(drawCrowd); }
new ResizeObserver(() => {
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  crowdSize = { w: crowdCanvas.clientWidth, h: crowdCanvas.clientHeight, dpr };
  crowdCanvas.width = crowdSize.w * dpr; crowdCanvas.height = crowdSize.h * dpr;
  crowdContext.setTransform(dpr, 0, 0, dpr, 0, 0); startCrowd();
}).observe(crowdCanvas);
new IntersectionObserver(([entry]) => { crowdVisible = entry.isIntersecting; if (crowdVisible) startCrowd(); }).observe(crowdCanvas);
$$('[data-audience]').forEach((button, index) => button.addEventListener('click', () => {
  audienceChannel = index;
  $$('[data-audience]').forEach(el => el.setAttribute('aria-selected', String(el === button)));
  startCrowd();
}));

// Services are complete data-driven panels, not links to unavailable Framer routes.
const services = [
  { name: 'SEO', title: 'Rank for the searches that buy.', description: 'Technical fixes, content and links that move you up the page for the words your customers type.', included: ['Technical audit', 'Keyword map', '4 articles a month', 'Link building', 'Monthly ranking report'], result: '#1 for 212 keywords', price: '$1,500/mo', demo: 'search' },
  { name: 'Social media', title: 'Posts people stop for.', description: 'Strategy, shooting, editing and community management on Instagram, TikTok and LinkedIn.', included: ['12 posts + 8 reels a month', 'Content calendar', 'Community replies', 'Monthly report'], result: '48k average reel views', price: '$1,800/mo', demo: 'social' },
  { name: 'Paid ads', title: 'Every dollar tracked to a sale.', description: 'Meta, Google and TikTok campaigns built around your margins, tested weekly and reported in revenue.', included: ['Account setup', 'Creative testing', 'Weekly optimisation', 'Revenue dashboard'], result: '6.2× return on ad spend', price: '$1,200/mo + ad spend', demo: 'ads' },
  { name: 'Content', title: 'Articles, videos and emails that sell.', description: 'Blog posts, newsletters and short videos written for search and for people.', included: ['Editorial plan', '4 long-form articles', '2 newsletters', 'Repurposed clips'], result: '3.4× more leads from blog', price: '$1,400/mo', demo: 'content' },
  { name: 'Web design', title: 'Sites that turn visits into calls.', description: 'Fast websites with landing pages built to convert your traffic. Thoughtful design, responsive layouts and a clear path to the next step.', included: ['Wireframes', 'Design + build', 'CMS setup', 'Speed + SEO basics'], result: '+64% conversion rate', price: '$4,500 once', demo: 'web' },
  { name: 'Branding', title: 'A brand people remember.', description: 'Naming, logo, colours and a voice that makes your ads and posts look like one company.', included: ['Brand workshop', 'Logo + identity', 'Brand guidelines', 'Social templates'], result: '2 weeks to launch', price: '$3,800 once', demo: 'brand' }
];
const demos = {
  search: `<div class="search-demo"><div class="search-bar">⌕ <b>dentist near me</b><span>✦</span></div><p class="mono">About 2,140,000 results · 0.42 s</p><div class="search-row first"><span><small>yoursite.com</small><strong>Your brand · dentist near me</strong></span><b>#1</b></div><div class="search-row"><small>citydentalcare.com</small><strong>Local dental care</strong></div><div class="search-row"><small>yelp.com › dentists</small><strong>Dentists in your city</strong></div><div class="search-row"><small>smilecentre.co</small><strong>Book a dental appointment</strong></div><div class="search-row"><small>healthgrades.com</small><strong>Find your next dentist</strong></div></div><span class="demo-badge">↗ Position 1 · clicks +212%</span>`,
  social: `<div class="mini-post"><img src="assets/coffee.jpg" alt="Example coffee brand post"><span class="mono">@kinfolk.coffee</span><strong>Your daily<br>little ritual.</strong></div><span class="demo-badge">♥ 48k views. One reel.</span>`,
  ads: `<div class="ad-demo"><span class="mono">Campaign performance ↗</span><b>6.2×</b><p class="mono">Return on ad spend</p><div class="mini-bars">${[24, 30, 43, 37, 60, 71, 68, 89, 100].map((height, i) => `<span style="height:${height}%;animation-delay:${i * 40}ms"></span>`).join('')}</div></div><span class="demo-badge">Every dollar. Accounted for.</span>`,
  content: `<div class="content-demo"><span class="mono">THE FIELD NOTES / 004</span><h4>Good content<br>gets found.</h4><p>A useful idea. A clear story. A reason to come back.</p>${[100, 90, 94, 78, 88].map(width => `<div class="writing-line" style="width:${width}%"></div>`).join('')}</div><span class="demo-badge">↗ 3.4× more leads</span>`,
  web: `<div class="web-demo"><div class="web-top"><i></i><i></i><i></i></div><div class="web-hero"><span class="mono">LUMEN / MADE FOR YOU</span><b>A brighter<br>kind of brand.</b><p>Beautiful by design. Built to work.</p></div></div><span class="demo-badge">↗ +64% conversion rate</span>`,
  brand: `<div class="brand-demo"><small class="mono">IDENTITY / 2026</small><small class="mono">↗ VERDE STUDIO</small><b>verde®</b><span></span><span></span></div><span class="demo-badge">From idea to identity.</span>`
};
let activeService = 0;
function selectService(index) {
  activeService = (index + services.length) % services.length;
  const service = services[activeService], number = String(activeService + 1).padStart(2, '0');
  $$('[data-service]').forEach((button, i) => { button.setAttribute('aria-selected', String(i === activeService)); button.tabIndex = i === activeService ? 0 : -1; });
  $('#service-panel').setAttribute('aria-labelledby', `service-tab-${activeService}`);
  $('#service-number').textContent = `${number} / 06`;
  $('#service-title').textContent = service.title;
  $('#service-description').textContent = service.description;
  $('#service-included').innerHTML = service.included.map(item => `<li>${item}</li>`).join('');
  $('#service-result').textContent = service.result;
  $('#service-price').textContent = service.price;
  $('#service-current').textContent = `${number} / 06 — ${service.name}`;
  $('#service-demo').innerHTML = demos[service.demo];
}
selectService(0);
$$('[data-service]').forEach(button => button.addEventListener('click', () => selectService(Number(button.dataset.service))));
$$('[data-service-link]').forEach(link => link.addEventListener('click', () => selectService(Number(link.dataset.serviceLink))));
$('#service-prev').addEventListener('click', () => selectService(activeService - 1));
$('#service-next').addEventListener('click', () => selectService(activeService + 1));

// Keyboard navigation for tab groups.
$$('[role=tablist]').forEach(group => {
  const tabs = $$('[role=tab]', group);
  function syncTabStops() { tabs.forEach(tab => { tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1; }); }
  syncTabStops();
  group.addEventListener('click', syncTabStops);
  group.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let index = tabs.indexOf(document.activeElement);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else index = (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
    tabs[index].click(); tabs[index].focus(); syncTabStops();
  });
});

// Before/after progress and process funnel controls.
$('#case-range').addEventListener('input', event => {
  const progress = Number(event.target.value) / 100;
  const after = 4200 + 34700 * progress;
  $('#case-after').textContent = formatNumber(after);
  $('#case-gain').textContent = `+${formatNumber((after / 4200 - 1) * 100)}%`;
  $('.case-chart').style.clipPath = `inset(0 ${Math.max(0, 100 - progress * 100)}% 0 0)`;
});
$$('[data-step]').forEach(button => button.addEventListener('click', () => {
  $$('[data-step]').forEach(el => el.setAttribute('aria-selected', String(el === button)));
  $$('.funnel-tier').forEach((el, index) => el.classList.toggle('highlight', index === Number(button.dataset.step)));
}));
const reports = {
  overview: ['+212', '%', 'average organic growth', '6.2', '×', 'return on ad spend', '41', 'M', 'people reached in 2025'],
  seo: ['+212', '%', 'average organic growth', '212', '', 'keywords in position #1', '3.4', '×', 'more organic leads'],
  social: ['4.1', 'M', 'monthly content views', '38', 'k', 'monthly saves', '+212', '%', 'social reach growth'],
  ads: ['6.2', '×', 'return on ad spend', '48', 'k', 'qualified clicks', '2,940', '', 'campaign leads']
};
$$('[data-report]').forEach(button => button.addEventListener('click', () => {
  $$('[data-report]').forEach(el => el.setAttribute('aria-selected', String(el === button)));
  const report = reports[button.dataset.report];
  for (let i = 0; i < 3; i++) {
    $(`#report-metric-${i + 1}`).innerHTML = `${report[i * 3]}<span>${report[i * 3 + 1]}</span>`;
    $(`#report-label-${i + 1}`).textContent = report[i * 3 + 2];
  }
  $('#report-line').style.transform = `translateY(${Object.keys(reports).indexOf(button.dataset.report) * 6}px)`;
}));

// Local likes: graceful fallback when browser storage is unavailable.
function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
$$('.like-button').forEach((button, index) => {
  const count = Number($('span', button).textContent.replaceAll(',', ''));
  const key = `reachwise-like-${index}`;
  function render(liked) { button.setAttribute('aria-pressed', String(liked)); button.firstChild.textContent = liked ? '♥ ' : '♡ '; $('span', button).textContent = formatNumber(count + Number(liked)); }
  render(storageGet(key) === 'true');
  button.addEventListener('click', () => { const liked = button.getAttribute('aria-pressed') !== 'true'; render(liked); storageSet(key, String(liked)); });
});

// Team and review presentation content follows the reference; it is marked as demo content.
const team = [
  ['Maya Chen', 'Founder & strategy lead', 'Strategy'], ['Jordan Reyes', 'Head of SEO', 'SEO'],
  ['Amara Okafor', 'Social media director', 'Social'], ['Liam Novak', 'Paid ads lead', 'Paid ads'],
  ['Sofia Marín', 'Content lead', 'Content'], ['Theo Park', 'Design lead', 'Design']
];
$('#team-grid').innerHTML = team.map(([name, role, channel], index) => `<article class="team-card reveal"><div class="team-image"><img src="assets/team-${index + 1}.webp" alt="${name}, ${role}, reference team portrait" loading="lazy"><span class="team-channel">${channel}</span></div><h3>${name}</h3><p>${role}</p><a class="team-arrow" href="#contact" aria-label="Contact the ${channel.toLowerCase()} team">↗</a></article>`).join('');
observeReveals();
const reviews = [
  ['David Kim', 'Partner · Orbit Legal', '57 consults/mo', 'Clients now mention our LinkedIn posts in the first call. That never happened before.', '2m ago'],
  ['Elena Rossi', 'Founder · Lumen Skin', '$142k launch week', 'They built the brand and the launch. We sold out twice in the first month.', '9m ago'],
  ['Tom Alvarez', 'Broker · Haven Realty', '122 leads/mo', 'Seller leads every week from our own site. We stopped buying leads from portals.', '26m ago'],
  ['Priya Nair', 'Growth lead · Fitloop', '6.2× ROAS', 'The first agency that talks about our margins, not clicks. Ads paid back in eleven days.', '1h ago'],
  ['Marcus Bell', 'Co-founder · Kinfolk Coffee', '96k followers', 'Our reels finally look like us. The team shoots, edits and posts, and we just approve.', '3h ago'],
  ['Dr. Hannah Lee', 'Owner · Northside Dental', '+826% organic visits', 'We went from four new patients a week to four a day. They report every number and explain what they changed.', '5h ago']
];
let reviewOffset = 0;
function renderReviews() {
  $('#review-cards').innerHTML = Array.from({ length: 3 }, (_, i) => {
    const [name, role, metric, quote, time] = reviews[(reviewOffset + i) % reviews.length];
    return `<div class="notification" style="animation-delay:${i * 80}ms"><div class="notification-head"><span class="notification-icon">◉</span><span>${name}</span><small>${time}</small></div><p>${quote}</p><span class="mono">${role} · ${metric}</span></div>`;
  }).join('');
}
renderReviews();
$('#review-next').addEventListener('click', () => { reviewOffset = (reviewOffset + 3) % reviews.length; renderReviews(); });

// Billing switch and plan comparison.
$$('[data-billing]').forEach(button => button.addEventListener('click', () => {
  const quarterly = button.dataset.billing === 'quarterly';
  $$('[data-billing]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
  $$('[data-price]').forEach(el => { el.textContent = `$${formatNumber(Number(el.dataset.price) * (quarterly ? .9 : 1))}`; });
  $$('.billing-caption').forEach(el => { el.textContent = quarterly ? 'Billed quarterly · save 10%' : 'Billed monthly · cancel anytime'; });
}));
$('#compare-plans').addEventListener('click', event => {
  const button = event.currentTarget, expanded = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(expanded));
  $('#plan-comparison').hidden = !expanded;
  $('span', button).textContent = expanded ? '−' : '+';
});
$$('[data-plan]').forEach(link => link.addEventListener('click', () => {
  $('#selected-plan').value = link.dataset.plan;
  $('#budget').value = { Starter: 'Under $2k/mo', Growth: '$2k–$5k/mo', Scale: '$5k–$10k/mo' }[link.dataset.plan];
}));
const faq = [
  ['How long until we see results?', 'Paid ads show results in the first two weeks. Social grows month by month. SEO usually moves in 3 to 6 months, and we show progress in every report.'],
  ['Do we have to sign a long contract?', 'No. Retainers run month to month with 30 days notice. Most clients stay because the numbers keep going up.'],
  ['Is ad spend included in the price?', 'No. Ad spend is paid straight to Meta, Google or TikTok from your own account, so you always own the data.'],
  ['Which industries do you work with?', "Local services, e-commerce, apps and professional firms. We say no when we can't move the numbers."],
  ['Who creates the content?', 'Our in-house team writes, shoots and edits. You approve everything before it goes live.'],
  ['How do you report results?', "A live dashboard plus a monthly call where we walk through what worked, what didn't and what we'll change."],
  ['Can you work with our in-house team?', 'Yes. We often run one channel while your team handles the rest, and share every file and login.'],
  ['What happens on the first call?', "A free 30-minute audit of your site, socials and ads, and a plan you can keep even if we don't work together."]
];
$('#faq-list').innerHTML = faq.map(([question, answer], i) => `<details${i === 0 ? ' open' : ''}><summary>${question}</summary><p>${answer}</p></details>`).join('');

// Detail dialogs provide real, readable destinations for cases and articles.
const articles = {
  'seo-article': { category: 'SEO / DEMO ARTICLE', title: 'Local SEO: what still moves the map pack', intro: 'Start with the information a nearby customer needs to make a decision. A useful local search presence connects the search, the page and the actual business.', sections: [['Make the business easy to understand', 'Keep your opening hours, address, services and contact details clear and consistent. Give each location a useful page that describes what a customer can expect when they visit.'], ['Answer the next question', 'A service page should explain who the service is for, how an appointment works and what to do next. Use photos of the place and helpful answers instead of repeating the same keyword.'], ['Measure useful actions', 'Track calls, appointments and qualified enquiries alongside visits. Review which searches and pages help people take the next step, then improve the weak spots.']] },
  'social-article': { category: 'SOCIAL / DEMO ARTICLE', title: 'Reels that sell: the 3-second rule', intro: 'Before a viewer hears the whole story, they decide whether to stay. Give the opening frame a job: make the subject clear and give someone a reason to keep watching.', sections: [['Open on the point', 'Show the product, the question or the result immediately. Avoid a long logo animation before the useful part begins. A specific first line helps the right person recognise themselves.'], ['Design for a small screen', 'Keep captions legible, leave space around important words and use footage that supports the message. Watch the edit once with the sound off to check that the story still makes sense.'], ['Test one change at a time', 'Try two openings with the same middle and ending. Compare watch time, saves and useful responses rather than assuming a high view count means the creative worked.']] },
  'ads-article': { category: 'PAID ADS / DEMO ARTICLE', title: 'ROAS is not profit: how we report paid ads', intro: 'A revenue number tells part of the story. To understand a campaign, put it next to product costs, fulfilment, fees and the cost of acquiring the order.', sections: [['Write down the assumptions', 'Use the same attribution window and revenue definition across comparisons. Keep refunds and repeat purchases visible so a headline does not hide what happened after checkout.'], ['Look beyond a single ratio', 'Report order value, acquisition cost and contribution margin together. A campaign can have a strong revenue ratio while leaving little room after operating costs.'], ['Build a decision, not just a report', 'Finish each review with the next action: keep testing, change the creative or revisit the offer. Record what changed so the following review has a useful baseline.']] }
};
const dialog = $('#detail-dialog');
const dialogContent = $('#dialog-content');
function openDetail(key) {
  if (key === 'dental') {
    dialogContent.innerHTML = `<span class="dialog-kicker">EXAMPLE CASE STUDY / SEO / 2025</span><h2 id="dialog-title">From page 4 to the top 3.</h2><p>Northside Dental is the local SEO example used in this design preview. The campaign brings together location pages, useful treatment information and a consistent review process.</p><h3>The starting point</h3><p>4,200 organic visits a month, with important treatment searches landing outside the first page.</p><h3>The plan</h3><p>Audit technical issues, improve location pages, answer common treatment questions and make booking the next obvious step. The example includes 60 location pages and 180 reviews.</p><h3>The result</h3><p>The reference illustrates 38,900 organic visits a month: an increase of 826%. All figures here are presentation examples.</p><div class="dialog-actions"><a class="button button-ink" href="#contact" data-close-dialog>Talk about your brand <span class="button-icon">↗</span></a></div>`;
  } else if (key === 'cases') {
    dialogContent.innerHTML = `<span class="dialog-kicker">SELECTED WORK / SAMPLE CASES</span><h2 id="dialog-title">Different brands.<br>Shared momentum.</h2>${clients.slice(0, 6).map(([name, result], i) => `<div class="dialog-list-item"><b>0${i + 1}</b><span>${name}</span><button data-case-detail="${i}">${result} ↗</button></div>`).join('')}<p class="dialog-note">These names and results follow the reference and are illustrative content.</p>`;
  } else if (key === 'articles') {
    dialogContent.innerHTML = `<span class="dialog-kicker">FIELD NOTES / SAMPLE ARTICLES</span><h2 id="dialog-title">Ideas to put<br>to work.</h2>${Object.entries(articles).map(([articleKey, article], i) => `<div class="dialog-list-item"><b>0${i + 1}</b><span>${article.title}</span><button data-dialog-article="${articleKey}">Read ↗</button></div>`).join('')}`;
  } else if (articles[key]) {
    const article = articles[key];
    dialogContent.innerHTML = `<span class="dialog-kicker">${article.category}</span><h2 id="dialog-title">${article.title}</h2><p>${article.intro}</p>${article.sections.map(([title, text]) => `<h3>${title}</h3><p>${text}</p>`).join('')}<p class="dialog-note">Original sample text for this website preview.</p><div class="dialog-actions"><button class="button button-ink" data-dialog-article="articles">More articles <span class="button-icon">↗</span></button></div>`;
  }
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}
$$('[data-open]').forEach(button => button.addEventListener('click', () => openDetail(button.dataset.open)));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
  const articleButton = event.target.closest('[data-dialog-article]');
  if (articleButton) openDetail(articleButton.dataset.dialogArticle);
  const caseButton = event.target.closest('[data-case-detail]');
  if (caseButton) {
    if (caseButton.dataset.caseDetail === '0') openDetail('dental');
    else {
      const [name, result] = clients[Number(caseButton.dataset.caseDetail)];
      dialogContent.innerHTML = `<span class="dialog-kicker">SAMPLE CAMPAIGN</span><h2 id="dialog-title">${name}</h2><p>This campaign example appears on the client radar. Its highlighted result is <strong>${result}</strong>.</p><p>A campaign starts with an audit, moves into a focused launch, and uses regular reports to decide what to improve and scale.</p><p class="dialog-note">Illustrative campaign content from the visual reference.</p><div class="dialog-actions"><a href="#contact" data-close-dialog class="button button-ink">Explore your next campaign <span class="button-icon">↗</span></a></div>`;
      dialog.scrollTop = 0;
    }
  }
  if (event.target.closest('[data-close-dialog]')) dialog.close();
});

// The preview saves briefs locally and never claims to send an unconfigured email.
let savedBrief = null;
$('#audit-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  savedBrief = { email: String(data.get('email')).trim(), budget: String(data.get('budget')), plan: String(data.get('plan') || 'Not selected'), createdAt: new Date().toISOString() };
  const stored = storageSet('reachwise-audit-brief', JSON.stringify(savedBrief));
  $('#form-result').hidden = false;
  $('#form-result p').textContent = stored ? 'Saved on this device. Download it to keep a copy.' : 'Your brief is ready. Download it to keep a copy.';
});
$('#download-brief').addEventListener('click', () => {
  if (!savedBrief) return;
  const text = `REACHWISE — STRATEGY CALL BRIEF\n\nEmail: ${savedBrief.email}\nMonthly budget: ${savedBrief.budget}\nInterested plan: ${savedBrief.plan}\nPrepared: ${savedBrief.createdAt}\n\nPreview brief. This request has not been sent.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'reachwise-audit-brief.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Correct IANA time zone, regardless of the machine hosting the site.
function updateClock() {
  const now = new Date();
  $('#new-york-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(now);
  $('#footer-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
}
updateClock();
setInterval(() => { if (!document.hidden) updateClock(); }, 1000);
