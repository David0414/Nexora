import * as THREE from '../assets/vendor/three.module.js';
import { GLTFLoader } from '../assets/vendor/loaders/GLTFLoader.js';
import { DRACOLoader } from '../assets/vendor/loaders/DRACOLoader.js';

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
  initScene();
  initMethodScene();
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
  // pointer tilt on media and the method scene where it cannot fight that motion.
  const elements = $$('.project-media, .method-visual');
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

function createNexoraRobot(parent, scale = 1) {
  const root = new THREE.Group();
  root.name = 'NexoraRobot';
  root.scale.setScalar(scale);
  parent.add(root);
  const shell = new THREE.MeshStandardMaterial({ color: 0x9aac91, metalness: .82, roughness: .24 });
  const armor = new THREE.MeshStandardMaterial({ color: 0x23312b, metalness: .82, roughness: .22 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x080e0c, metalness: .72, roughness: .18 });
  const lime = new THREE.MeshStandardMaterial({ color: 0xc9ff45, emissive: 0x78b927, emissiveIntensity: 2.1, metalness: .38, roughness: .2 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x174d39, emissive: 0x24d590, emissiveIntensity: 1.2, metalness: .45, roughness: .14 });
  const add = (parentNode, geometry, material, position = [0, 0, 0], scaleTo = null) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (scaleTo) mesh.scale.set(...scaleTo);
    parentNode.add(mesh);
    return mesh;
  };
  const capsule = (parentNode, radius, length, material, position) => add(parentNode, new THREE.CapsuleGeometry(radius, length, 6, 16), material, position);
  const torso = new THREE.Group();
  torso.position.y = .05;
  root.add(torso);
  capsule(torso, .36, .43, shell, [0, 0, 0]);
  add(torso, new THREE.SphereGeometry(1, 28, 20), armor, [0, .04, .285], [.31, .29, .09]);
  add(torso, new THREE.SphereGeometry(1, 24, 18), dark, [0, .04, .355], [.235, .15, .025]);
  add(torso, new THREE.SphereGeometry(1, 24, 18), glass, [0, .04, .38], [.145, .068, .022]);
  add(torso, new THREE.BoxGeometry(.105, .024, .018), lime, [-.035, .04, .405]);
  add(torso, new THREE.BoxGeometry(.04, .024, .018), lime, [.075, .04, .405]);
  for (let i = 0; i < 3; i++) add(torso, new THREE.BoxGeometry(.045, .018, .012), dark, [.23, -.24 - i * .07, .1]);
  add(torso, new THREE.SphereGeometry(.14, 20, 16), armor, [0, -.43, 0], [1.1, .65, .9]);
  add(torso, new THREE.BoxGeometry(.2, .14, .18), dark, [0, -.5, -.31]);
  add(torso, new THREE.SphereGeometry(.07, 16, 16), lime, [0, -.5, -.42]);

  const neck = new THREE.Group();
  neck.position.set(0, .47, 0);
  torso.add(neck);
  capsule(neck, .12, .13, dark, [0, .04, 0]);
  const head = new THREE.Group();
  head.position.y = .17;
  neck.add(head);
  add(head, new THREE.SphereGeometry(1, 32, 24), shell, [0, .03, 0], [.31, .27, .29]);
  add(head, new THREE.SphereGeometry(1, 28, 20), armor, [0, .11, -.02], [.24, .17, .26]);
  add(head, new THREE.SphereGeometry(1, 24, 16), dark, [0, .025, .252], [.235, .09, .028]);
  const eyeLeft = add(head, new THREE.SphereGeometry(1, 18, 14), lime, [-.09, .025, .28], [.037, .025, .014]);
  const eyeRight = add(head, new THREE.SphereGeometry(1, 18, 14), lime, [.09, .025, .28], [.037, .025, .014]);
  add(head, new THREE.SphereGeometry(.07, 16, 12), armor, [-.31, .02, 0], [1, 1.3, 1]);
  add(head, new THREE.SphereGeometry(.07, 16, 12), armor, [.31, .02, 0], [1, 1.3, 1]);
  capsule(head, .012, .12, lime, [0, .34, 0]);
  add(head, new THREE.SphereGeometry(.035, 16, 12), lime, [0, .42, 0]);
  add(head, new THREE.BoxGeometry(.1, .018, .012), dark, [0, -.13, .28]);

  const createArm = side => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .39, .29, 0);
    torso.add(shoulder);
    add(shoulder, new THREE.SphereGeometry(.19, 24, 20), armor, [0, 0, 0], [1, 1.05, .95]);
    add(shoulder, new THREE.SphereGeometry(.125, 20, 16), shell, [side * .07, -.02, .055], [.9, 1, .8]);
    add(shoulder, new THREE.SphereGeometry(.075, 18, 14), lime, [side * .06, 0, .13], [1, 1, .5]);
    const upper = new THREE.Group();
    upper.position.y = -.08;
    shoulder.add(upper);
    capsule(upper, .105, .25, shell, [0, -.19, 0]);
    add(upper, new THREE.SphereGeometry(.115, 18, 16), dark, [0, -.38, .01]);
    const elbow = new THREE.Group();
    elbow.position.y = -.38;
    upper.add(elbow);
    add(elbow, new THREE.SphereGeometry(.1, 18, 16), armor, [0, 0, 0]);
    capsule(elbow, .085, .22, shell, [0, -.17, .015]);
    add(elbow, new THREE.SphereGeometry(.105, 20, 16), armor, [0, -.34, .04], [1, .62, .7]);
    const palm = new THREE.Group();
    palm.position.set(0, -.38, .045);
    elbow.add(palm);
    add(palm, new THREE.SphereGeometry(.09, 20, 16), dark, [0, -.035, .025], [1, .82, .68]);
    for (let digit = 0; digit < 4; digit++) {
      const dx = (digit - 1.5) * .043;
      const finger = new THREE.Group();
      finger.position.set(dx, -.09, .055);
      palm.add(finger);
      capsule(finger, .018, .07, shell, [0, -.045, 0]);
      add(finger, new THREE.SphereGeometry(.021, 12, 10), lime, [0, -.095, .01]);
    }
    const thumb = new THREE.Group();
    thumb.position.set(side * -.1, -.025, .04);
    thumb.rotation.z = side * -.55;
    palm.add(thumb);
    capsule(thumb, .02, .08, shell, [0, -.04, 0]);
    return { shoulder, upper, elbow, palm };
  };
  const leftArm = createArm(-1);
  const rightArm = createArm(1);
  const createLeg = side => {
    const hip = new THREE.Group();
    hip.position.set(side * .18, -.49, 0);
    torso.add(hip);
    add(hip, new THREE.SphereGeometry(.15, 20, 16), armor, [0, 0, 0]);
    capsule(hip, .115, .25, shell, [0, -.2, 0]);
    add(hip, new THREE.SphereGeometry(.12, 20, 16), dark, [0, -.38, .015]);
    const knee = new THREE.Group();
    knee.position.y = -.38;
    hip.add(knee);
    add(knee, new THREE.SphereGeometry(.105, 18, 16), lime, [0, 0, .07], [1, .85, .65]);
    capsule(knee, .09, .29, armor, [0, -.23, 0]);
    add(knee, new THREE.SphereGeometry(1, 20, 16), shell, [0, -.24, .09], [.13, .2, .055]);
    add(knee, new THREE.BoxGeometry(.25, .13, .34), dark, [0, -.43, .06]);
    add(knee, new THREE.BoxGeometry(.28, .09, .37), shell, [0, -.47, .09]);
    return { hip, knee };
  };
  const leftLeg = createLeg(-1);
  const rightLeg = createLeg(1);
  const shadow = add(root, new THREE.CircleGeometry(.65, 36), new THREE.MeshBasicMaterial({ color: 0x7bff35, transparent: true, opacity: .14, blending: THREE.AdditiveBlending }), [0, -1.13, -.15]);
  shadow.rotation.x = -Math.PI / 2;
  const edge = new THREE.PointLight(0x92ff52, 2.3, 4);
  edge.position.set(0, .3, 1.2);
  root.add(edge);
  return { root, torso, neck, head, leftArm, rightArm, leftLeg, rightLeg, eyes: [eyeLeft, eyeRight], shadow };
}

function createHeroGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(210,255,120,.95)');
  gradient.addColorStop(.18, 'rgba(138,255,70,.52)');
  gradient.addColorStop(.52, 'rgba(55,200,100,.14)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function interpolateRobotPose(progress) {
  const poses = [
    { p: 0, lean: 0, headX: 0, headY: 0, lz: 0, rz: 0, lx: 0, rx: 0, le: -.12, re: -.12, ll: 0, rl: 0, crouch: 0, turn: 0 },
    { p: .24, lean: .22, headX: .34, headY: -.18, lz: -.52, rz: .22, lx: -.42, rx: -.18, le: -.65, re: -.18, ll: -.3, rl: .15, crouch: .18, turn: -.16 },
    { p: .5, lean: -.12, headX: -.12, headY: .3, lz: -1.85, rz: 1.72, lx: -.25, rx: -.28, le: -.9, re: -.2, ll: .04, rl: -.04, crouch: -.03, turn: .25 },
    { p: .76, lean: -.2, headX: .12, headY: -.2, lz: -2.15, rz: 2.05, lx: -.5, rx: -.25, le: -.25, re: -.35, ll: -.12, rl: .14, crouch: -.08, turn: -.28 },
    { p: 1, lean: -.04, headX: -.12, headY: 0, lz: -2.25, rz: 2.25, lx: -.1, rx: -.1, le: -.15, re: -.15, ll: 0, rl: 0, crouch: 0, turn: 0 }
  ];
  let index = 0;
  while (index < poses.length - 2 && progress > poses[index + 1].p) index++;
  const from = poses[index], to = poses[index + 1];
  const raw = THREE.MathUtils.clamp((progress - from.p) / (to.p - from.p), 0, 1);
  const t = raw * raw * (3 - 2 * raw);
  const pose = {};
  Object.keys(from).forEach(key => { if (key !== 'p') pose[key] = THREE.MathUtils.lerp(from[key], to[key], t); });
  return pose;
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
  const canvas = $('#intro-scene');
  if (!screen || !canvas) return;
  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem('nexora-intro-seen') === '1'; } catch {}
  if (alreadySeen) {
    screen.remove();
    return;
  }
  try { sessionStorage.setItem('nexora-intro-seen', '1'); } catch {}

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    screen.classList.add('is-closing');
    window.setTimeout(() => screen.remove(), 500);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080a0c, .045);
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
  camera.position.set(0, 0, 6.6);
  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.HemisphereLight(0xbaff5e, 0x07100a, 1.9));
  const key = new THREE.PointLight(0xdfff9b, 14, 9);
  key.position.set(2.5, 2.4, 3);
  scene.add(key);
  const rim = new THREE.PointLight(0x2d8c5d, 12, 10);
  rim.position.set(-2.8, -.8, 2);
  scene.add(rim);

  const logo = new THREE.Group();
  world.add(logo);
  const logoMaterial = new THREE.MeshStandardMaterial({ color: 0xb9f54c, emissive: 0x4b8f1d, emissiveIntensity: 1.2, roughness: .22, metalness: .58 });
  [-.36, 0, .36].forEach((x, index) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.19, [.98, 1.42, .74][index], .19), logoMaterial.clone());
    bar.position.set(x, [-.04, .12, -.1][index], .08);
    bar.rotation.z = -.18;
    logo.add(bar);
  });
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/assets/vendor/libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  loader.load('../assets/portfolio/three-mark.glb', ({ scene: loaded }) => {
    const mark = loaded;
    const bounds = new THREE.Box3().setFromObject(mark);
    const size = bounds.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z) || 1;
    mark.scale.setScalar(.95 / maxSize);
    const center = new THREE.Box3().setFromObject(mark).getCenter(new THREE.Vector3());
    mark.position.sub(center);
    mark.position.set(0, 0, -.2);
    mark.rotation.set(.15, .25, -.15);
    mark.traverse(object => {
      if (!object.isMesh) return;
      object.material = logoMaterial.clone();
      object.material.transparent = true;
      object.material.opacity = .3;
      object.material.emissiveIntensity = .95;
    });
    world.add(mark);
  }, undefined, () => {});

  const particleCount = window.innerWidth < 680 ? 90 : 180;
  const positions = new Float32Array(particleCount * 3);
  const particleData = [];
  for (let index = 0; index < particleCount; index++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.7 + Math.random() * 2.3;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - .5) * 3.4;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    particleData.push({ angle, radius, speed: .04 + Math.random() * .11, phase: Math.random() * 6.28 });
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  world.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc9ff45, size: .022, transparent: true, opacity: .72, blending: THREE.AdditiveBlending })));

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  screen.addEventListener('pointermove', event => {
    pointer.tx = (event.clientX / innerWidth - .5) * 2;
    pointer.ty = (event.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  const resize = () => {
    const width = screen.clientWidth || innerWidth;
    const height = screen.clientHeight || innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(screen);
  resize();

  let frame = 0;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    screen.classList.add('is-closing');
    window.setTimeout(() => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.traverse(object => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
        else object.material?.dispose();
      });
      renderer.dispose();
      screen.remove();
    }, 720);
  };
  $('#intro-enter')?.addEventListener('click', close);
  window.setTimeout(close, reducedMotion ? 500 : 1280);
  const clockStart = performance.now();
  const render = () => {
    frame = requestAnimationFrame(render);
    if (closed) return;
    const elapsed = (performance.now() - clockStart) * .001;
    pointer.x += (pointer.tx - pointer.x) * .05;
    pointer.y += (pointer.ty - pointer.y) * .05;
    world.rotation.y += .0024;
    world.rotation.x += (pointer.y * .06 - world.rotation.x) * .035;
    world.rotation.z += (pointer.x * .04 - world.rotation.z) * .035;
    logo.rotation.y = Math.sin(elapsed * .7) * .12;
    logo.rotation.x = Math.sin(elapsed * .55) * .06;
    logo.scale.setScalar(1 + Math.sin(elapsed * 1.25) * .035);
    const current = particleGeometry.attributes.position.array;
    particleData.forEach((particle, index) => {
      const angle = particle.angle + elapsed * particle.speed;
      current[index * 3] = Math.cos(angle) * particle.radius;
      current[index * 3 + 1] = Math.sin(elapsed * .25 + particle.phase) * .35 + Math.sin(particle.phase) * 1.45;
      current[index * 3 + 2] = Math.sin(angle) * particle.radius;
    });
    particleGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };
  if (reducedMotion) renderer.render(scene, camera);
  else render();
}

