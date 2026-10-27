/* Nexora migration layer: keeps the existing interaction engine and gives it a new product language. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const copy = () => {
  document.documentElement.lang = 'es';
  document.title = 'Nexora — Ingeniería digital que mueve operaciones';
  const description = $('meta[name="description"]');
  if (description) description.content = 'Nexora diseña software escalable, automatización industrial, programación PLC, diagnóstico e IoT para operaciones que no pueden detenerse.';
  $$('.brand').forEach(brand => { brand.innerHTML = '<img src="assets/nexora-logo.svg" alt="Nexora">'; });
  const introName = $('.intro-name');
  if (introName) introName.innerHTML = 'NEXORA<span>®</span>';
  const introTop = $('.intro-top');
  if (introTop) introTop.innerHTML = '<span>Software + industrial engineering</span><span>Systems / 2026</span>';
  const introBottom = $('.intro-bottom');
  if (introBottom) introBottom.innerHTML = '<span><i class="live-dot"></i> Sistemas listos para escalar</span><span>Click o presiona Esc para entrar ↗</span>';
  const navLinks = $$('.nav-links a');
  ['Soluciones','Arquitectura','Proceso','Casos'].forEach((label, i) => { if (navLinks[i]) { navLinks[i].textContent = label; navLinks[i].href = ['#solutions','#architecture','#process','#cases'][i]; } });
  const navCta = $('.nav-cta');
  if (navCta) navCta.innerHTML = 'Hablar con ingeniería <span>↗</span>';
  const mobileLinks = $$('#mobile-menu a');
  ['Soluciones','Arquitectura','Proceso','Casos','Contacto'].forEach((label, i) => { if (mobileLinks[i]) { mobileLinks[i].textContent = label; mobileLinks[i].href = ['#solutions','#architecture','#process','#cases','#contact'][i]; } });

  const hero = $('.hero');
  if (hero) hero.classList.add('nexora-hero');
  const heroTitle = $('#hero-title');
  if (heroTitle) heroTitle.innerHTML = '<span class="motion-word">Software</span> <span class="motion-word">que</span> <span class="motion-word">mueve</span> <mark class="motion-word">tu</mark> <mark class="motion-word">operación</mark><span class="motion-word">.</span>';
  const heroDescription = $('.hero-description');
  if (heroDescription) heroDescription.textContent = 'Diseñamos sistemas escalables, automatizaciones industriales y plataformas conectadas para que tu operación sea más inteligente, medible y difícil de detener.';
  const availability = $('.availability');
  if (availability) availability.innerHTML = '<i class="live-dot"></i> Consultoría de software e ingeniería';
  const actionButtons = $$('.hero-actions .button');
  if (actionButtons[0]) actionButtons[0].innerHTML = 'Diseñar mi sistema <span class="button-icon">↗</span>';
  if (actionButtons[0]) actionButtons[0].href = '#contact';
  if (actionButtons[1]) actionButtons[1].innerHTML = 'Ver capacidades <span class="button-icon">↓</span>';
  if (actionButtons[1]) actionButtons[1].href = '#solutions';
  const hint = $('.hero-hint');
  if (hint) hint.innerHTML = '<span class="hint-circle"></span> Explora la arquitectura';
  const counterLabel = $('.reach-counter p');
  if (counterLabel) counterLabel.innerHTML = '<span class="live-dot"></span> Capacidad conectada para crecer';
  const counter = $('[data-count]');
  if (counter) { counter.dataset.count = '48'; counter.textContent = '48'; }
  const proof = $('.hero-proof');
  if (proof) proof.innerHTML = '<span class="stars">★★★★★</span><span>4.9 · ingeniería que llega a producción</span>';
  const tags = $$('.hero-tags a');
  ['Software a escala','Automatización','PLC + IoT','Diagnóstico'].forEach((label, i) => { if (tags[i]) tags[i].innerHTML = `<span>0${i + 1}</span>${label}`; });

  const clients = $('.clients');
  if (clients) {
    const heading = $('.section-heading h2', clients); if (heading) heading.innerHTML = 'Sistemas que<br>hablan <mark>claro.</mark>';
    const eyebrow = $('.section-heading .eyebrow', clients); if (eyebrow) eyebrow.textContent = '(01) Operaciones conectadas';
    const aside = $('.heading-aside p', clients); if (aside) aside.textContent = 'Conectamos software, control y datos en una sola vista. La complejidad deja de esconderse y empieza a trabajar para ti.';
    const facts = $$('.tiny-facts span', clients); ['Tiempo real','Edge + cloud','Escalable'].forEach((v, i) => { if (facts[i]) facts[i].textContent = v; });
  }
  [['.about','solutions'],['.services','solutions'],['.clients','architecture'],['.case-study','cases'],['.cases','cases'],['.process','process'],['.contact','contact']].forEach(([selector,id])=>{const section=$(selector);if(section&&!document.getElementById(id))section.id=id});
  const panel = $('.crowd-panel');
  if (panel) {
    const label = $('.crowd-label', panel); if (label) label.innerHTML = '<b>24</b> nodos conectados';
    const buyer = $('.crowd-buyer', panel); if (buyer) buyer.innerHTML = '<b>LIVE</b> sistema operativo';
    const sceneHint = $('.scene-hint', panel); if (sceneHint) sceneHint.textContent = 'Mueve para explorar ↗';
    const tabs = $$('.audience-tabs button', panel);
    [['Control','PLC','señales de planta'],['Conectividad','IoT','telemetría en tiempo real'],['Inteligencia','DATA','decisiones que escalan']].forEach((data, i) => { if (tabs[i]) tabs[i].innerHTML = `<span>${data[0]}</span><b>${data[1]}</b><small>${data[2]}</small>`; });
    const modeButtons = $$('.scene-mode-switch button', panel); if (modeButtons[0]) modeButtons[0].textContent = 'Mapa operativo'; if (modeButtons[1]) modeButtons[1].textContent = 'Red conectada ↗';
  }
  const sectionHeadings = $$('.section-heading');
  const sectionText = [
    ['(02) Cómo trabajamos','Claridad en cada<br><mark>capa.</mark>','La ingeniería no tiene por qué sentirse opaca. Te acompañamos desde el diagnóstico hasta la puesta en marcha.'],
    ['(03) Trabajo que se nota','Menos promesas.<br>Más <mark>rendimiento.</mark>','Resultados de ingeniería que se sienten en la línea, en el equipo y en la cuenta de resultados.']
  ];
  sectionText.forEach((data, i) => { const heading = sectionHeadings[i + 2]; if (!heading) return; const e = $('.eyebrow', heading); const h = $('h2', heading); const p = $('.heading-aside p', heading); if (e) e.textContent = data[0]; if (h) h.innerHTML = data[1]; if (p) p.textContent = data[2]; });
  const contact = $('.contact');
  if (contact) { const e = $('.eyebrow', contact); const h = $('h2', contact); const p = $('.contact-layout>div>p', contact); if (e) e.textContent = '(05) Empecemos'; if (h) h.innerHTML = 'Haz que tu<br>operación <mark>avance.</mark>'; if (p) p.textContent = 'Cuéntanos qué quieres automatizar, conectar o escalar. Un ingeniero de Nexora te responderá con el siguiente paso.'; }
  const footerWordmark = $('.footer-wordmark'); if (footerWordmark) footerWordmark.innerHTML = 'NEXORA<span>®</span>';
};

const services = [
  ['Software a escala.','Productos digitales, APIs y plataformas internas preparadas para crecer sin fricción.','Arquitectura · APIs · Cloud'],
  ['Automatización inteligente.','Menos tareas repetidas. Más control, trazabilidad y tiempo para decidir.','RPA · Integraciones · Flujos'],
  ['Control industrial.','Programación PLC, HMI y SCADA para líneas seguras, precisas y productivas.','PLC · HMI · SCADA'],
  ['IoT conectado.','Sensores, gateways y datos en tiempo real para saber lo que ocurre.','Edge · Telemetría · MQTT'],
  ['Diagnóstico operativo.','Encontramos el cuello de botella y lo convertimos en una hoja de ruta.','Auditoría · OEE · Roadmap'],
  ['Datos accionables.','Dashboards y alertas que traducen señales complejas en decisiones claras.','BI · Alertas · Data']
];
function wireServices() {
  const tabs = $$('.service-tabs button');
  const detail = $('.service-detail');
  const update = index => {
    const item = services[index];
    tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
    if (!detail || !item) return;
    const title = $('.service-detail h3', detail); const desc = $('.service-detail>p', detail); const result = $('.service-bottom b', detail); const included = $('.included ul', detail);
    if (title) title.textContent = item[0]; if (desc) desc.textContent = item[1]; if (result) result.textContent = item[2];
    if (included) included.innerHTML = item[2].split('·').map(v => `<li>${v.trim()}</li>`).join('');
  };
  tabs.forEach((tab, i) => { tab.innerHTML = `<span>0${i + 1}</span><b>${services[i][0].replace('.','')}</b><small>${services[i][2].split('·')[0].trim()}</small>`; tab.addEventListener('click', () => update(i)); });
  update(0);
}

function rewritePricing() {
  const cards = $$('.price-card');
  const plans = [
    {label:'01 / CORE', name:'Core', desc:'Un sistema claro para una operación que quiere avanzar.', price:'$2,400', items:['Diagnóstico operativo','Arquitectura de software','Dashboard base','Soporte de ingeniería']},
    {label:'02 / CONTROL', name:'Control', desc:'Software y automatización trabajando juntos.', price:'$4,800', items:['Software + PLC','IoT y telemetría','Tablero en tiempo real','Revisión semanal','Soporte prioritario']},
    {label:'03 / SCALE', name:'Scale', desc:'El equipo completo para la siguiente escala.', price:'$8,900', items:['Arquitectura completa','Automatización avanzada','Data platform','Equipo dedicado','Evolución continua']}
  ];
  cards.slice(0,3).forEach((card,i)=>{const p=plans[i]; if(!p)return; const meta=$('.price-meta',card), title=$('h3',card), desc=card.querySelector(':scope > p'), value=$('.price-value b',card), list=$('ul',card), button=$('.button',card); if(meta)meta.innerHTML=`<span>${p.label}</span>${i===1?'<span class="nx-most-picked">MOST ALIGNED</span>':''}`; if(title)title.textContent=p.name; if(desc)desc.textContent=p.desc; if(value)value.textContent=p.price; if(list)list.innerHTML=p.items.map(item=>`<li>${item}</li>`).join(''); if(button)button.innerHTML=`${i===1?'Diseñar con Nexora':'Hablar con ingeniería'} <span class="button-icon">↗</span>`});
}

function addImageModules() {
  const section = $('.clients') || $('.about');
  if (!section || $('.nx-image-grid', section)) return;
  const grid = document.createElement('div'); grid.className='nx-image-grid nx-reveal';
  grid.innerHTML = '<figure class="nx-image-card"><img src="assets/nexora-plant.svg" alt="Dashboard de telemetría industrial Nexora"><span><b>01 /</b> Plant telemetry</span></figure><figure class="nx-image-card"><img src="assets/nexora-iot.svg" alt="Red de nodos IoT conectados"><span><b>02 /</b> Edge network</span></figure>';
  const anchor = $('.crowd-panel', section); if (anchor) anchor.parentNode.insertBefore(grid, anchor); else section.append(grid);
  const codeSection = $('.services'); if (codeSection && !$('.nx-image-grid',codeSection)){const code=document.createElement('div');code.className='nx-image-grid nx-reveal';code.innerHTML='<figure class="nx-image-card"><img src="assets/nexora-code.svg" alt="Código de arquitectura de software Nexora"><span><b>03 /</b> Software core</span></figure>';codeSection.append(code)}
}

function addSectionRail() {
  if ($('.nx-rail')) return;
  const ids = ['top','solutions','architecture','projects','process','cases','contact'];
  const rail = document.createElement('aside'); rail.className='nx-rail'; rail.setAttribute('aria-label','Navegación de secciones');
  ids.forEach((id,i)=>{const link=document.createElement('a');link.href=`#${id}`;link.setAttribute('aria-label',`Ir a ${id}`);if(i===0)link.classList.add('is-active');rail.append(link)}); document.body.append(rail);
  const links=$$('a',rail); const sections=ids.map(id=>document.getElementById(id)).filter(Boolean); const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const index=sections.indexOf(entry.target);links.forEach((link,i)=>link.classList.toggle('is-active',i===index))}}),{rootMargin:'-35% 0px -55%'}); sections.forEach(section=>io.observe(section));
}

function addHeroChrome() {
  const hero=$('.hero'); if(!hero)return;
  if(!$('.hero-topline',hero)){const line=document.createElement('div');line.className='hero-topline wrap';line.innerHTML='<span><i class="live-dot"></i> Nexora Systems / 2026</span><span>Software · Control · Datos</span>';hero.prepend(line)}
  if(!$('.hero-signal',hero)){const signal=document.createElement('div');signal.className='hero-signal';signal.innerHTML='<span class="signal-dot"></span><span>SEÑAL ESTABLE</span><b>99.98%</b>';hero.append(signal)}
}

function addProjectsSection() {
  if ($('#projects')) return;
  const anchor = $('.clients') || $('.about') || $('.services'); if (!anchor) return;
  const section = document.createElement('section'); section.id='projects'; section.className='section nx-projects';
  section.innerHTML = `<div class="wrap"><div class="section-heading nx-project-heading"><div><span class="eyebrow">(03) Proyectos Nexora</span><h2>Ideas que<br>llegan a <mark>producción.</mark></h2></div><div class="heading-aside"><p>Construimos sistemas que resuelven problemas concretos. Explora el tipo de trabajo que podemos hacer junto a tu equipo.</p><div class="nx-project-filters" role="group" aria-label="Filtrar proyectos"><button class="is-active" data-filter="all">Todos</button><button data-filter="software">Software</button><button data-filter="industrial">Industrial</button><button data-filter="iot">IoT</button></div></div></div><div class="nx-project-grid"><article class="nx-project-card nx-project-feature" data-category="industrial"><div class="nx-project-visual"><img src="assets/nexora-plant.svg" alt="Plataforma de telemetría para una planta industrial"><span class="nx-project-index">01 / 06</span><span class="nx-project-status"><i></i> En producción</span></div><div class="nx-project-body"><div class="nx-project-meta"><span>Manufactura / Querétaro</span><b>PLC · IoT · DATA</b></div><h3>Atlas <em>Control</em></h3><p>Centro operativo para conectar PLCs, sensores y métricas de línea en tiempo real.</p><div class="nx-project-result"><strong>+31%</strong><span>productividad en línea</span><a href="#contact" aria-label="Hablar sobre Atlas Control">↗</a></div></div></article><article class="nx-project-card" data-category="iot"><div class="nx-project-visual"><img src="assets/nexora-iot.svg" alt="Red IoT Nexora para activos conectados"><span class="nx-project-index">02 / 06</span><span class="nx-project-status"><i></i> Edge network</span></div><div class="nx-project-body"><div class="nx-project-meta"><span>Energía / Multi-site</span><b>IoT · EDGE</b></div><h3>Pulse <em>Grid</em></h3><p>Telemetría distribuida para saber qué ocurre en cada activo antes de que se detenga.</p><div class="nx-project-result"><strong>24</strong><span>nodos conectados</span><a href="#contact" aria-label="Hablar sobre Pulse Grid">↗</a></div></div></article><article class="nx-project-card" data-category="software"><div class="nx-project-visual"><img src="assets/nexora-code.svg" alt="Arquitectura de software Nexora"><span class="nx-project-index">03 / 06</span><span class="nx-project-status"><i></i> Software core</span></div><div class="nx-project-body"><div class="nx-project-meta"><span>Logística / Escala</span><b>API · CLOUD</b></div><h3>Orbit <em>Ops</em></h3><p>Plataforma para coordinar órdenes, inventario y decisiones sin hojas de cálculo.</p><div class="nx-project-result"><strong>4.2×</strong><span>más operaciones por equipo</span><a href="#contact" aria-label="Hablar sobre Orbit Ops">↗</a></div></div></article><article class="nx-project-card nx-project-lime" data-category="industrial"><div class="nx-project-visual nx-project-visual-blue"><div class="nx-blueprint"><span>PLC / HMI / SCADA</span><b>01</b><i></i><i></i><i></i></div><span class="nx-project-index">04 / 06</span><span class="nx-project-status"><i></i> Control room</span></div><div class="nx-project-body"><div class="nx-project-meta"><span>Automotriz / Planta</span><b>PLC · SCADA</b></div><h3>Forge <em>Line</em></h3><p>Programación y puesta en marcha de una línea que puede medirse, repetirse y escalar.</p><div class="nx-project-result"><strong>-42%</strong><span>paros no planeados</span><a href="#contact" aria-label="Hablar sobre Forge Line">↗</a></div></div></article></div><div class="nx-project-footer"><span class="mono">NEXORA / PROJECT INDEX 2026</span><a class="text-link" href="#contact">¿Tienes un reto parecido? <span>↗</span></a></div></div>`;
  anchor.insertAdjacentElement('afterend', section);
  const filters=$$('.nx-project-filters button',section), cards=$$('.nx-project-card',section); filters.forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;filters.forEach(item=>item.classList.toggle('is-active',item===button));cards.forEach(card=>{const show=filter==='all'||card.dataset.category===filter;card.hidden=!show;card.classList.toggle('is-visible',show)})}));
  const nav=$('.nav-links'); if(nav&&!$('a[href="#projects"]',nav)){const link=document.createElement('a');link.href='#projects';link.textContent='Proyectos';nav.insertBefore(link,nav.children[2]||null)}
  const mobile=$('#mobile-menu'); if(mobile&&!$('a[href="#projects"]',mobile)){const link=document.createElement('a');link.href='#projects';link.textContent='Proyectos';mobile.insertBefore(link,mobile.children[2]||null)}
}

function addRevealMotion() {
  const elements = $$('.solution-card,.price-card,.case-card,.contact-terminal,.nx-image-card,.nx-project-card,.section-heading');
  elements.forEach((el,index)=>{el.classList.add('nx-reveal');el.style.transitionDelay=`${Math.min(index%4,3)*70}ms`});
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.12}); elements.forEach(el=>io.observe(el));
}

function enhanceCopy() {
  const oldWords = [['Reachwise','Nexora'],['Digital marketing agency','Software & industrial engineering'],['Good brands deserve to be found.','Systems that move work.'],['Make every impression matter.','Connect every signal.'],['Why Reachwise','Cómo trabajamos'],['Everyone is a crowd.','Sistemas que hablan claro.'],['We find your buyers.','Diseñamos lo que sigue.'],['Our services','Soluciones Nexora'],['About us','Nuestra ingeniería'],['Our work','Nuestro trabajo'],['Case studies','Casos en producción'],['The work','Trabajo que se nota'],['What our clients say','Ingeniería que responde'],['Plans that fit','Capacidad para crecer'],['Frequently asked questions','Preguntas frecuentes']];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { let value = node.nodeValue; oldWords.forEach(([a, b]) => { value = value.replaceAll(a, b); }); if (value !== node.nodeValue) node.nodeValue = value; });
  wireServices();
  const sectionMap = {
    '.about':['(01) Operaciones conectadas','Sistemas que<br>hablan <mark>claro.</mark>','Conectamos software, control y datos en una sola vista. La complejidad deja de esconderse y empieza a trabajar para ti.'],
    '.services':['(02) Capacidades Nexora','Sistemas que<br><mark>responden.</mark>','Desde una API hasta una línea de producción: diseñamos el sistema completo y dejamos cada capa documentada.'],
    '.case-study':['(03) Resultado en producción','Menos paros.<br>Más <mark>control.</mark>','La tecnología importa cuando el equipo puede trabajar mejor y la operación puede crecer con confianza.'],
    '.cases':['(03) Resultado en producción','Menos paros.<br>Más <mark>control.</mark>','La tecnología importa cuando el equipo puede trabajar mejor y la operación puede crecer con confianza.'],
    '.process':['(04) Método de ingeniería','Claridad en cada<br><mark>capa.</mark>','La ingeniería no tiene por qué sentirse opaca. Te acompañamos desde el diagnóstico hasta la puesta en marcha.'],
    '.content':['(05) Datos que deciden','Ver lo que<br>otros <mark>no ven.</mark>','Convertimos señales dispersas en dashboards, alertas y decisiones que llegan a tiempo.'],
    '.team':['(06) Equipo Nexora','Personas que<br><mark>entienden.</mark>','Ingenieros de software, control y datos trabajando con tu equipo, en el mismo sistema.'],
    '.reviews':['(07) Lo que cambia','Ingeniería que<br><mark>responde.</mark>','Cuando el sistema está claro, las personas pueden concentrarse en hacerlo avanzar.'],
    '.pricing':['(08) Capacidad para crecer','El siguiente nivel<br>empieza <mark>aquí.</mark>','Trabajamos por proyecto, por etapa o como equipo extendido. Elegimos la forma que tu operación necesita.'],
    '.faq':['(09) Preguntas frecuentes','Sin cajas<br><mark>negras.</mark>','Te explicamos cada decisión, cada riesgo y cada siguiente paso con lenguaje claro.'],
    '.insights':['(10) Señales del sector','Pensar también<br>es <mark>ingeniería.</mark>','Notas sobre software industrial, automatización, IoT y los sistemas que vienen.']
  };
  Object.entries(sectionMap).forEach(([selector,data])=>{const section=$(selector);if(!section)return;const h=$('.section-heading',section);if(!h)return;const e=$('.eyebrow',h),title=$('h2',h),p=$('.heading-aside p',h);if(e)e.textContent=data[0];if(title)title.innerHTML=data[1];if(p)p.textContent=data[2]});
}

function createSystemScene(host, variant = 'panel') {
  if (!host || reducedMotion) { if (host) host.dataset.state = 'fallback'; return; }
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true'); host.replaceChildren(canvas);
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!context) { host.dataset.state = 'fallback'; return; }
  import('../assets/vendor/three.module.js').then(THREE => {
    const renderer = new THREE.WebGLRenderer({ canvas, context, alpha:true, antialias:true, powerPreference:'high-performance' });
    const mobile = matchMedia('(max-width:680px)').matches || matchMedia('(hover:none)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.2 : 1.7)); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0a1110, 10, 32);
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 60); camera.position.set(0, variant === 'hero' ? 1.8 : 7.5, variant === 'hero' ? 13 : 15);
    const root = new THREE.Group(); scene.add(root); scene.add(new THREE.HemisphereLight(0xdfffbb,0x08110f,2.8)); const key = new THREE.DirectionalLight(0xeaffca,4); key.position.set(-5,8,7); scene.add(key);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(variant === 'hero' ? 1.9 : 2.8, 2), new THREE.MeshBasicMaterial({color:0xc8ff27,wireframe:true,transparent:true,opacity:.65})); core.position.y = variant === 'hero' ? .7 : 2; root.add(core);
    const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(variant === 'hero' ? .85 : 1.25, 24, 16), new THREE.MeshBasicMaterial({color:0xc8ff27,transparent:true,opacity:.12,depthWrite:false})); coreGlow.position.copy(core.position); root.add(coreGlow);
    const rings = [1.55,2.15,2.85].map((radius,i) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius,.012 + i*.008,6,96),new THREE.MeshBasicMaterial({color:i===1?0xc8ff27:0x759b63,transparent:true,opacity:.34})); ring.rotation.set(Math.PI/2 + i*.37,i*.6,0); ring.position.copy(core.position); root.add(ring); return ring; });
    const count = mobile ? 220 : 480; const positions = new Float32Array(count*3); const colors = new Float32Array(count*3); const c = new THREE.Color();
    for(let i=0;i<count;i++){ const radius=(variant==='hero'?4.5:7.5)*Math.pow(Math.random(),.5); const angle=Math.random()*Math.PI*2; const y=(Math.random()-.5)*(variant==='hero'?3.4:5); positions[i*3]=Math.cos(angle)*radius; positions[i*3+1]=y; positions[i*3+2]=Math.sin(angle)*radius; c.set(Math.random()<.16?0xc8ff27:0x8aa191); colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b; }
    const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3)); particleGeo.setAttribute('color',new THREE.BufferAttribute(colors,3)); const points = new THREE.Points(particleGeo,new THREE.PointsMaterial({size:mobile?.075:.105,vertexColors:true,transparent:true,opacity:.72,sizeAttenuation:true})); root.add(points);
    const nodeCount = variant==='hero' ? 28 : 42; const nodeGeo = new THREE.SphereGeometry(mobile?.055:.075,6,4); const nodeMat = new THREE.MeshBasicMaterial({color:0xc8ff27}); const nodes = new THREE.InstancedMesh(nodeGeo,nodeMat,nodeCount); const temp = new THREE.Object3D(); const nodeData=[]; for(let i=0;i<nodeCount;i++){const a=Math.random()*Math.PI*2,r=2.8+Math.random()*4.8;nodeData.push({a,r,y:(Math.random()-.5)*4.5,s:Math.random()*6});temp.position.set(Math.cos(a)*r,nodeData[i].y,Math.sin(a)*r);temp.updateMatrix();nodes.setMatrixAt(i,temp.matrix)} root.add(nodes);
    const linePos=[]; for(let i=0;i<nodeCount;i++){const n=nodeData[i],m=nodeData[(i+Math.floor(Math.random()*5)+1)%nodeCount];linePos.push(Math.cos(n.a)*n.r,n.y,Math.sin(n.a)*n.r,Math.cos(m.a)*m.r,m.y,Math.sin(m.a)*m.r)} const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(linePos,3));root.add(new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:0x9fc970,transparent:true,opacity:.2,depthWrite:false})));
    const pointer={x:0,y:0}, target={x:0,y:0}; let visible=true, frame=0, start=performance.now();
    function resize(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()} resize(); new ResizeObserver(resize).observe(host);
    function loop(now){frame=0;if(!visible||document.hidden)return;frame=requestAnimationFrame(loop);const t=(now-start)*.001;root.rotation.y+=(target.x*.18+Math.sin(t*.13)*.05-root.rotation.y)*.03;root.rotation.x+=(target.y*.08-root.rotation.x)*.03;core.rotation.x=t*.18;core.rotation.y=t*.28;coreGlow.scale.setScalar(1+Math.sin(t*2.2)*.08);rings.forEach((r,i)=>{r.rotation.z=t*(i%2?.16:-.11);r.scale.setScalar(1+Math.sin(t*(.8+i*.25))* .035)});points.rotation.y=t*.018;nodes.rotation.y=-t*.04;camera.position.x+=(target.x*(variant==='hero'?1.5:2.2)-camera.position.x)*.025;camera.lookAt(0,variant==='hero'?.4:1.8,0);renderer.render(scene,camera)}
    const parent = host.closest('.hero,.crowd-panel') || host; parent.addEventListener('pointermove',e=>{const r=parent.getBoundingClientRect();target.x=((e.clientX-r.left)/r.width-.5)*2;target.y=((e.clientY-r.top)/r.height-.5)*2}); parent.addEventListener('pointerleave',()=>{target.x=target.y=0}); new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(loop)},{rootMargin:'120px'}).observe(host); host.dataset.state='ready'; frame=requestAnimationFrame(loop);
  }).catch(()=>{ host.dataset.state='fallback'; });
}

function initNexora() {
  if (!document.getElementById('top')) document.body.id='top';
  copy(); enhanceCopy(); rewritePricing(); addImageModules(); addProjectsSection(); addSectionRail(); addHeroChrome(); addRevealMotion();
  if (reducedMotion) { const audience=$('#audience-3d'); if(audience){audience.replaceChildren();audience.dataset.state='fallback'} }
  if (!reducedMotion) {
    const hero = $('.hero'); if (hero && !$('#hero-3d')) { const canvas = document.createElement('div'); canvas.id='hero-3d'; hero.prepend(canvas); createSystemScene(canvas,'hero'); }
    const panel = $('#audience-3d'); if (panel) createSystemScene(panel,'panel');
  }
  document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'ready';
  $$('.process-step').forEach((step,i)=>step.addEventListener('click',()=>{$$('.process-step').forEach((el,j)=>el.setAttribute('aria-selected',String(i===j)))}));
  const toggle = $('.menu-toggle'), menu = $('#mobile-menu'); if(toggle&&menu) toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu.hidden=open});
  const top = $('.back-to-top'); if(top){window.addEventListener('scroll',()=>top.hidden=scrollY<innerHeight,{passive:true});top.addEventListener('click',()=>scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'}))}
}
if (document.readyState === 'complete') initNexora(); else window.addEventListener('load', initNexora, {once:true});
