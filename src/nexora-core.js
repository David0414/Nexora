import * as THREE from '../assets/vendor/three.module.js';

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function arcGeometry(inner, outer, angle, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, -angle / 2, angle / 2, false);
  shape.absarc(0, 0, inner, angle / 2, -angle / 2, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, steps: 1, curveSegments: 16,
    bevelEnabled: true, bevelSegments: 3, bevelSize: .025, bevelThickness: .025
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function createCore(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const metal = new THREE.MeshStandardMaterial({ color: 0xa3b4b2, metalness: .68, roughness: .3 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x172123, metalness: .6, roughness: .36 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xdbe3cc, metalness: .55, roughness: .2 });
  const light = new THREE.MeshStandardMaterial({ color: 0x96d737, emissive: 0x89bb1d, emissiveIntensity: .85, roughness: .3 });
  const paleLight = new THREE.MeshBasicMaterial({ color: 0xdfffa5 });
  const muted = new THREE.MeshBasicMaterial({ color: 0x618f75, transparent: true, opacity: .38 });

  // Eight machined segments surround a luminous, faceted energy chamber.
  const assembly = new THREE.Group();
  root.add(assembly);
  const segments = [];
  const shellGeometry = arcGeometry(.8, 1.16, .64, .3);
  const trimGeometry = new THREE.TorusGeometry(.835, .019, 8, 18, .54);
  const boltGeometry = new THREE.CylinderGeometry(.027, .027, .016, 8);
  const ventGeometry = new THREE.BoxGeometry(.07, .018, .012);
  for (let index = 0; index < 8; index++) {
    const angle = index * TAU / 8;
    const segment = new THREE.Group();
    segment.rotation.z = angle;
    assembly.add(segment);
    mesh(segment, shellGeometry, index % 2 ? metal : graphite);
    const trim = mesh(segment, trimGeometry, light, 0, 0, .185);
    trim.rotation.z = -.27;
    for (const side of [-1, 1]) {
      const bolt = mesh(segment, boltGeometry, edge, 1.02 * Math.cos(.22), side * 1.02 * Math.sin(.22), .19);
      bolt.rotation.x = Math.PI / 2;
    }
    for (let vent = 0; vent < 4; vent++) {
      const line = mesh(segment, ventGeometry, index % 2 ? graphite : metal, 1.04, (vent - 1.5) * .045, .18);
      line.rotation.z = -.25;
    }
    segments.push({ object: segment, angle });
  }

  const chamber = new THREE.Group();
  root.add(chamber);
  mesh(chamber, new THREE.TorusGeometry(.68, .055, 12, 80), edge);
  mesh(chamber, new THREE.TorusGeometry(.6, .023, 10, 80), light, 0, 0, .08);
  const crystal = mesh(chamber, new THREE.IcosahedronGeometry(.49, 1), new THREE.MeshPhysicalMaterial({
    color: 0x93c83f, emissive: 0x729e1c, emissiveIntensity: .5,
    metalness: .35, roughness: .18, clearcoat: 1, clearcoatRoughness: .15, flatShading: true
  }));
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(crystal.geometry), new THREE.LineBasicMaterial({
    color: 0xd7ff91, transparent: true, opacity: .22
  }));
  crystal.add(wire);
  const nucleus = mesh(chamber, new THREE.SphereGeometry(.18, 24, 16), paleLight, 0, 0, .38);

  // A small, raised Nexora signature sits on the front of the chamber.
  const badge = new THREE.Group();
  chamber.add(badge);
  badge.position.z = .57;
  mesh(badge, new THREE.CylinderGeometry(.23, .23, .045, 48), graphite).rotation.x = Math.PI / 2;
  [-.085, 0, .085].forEach((x, index) => {
    const bar = mesh(badge, new THREE.CapsuleGeometry(.014, [.1, .19, .07][index], 3, 8), paleLight, x, 0, .035);
    bar.rotation.z = -.22;
  });

  const rear = new THREE.Group();
  rear.position.z = -.43;
  root.add(rear);
  mesh(rear, new THREE.TorusGeometry(1.02, .055, 12, 80), graphite);
  mesh(rear, new THREE.TorusGeometry(.99, .012, 8, 80), light, 0, 0, -.03);
  for (let index = 0; index < 32; index++) {
    const angle = index * TAU / 32;
    const tooth = mesh(rear, new THREE.BoxGeometry(.08, .024, .085), metal, Math.cos(angle), Math.sin(angle));
    tooth.rotation.z = angle;
  }

  const orbit = new THREE.Group();
  orbit.rotation.set(.72, -.38, .15);
  root.add(orbit);
  mesh(orbit, new THREE.TorusGeometry(1.47, .012, 8, 120), edge);
  const orbitArc = mesh(orbit, new THREE.TorusGeometry(1.47, .021, 8, 48, 1.15), light);
  const satellite = new THREE.Group();
  orbit.add(satellite);
  mesh(satellite, new THREE.SphereGeometry(.07, 16, 12), graphite, 1.47);
  mesh(satellite, new THREE.SphereGeometry(.035, 12, 8), paleLight, 1.47, 0, .05);
  const outerOrbit = new THREE.Group();
  outerOrbit.rotation.set(-.5, .6, -.35);
  root.add(outerOrbit);
  mesh(outerOrbit, new THREE.TorusGeometry(1.66, .006, 6, 120), muted);
  const tracer = mesh(outerOrbit, new THREE.TorusGeometry(1.66, .012, 6, 24, .36), light);

  const dustGeometry = new THREE.BufferGeometry();
  const dust = [];
  for (let index = 0; index < 65; index++) {
    const angle = index * 2.39996;
    const radius = 1.9 + (index % 7) * .12;
    dust.push(Math.cos(angle) * radius, Math.sin(angle) * radius * .8, -1 - (index % 5) * .15);
  }
  dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
  const particles = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0x98bf82, size: .014, transparent: true, opacity: .55, depthWrite: false
  }));
  scene.add(particles);

  return {
    root,
    update(time, opening, progress, pointer, still) {
      root.rotation.set(-.2 + pointer.y * .15, -.38 + pointer.x * .28 + progress * .35, -.3);
      root.position.y = still ? 0 : Math.sin(time * .65) * .065;
      assembly.rotation.z = still ? .1 : .1 + Math.sin(time * .18) * .13;
      for (const { object, angle } of segments) {
        const distance = opening * .34;
        object.position.set(Math.cos(angle) * distance, Math.sin(angle) * distance, opening * (Math.cos(angle * 2) * .12));
      }
      chamber.position.z = opening * .26;
      rear.position.z = -.43 - opening * .32;
      rear.rotation.z = still ? 0 : -time * .055;
      crystal.rotation.set(time * .09, time * .14, .2);
      nucleus.scale.setScalar(still ? 1 : 1 + Math.sin(time * 1.7) * .07);
      orbit.rotation.y = -.38 + Math.sin(time * .23) * .14 + opening * .12;
      orbitArc.rotation.z = time * .22;
      satellite.rotation.z = -time * .25 + 2.5;
      outerOrbit.rotation.y = .6 - Math.sin(time * .15) * .16;
      tracer.rotation.z = -time * .18 + 1;
      particles.rotation.z = time * .015;
      light.emissiveIntensity = still ? .85 : .85 + Math.sin(time * 1.3) * .12;
    }
  };
}

function createLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xe0e9ee, 0x27372a, 1.8));
  const key = new THREE.DirectionalLight(0xf2fff0, 3.3);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa7dce6, 3.2);
  rim.position.set(4, 1, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xbaff54, 5, 8);
  fill.position.set(-1, -2, 2);
  scene.add(fill);
}

function mountCore(canvas, { method = false } = {}) {
  if (!canvas) return;
  const host = canvas.parentElement;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 680px)');
  const button = host.querySelector('[data-core-toggle]');
  const pauseButton = host.querySelector('[data-core-pause]');
  const hint = host.querySelector('[data-core-hint]');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.dataset.coreState = 'fallback';
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  const core = createCore(scene);
  createLighting(scene);
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const steps = method ? [...document.querySelectorAll('.method-step')] : [];
  const phase = host.querySelector('[data-core-phase]');
  const stageNames = ['01 / ALINEAR', '02 / DISEÑAR', '03 / IMPLEMENTAR', '04 / EVOLUCIONAR'];
  let progress = 0, targetProgress = 0, opening = 0, expanded = false, paused = false;
  let visible = false, disposed = false, contextLost = false, frame = 0, previousTime = 0, elapsed = 0;
  let entrance = motionPreference.matches ? 1 : 0;
  let activeStep = -1;

  const render = (delta = 0) => {
    const still = motionPreference.matches || paused;
    const smoothing = still ? 1 : 1 - Math.exp(-delta * 7);
    elapsed += still ? 0 : delta;
    entrance = still ? 1 : Math.min(1, entrance + delta * .7);
    const ease = 1 - (1 - entrance) ** 3;
    pointer.x = mix(pointer.x, still ? 0 : pointer.targetX, smoothing);
    pointer.y = mix(pointer.y, still ? 0 : pointer.targetY, smoothing);
    progress = mix(progress, targetProgress, smoothing);
    const methodOpening = method ? Math.sin(progress * Math.PI) * .85 : 0;
    opening = mix(opening, expanded ? 1 : methodOpening, smoothing);
    core.root.scale.setScalar(.88 + ease * .12);
    core.update(elapsed, opening + (1 - ease) * 2, progress, pointer, still);
    if (method) {
      const step = Math.min(3, Math.floor(progress * 4));
      if (step !== activeStep) {
        activeStep = step;
        steps.forEach((element, index) => element.classList.toggle('is-active', index === step));
        if (phase) phase.textContent = stageNames[step];
      }
    }
    renderer.render(scene, camera);
  };

  const canAnimate = () => visible && !document.hidden && !motionPreference.matches && !paused && !disposed && !contextLost;
  const tick = now => {
    frame = 0;
    if (!canAnimate()) return;
    const delta = previousTime ? (now - previousTime) / 1000 : 1 / 60;
    if (!mobile.matches || delta >= 1 / 30) {
      previousTime = now;
      render(Math.min(delta, .05));
    }
    frame = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (disposed || contextLost) return;
    if (canAnimate() && !frame) {
      previousTime = 0;
      frame = requestAnimationFrame(tick);
    } else if (!canAnimate()) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden) render();
    }
  };
  const resize = () => {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.4 : 1.7));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the complete assembly in both portrait and landscape viewports.
    const halfHeight = 2.1 / Math.min(camera.aspect, 1);
    camera.position.set(0, method ? 0 : -.03, halfHeight / Math.tan(THREE.MathUtils.degToRad(17.5)));
    camera.updateProjectionMatrix();
    render();
    wake();
  };
  const onScroll = () => {
    if (method && steps.length) {
      const first = steps[0].getBoundingClientRect();
      const last = steps[steps.length - 1].getBoundingClientRect();
      targetProgress = clamp((innerHeight * .55 - first.top) / Math.max(last.bottom - first.top, 1), 0, 1);
    } else {
      const rect = host.getBoundingClientRect();
      targetProgress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
    }
    if (motionPreference.matches || paused) render();
  };
  const onPointer = event => {
    if (event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    pointer.targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    pointer.targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
  };
  const resetPointer = () => { pointer.targetX = pointer.targetY = 0; };
  const toggle = () => {
    expanded = !expanded;
    button.setAttribute('aria-pressed', String(expanded));
    button.querySelector('[data-core-label]').textContent = expanded ? 'Unir piezas' : 'Explorar núcleo';
    host.dataset.coreView = expanded ? 'expanded' : 'assembled';
    if (hint) hint.textContent = expanded ? 'CADA PIEZA, CONECTADA.' : 'MUEVE EL CURSOR PARA EXPLORAR';
    wake();
  };
  const syncPause = () => {
    if (pauseButton) {
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.querySelector('[data-pause-label]').textContent = paused ? 'Reanudar' : 'Pausar';
      pauseButton.hidden = motionPreference.matches;
    }
    wake();
  };
  const togglePause = () => { paused = !paused; syncPause(); };
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }, { threshold: 0 });
  const resizeObserver = new ResizeObserver(resize);
  host.addEventListener('pointermove', onPointer, { passive: true });
  host.addEventListener('pointerleave', resetPointer);
  button?.addEventListener('click', toggle);
  pauseButton?.addEventListener('click', togglePause);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', wake);
  motionPreference.addEventListener('change', syncPause);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.coreState = 'fallback';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    host.dataset.coreState = 'ready';
    resize();
  });
  host.dataset.coreState = 'ready';
  host.dataset.coreView = 'assembled';
  onScroll();
  resize();
  syncPause();
  visibilityObserver.observe(host);
  resizeObserver.observe(host);

  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true;
    cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', wake);
    motionPreference.removeEventListener('change', syncPause);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    renderer.dispose();
  });
  window.addEventListener('pageshow', wake);
}

export function initCoreScenes() {
  mountCore(document.querySelector('#hero-scene'));
  mountCore(document.querySelector('#method-scene'), { method: true });
}