function initScene() {
  const canvas = $('#hero-scene');
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.classList.add('scene-fallback');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, .15, 7.2);
  const world = new THREE.Group();
  scene.add(world);
  const modelStage = new THREE.Group();
  modelStage.position.set(0, -.15, .25);
  world.add(modelStage);
  scene.add(new THREE.HemisphereLight(0xc9ff45, 0x0b130c, 1.8));
  const keyLight = new THREE.PointLight(0xd8ff8a, 13, 10);
  keyLight.position.set(2.5, 2.5, 3);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x3f8d6d, 11, 12);
  rimLight.position.set(-3, -1, 2);
  scene.add(rimLight);
  const bot = createNexoraRobot(modelStage, 1.25);
  bot.root.position.set(-.05, -.05, .42);
  const robot = bot.root;
  host.dataset.models = '2';

  // The robot is intentionally free floating: the light field gives it depth
  // without putting the interaction inside another card or dashboard frame.
  const glowTexture = createHeroGlowTexture();
  const heroGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x83ff48,
    transparent: true,
    opacity: .3,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  heroGlow.position.set(.28, .08, -1.15);
  heroGlow.scale.set(4.8, 4.8, 1);
  world.add(heroGlow);
  const heroGlowSmall = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xd8ff8a,
    transparent: true,
    opacity: .18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  heroGlowSmall.position.set(.45, .04, .05);
  heroGlowSmall.scale.set(1.35, 1.35, 1);
  robot.add(heroGlowSmall);

  const lightTrails = [];
  const trailColors = [0xc9ff45, 0x59df82, 0xefffbd];
  for (let i = 0; i < 16; i++) {
    const length = .28 + Math.random() * .86;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(length, 0, 0)
    ]);
    const material = new THREE.LineBasicMaterial({
      color: trailColors[i % trailColors.length],
      transparent: true,
      opacity: .12 + Math.random() * .26,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.Line(geometry, material);
    const side = i % 2 ? 1 : -1;
    line.position.set(side * (1.25 + Math.random() * 1.35), -.95 + Math.random() * 2.55, -.65 - Math.random() * .55);
    line.rotation.z = side * (-.3 + Math.random() * .55);
    world.add(line);
    lightTrails.push({ line, baseX: line.position.x, baseY: line.position.y, phase: Math.random() * Math.PI * 2, speed: .35 + Math.random() * .7, drift: .12 + Math.random() * .26 });
  }

  const particleCount = window.innerWidth < 680 ? 160 : 290;
  const positions = new Float32Array(particleCount * 3);
  const particleData = [];
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.8 + Math.random() * 1.9;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - .5) * 3.6;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    particleData.push({ angle, radius, speed: .05 + Math.random() * .13, wobble: Math.random() * 6.28 });
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xc9ff45, size: .025, transparent: true, opacity: .7, blending: THREE.AdditiveBlending }));
  world.add(particles);

  const grid = new THREE.GridHelper(7, 14, 0x294c31, 0x14291c);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -1.6;
  grid.material.transparent = true;
  grid.material.opacity = .22;
  world.add(grid);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  const scrollMotion = { value: 0, target: 0 };
  const updateScrollMotion = () => {
    const rect = host.getBoundingClientRect();
    const travel = Math.max(rect.height * .82, 1);
    scrollMotion.target = Math.min(1, Math.max(0, -rect.top / travel));
  };
  window.addEventListener('scroll', updateScrollMotion, { passive: true });
  updateScrollMotion();
  const trackPointer = event => {
    const rect = host.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    pointer.active = inside;
    if (!inside) return;
    // The robot occupies the right side of the stage, so use its own local
    // center and range. This makes left/right movement feel immediate instead
    // of getting diluted by the rest of the card.
    const robotCenterX = rect.left + rect.width * .67;
    const robotCenterY = rect.top + rect.height * .53;
    const robotRangeX = Math.max(rect.width * .27, 1);
    const robotRangeY = Math.max(rect.height * .38, 1);
    pointer.tx = Math.max(-1, Math.min(1, (event.clientX - robotCenterX) / robotRangeX));
    pointer.ty = Math.max(-1, Math.min(1, (event.clientY - robotCenterY) / robotRangeY));
    host.style.setProperty('--pointer-x', `${((pointer.tx + 1) * 50).toFixed(1)}%`);
    host.style.setProperty('--pointer-y', `${((pointer.ty + 1) * 50).toFixed(1)}%`);
  };
  window.addEventListener('pointermove', trackPointer, { passive: true });
  host.addEventListener('pointerleave', () => { pointer.active = false; pointer.tx = 0; pointer.ty = 0; });

  let visible = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
  visibilityObserver.observe(host);
  const resize = () => {
    const width = host.clientWidth || 600;
    const height = host.clientHeight || 500;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  let frame = 0;
  const clockStart = performance.now();
  const render = () => {
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden) return;
    const elapsed = (performance.now() - clockStart) * .001;
    pointer.x += (pointer.tx - pointer.x) * (pointer.active ? .13 : .055);
    pointer.y += (pointer.ty - pointer.y) * (pointer.active ? .13 : .055);
    scrollMotion.value += (scrollMotion.target - scrollMotion.value) * .045;
    const scrollMix = scrollMotion.value;
    world.rotation.y += .0011;
    modelStage.rotation.y += ((pointer.x * .11 + scrollMix * .18) - modelStage.rotation.y) * .05;
    modelStage.rotation.x = Math.sin(elapsed * .32) * .05 + scrollMix * .2;
    modelStage.rotation.z = scrollMix * .24;
    modelStage.position.y = -.15 - scrollMix * .34;
    heroGlow.material.opacity = .24 + Math.sin(elapsed * 1.2) * .045 + Math.abs(pointer.x) * .06;
    heroGlow.scale.setScalar(4.65 + Math.sin(elapsed * .7) * .16 + Math.abs(pointer.y) * .22);
    heroGlowSmall.material.opacity = .12 + Math.sin(elapsed * 2.4) * .045;
    lightTrails.forEach(({ line, baseX, baseY, phase, speed, drift }, index) => {
      const wave = Math.sin(elapsed * speed + phase);
      line.position.x = baseX + wave * drift + pointer.x * (index % 2 ? .04 : -.04);
      line.position.y = baseY + Math.cos(elapsed * speed * .7 + phase) * drift * .55;
      line.material.opacity = .1 + (wave + 1) * .09;
    });
    const robotAimX = -.05 + pointer.x * .23;
    const robotAimY = -.05 - pointer.y * .08 - scrollMix * .12;
    const heroPose = interpolateRobotPose((Math.sin(elapsed * .42) + 1) * .5);
    robot.position.x += (robotAimX - robot.position.x) * .06;
    robot.position.y += (robotAimY + Math.sin(elapsed * 1.7) * (.055 + scrollMix * .025) - robot.position.y) * .06;
    robot.position.z += ((.42 + Math.sin(elapsed * 1.1) * .045 + pointer.y * .035) - robot.position.z) * .06;
    const targetYaw = pointer.x * 1.18 + scrollMix * .08 + heroPose.turn * .1;
    const targetPitch = -pointer.y * .34 + Math.sin(elapsed * .8) * .025;
    robot.rotation.y += (targetYaw - robot.rotation.y) * (pointer.active ? .16 : .07);
    robot.rotation.x += (targetPitch - robot.rotation.x) * (pointer.active ? .13 : .07);
    const targetRoll = pointer.x * .1 + Math.sin(elapsed * 1.15) * .035 + scrollMix * .16;
    robot.rotation.z += (targetRoll - robot.rotation.z) * (pointer.active ? .12 : .06);
    bot.neck.rotation.y += (pointer.x * .45 - bot.neck.rotation.y) * (pointer.active ? .18 : .08);
    bot.neck.rotation.x += (-pointer.y * .25 - bot.neck.rotation.x) * (pointer.active ? .16 : .08);
    bot.torso.rotation.z = heroPose.lean * .32;
    bot.leftArm.shoulder.rotation.z = heroPose.lz * .45 + Math.sin(elapsed * 1.5) * .07 + scrollMix * .16;
    bot.rightArm.shoulder.rotation.z = heroPose.rz * .45 - Math.sin(elapsed * 1.5) * .07 - scrollMix * .12;
    bot.leftArm.elbow.rotation.z = heroPose.le * .32;
    bot.rightArm.elbow.rotation.z = heroPose.re * .32;
    bot.leftLeg.hip.rotation.x = Math.sin(elapsed * 1.8) * .045;
    bot.rightLeg.hip.rotation.x = -Math.sin(elapsed * 1.8) * .045;
    bot.leftLeg.knee.rotation.x = Math.max(0, Math.sin(elapsed * 1.8)) * .06;
    bot.rightLeg.knee.rotation.x = Math.max(0, -Math.sin(elapsed * 1.8)) * .06;
    bot.eyes.forEach((eye, index) => {
      eye.material.emissiveIntensity = 1.75 + Math.sin(elapsed * 2.6 + index * .8) * .55 + Math.abs(pointer.x) * .45;
    });
    bot.shadow.material.opacity = .1 + Math.sin(elapsed * 1.1) * .025;
    bot.shadow.scale.setScalar(1.12 + Math.sin(elapsed * 1.1) * .06 + Math.abs(pointer.x) * .04);
    host.dataset.robotYaw = robot.rotation.y.toFixed(3);
    host.dataset.robotPointer = `${pointer.x.toFixed(2)},${pointer.y.toFixed(2)}`;
    world.position.y += ((-scrollMix * .24) - world.position.y) * .04;
    world.rotation.x += ((pointer.y * .08 - scrollMix * .06) - world.rotation.x) * .035;
    world.rotation.z += ((pointer.x * .035 + scrollMix * .08) - world.rotation.z) * .035;
    camera.position.z += ((7.2 - scrollMix * .72) - camera.position.z) * .035;
    const position = particleGeometry.attributes.position.array;
    particleData.forEach((particle, index) => {
      const angle = particle.angle + elapsed * particle.speed;
      position[index * 3] = Math.cos(angle) * particle.radius;
      position[index * 3 + 1] = Math.sin(elapsed * .35 + particle.wobble) * .35 + ((particle.wobble % 2) - 1) * 1.6;
      position[index * 3 + 2] = Math.sin(angle) * particle.radius;
    });
    particleGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };
  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    render();
  }
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', updateScrollMotion);
    window.removeEventListener('pointermove', trackPointer);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    scene.traverse(object => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
      else object.material?.dispose();
    });
    renderer.dispose();
  }, { once: true });
}











function initMethodScene() {
  const canvas = $('#method-scene');
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.classList.add('method-scene-fallback');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, .05, 6.4);
  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.HemisphereLight(0xc9ff45, 0x07110b, 1.8));
  const key = new THREE.PointLight(0xe2ff9f, 12, 9);
  key.position.set(-2.5, 2.6, 3);
  scene.add(key);
  const fill = new THREE.PointLight(0x2a9769, 10, 10);
  fill.position.set(2, -1, 2);
  scene.add(fill);

  const bot = createNexoraRobot(world, 1.35);
  bot.root.position.set(0, -.1, 0);
  const stepElements = $$('.method-step');
  stepElements.forEach((step, index) => { step.dataset.robotStep = String(index); });
  host.dataset.robotAnimation = 'scroll';

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const scrollMotion = { value: 0, target: 0 };
  const section = $('#metodo');
  const updateScrollMotion = () => {
    const sectionTop = section ? section.getBoundingClientRect().top + window.scrollY : host.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max((section?.offsetHeight ?? host.offsetHeight) - window.innerHeight, window.innerHeight * .35, 1);
    scrollMotion.target = THREE.MathUtils.clamp((window.scrollY - sectionTop) / travel, 0, 1);
    const step = Math.min(stepElements.length - 1, Math.floor(scrollMotion.target * stepElements.length));
    stepElements.forEach((element, index) => element.classList.toggle('is-active', index === step));
  };
  window.addEventListener('scroll', updateScrollMotion, { passive: true });
  updateScrollMotion();
  host.addEventListener('pointermove', event => {
    const rect = host.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  host.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0; });
  let visible = false;
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !reducedMotion) render(); }, { threshold: .05 });
  visibilityObserver.observe(host);
  const resize = () => {
    const width = host.clientWidth || 560;
    const height = host.clientHeight || 480;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  let frame = 0;
  const clockStart = performance.now();
  const render = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!visible || document.hidden) return;
      const elapsed = (performance.now() - clockStart) * .001;
      pointer.x += (pointer.tx - pointer.x) * .05;
      pointer.y += (pointer.ty - pointer.y) * .05;
      scrollMotion.value += (scrollMotion.target - scrollMotion.value) * .045;
      const scrollMix = scrollMotion.value;
      world.rotation.y += .0022;
      world.position.y += ((scrollMix - .5) * .16 - world.position.y) * .035;
      world.rotation.x += (pointer.y * .08 - scrollMix * .06 - world.rotation.x) * .04;
      world.rotation.z += (pointer.x * .04 + scrollMix * .08 - world.rotation.z) * .04;
      camera.position.z += ((6.4 - scrollMix * .28) - camera.position.z) * .035;
      const pose = interpolateRobotPose(scrollMix);
      bot.torso.rotation.z += (pose.lean - bot.torso.rotation.z) * .08;
      bot.neck.rotation.x += (pose.headX + pointer.y * .08 - bot.neck.rotation.x) * .08;
      bot.neck.rotation.y += (pose.headY + pointer.x * .14 - bot.neck.rotation.y) * .08;
      bot.leftArm.shoulder.rotation.z += (pose.lz - bot.leftArm.shoulder.rotation.z) * .08;
      bot.rightArm.shoulder.rotation.z += (pose.rz - bot.rightArm.shoulder.rotation.z) * .08;
      bot.leftArm.shoulder.rotation.x += (pose.lx - bot.leftArm.shoulder.rotation.x) * .08;
      bot.rightArm.shoulder.rotation.x += (pose.rx - bot.rightArm.shoulder.rotation.x) * .08;
      bot.leftArm.elbow.rotation.z += (pose.le - bot.leftArm.elbow.rotation.z) * .08;
      bot.rightArm.elbow.rotation.z += (pose.re - bot.rightArm.elbow.rotation.z) * .08;
      bot.leftLeg.hip.rotation.x += (pose.ll + pose.crouch * .25 - bot.leftLeg.hip.rotation.x) * .08;
      bot.rightLeg.hip.rotation.x += (pose.rl + pose.crouch * .25 - bot.rightLeg.hip.rotation.x) * .08;
      bot.leftLeg.knee.rotation.x += (pose.crouch * .65 - bot.leftLeg.knee.rotation.x) * .08;
      bot.rightLeg.knee.rotation.x += (pose.crouch * .65 - bot.rightLeg.knee.rotation.x) * .08;
      bot.root.rotation.y += (pose.turn + pointer.x * .12 - bot.root.rotation.y) * .06;
      bot.root.position.y += (-.1 + Math.sin(elapsed * 1.8) * .025 - bot.root.position.y) * .05;
      bot.root.position.x += (pointer.x * .08 - bot.root.position.x) * .035;
      bot.eyes.forEach(eye => { eye.material.emissiveIntensity = 1.6 + (Math.sin(elapsed * 2.5) + 1) * .35; });
      const activeStep = Math.min(stepElements.length - 1, Math.floor(scrollMix * stepElements.length));
      stepElements.forEach((step, index) => step.classList.toggle('is-active', index === activeStep));
      renderer.render(scene, camera);
      if (!reducedMotion) render();
    });
  };
  host.dataset.methodScene = 'ready';
  if (reducedMotion) {
    visible = true;
    renderer.render(scene, camera);
  } else {
    render();
  }
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', updateScrollMotion);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    scene.traverse(object => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
      else object.material?.dispose();
    });
    renderer.dispose();
  }, { once: true });
}

