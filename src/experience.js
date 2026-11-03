import * as THREE from 'three';
import { RoomEnvironment } from '../assets/vendor/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from '../assets/vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../assets/vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../assets/vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../assets/vendor/jsm/postprocessing/OutputPass.js';
import { mergeGeometries } from '../assets/vendor/jsm/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;
const { clamp, lerp, damp } = THREE.MathUtils;
const BACKGROUND = 0x07090a;
// Share of the device's pixel ratio each quality level renders at. The last level also drops bloom.
const QUALITY = [1, .85, .72, .6];
const MIN_PIXEL_RATIO = .7;
const CORE_RADIUS = 1.75;

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

/** Merges a group's static meshes by material: the same picture for far fewer draw calls. */
function bake(group) {
  const parts = new Map();
  for (const child of [...group.children]) {
    if (!child.isMesh) continue;
    child.updateMatrix();
    const geometry = (child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()).applyMatrix4(child.matrix);
    if (!parts.has(child.material)) parts.set(child.material, []);
    parts.get(child.material).push(geometry);
    group.remove(child);
  }
  for (const [material, geometries] of parts) {
    group.add(new THREE.Mesh(mergeGeometries(geometries), material));
    geometries.forEach(geometry => geometry.dispose());
  }
}

function arcGeometry(inner, outer, angle, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, -angle / 2, angle / 2, false);
  shape.absarc(0, 0, inner, angle / 2, -angle / 2, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, steps: 1, curveSegments: 24,
    bevelEnabled: true, bevelSegments: 4, bevelSize: .026, bevelThickness: .026
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.25, 'rgba(255,255,255,.45)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCore() {
  const root = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xb9c4c0, metalness: 1, roughness: .26, clearcoat: .6, clearcoatRoughness: .2 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x1a2224, metalness: .9, roughness: .34, clearcoat: .8, clearcoatRoughness: .25 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xe6ecd8, metalness: 1, roughness: .16 });
  const light = new THREE.MeshStandardMaterial({ color: 0xa6e43c, emissive: 0xb6ff3a, emissiveIntensity: 1.1, roughness: .3 });
  const hot = new THREE.MeshBasicMaterial({ color: 0xd6f59a });
  const muted = new THREE.MeshBasicMaterial({ color: 0x6f9a5a, transparent: true, opacity: .32 });

  // Eight machined segments surround a luminous, faceted energy chamber.
  const assembly = new THREE.Group();
  root.add(assembly);
  const segments = [];
  const shellGeometry = arcGeometry(.8, 1.16, .64, .3);
  const trimGeometry = new THREE.TorusGeometry(.835, .019, 8, 24, .54);
  const boltGeometry = new THREE.CylinderGeometry(.027, .027, .016, 12);
  const ventGeometry = new THREE.BoxGeometry(.07, .018, .012);
  for (let index = 0; index < 8; index++) {
    const angle = index * TAU / 8;
    const pivot = new THREE.Group();
    pivot.rotation.z = angle;
    assembly.add(pivot);
    const segment = new THREE.Group();
    pivot.add(segment);
    mesh(segment, shellGeometry, index % 2 ? metal : graphite);
    mesh(segment, trimGeometry, light, 0, 0, .185).rotation.z = -.27;
    for (const side of [-1, 1]) {
      mesh(segment, boltGeometry, edge, 1.02 * Math.cos(.22), side * 1.02 * Math.sin(.22), .19).rotation.x = Math.PI / 2;
    }
    for (let vent = 0; vent < 4; vent++) {
      mesh(segment, ventGeometry, index % 2 ? graphite : metal, 1.04, (vent - 1.5) * .045, .18).rotation.z = -.25;
    }
    bake(segment);
    segments.push({ segment, angle, twist: (index % 2 ? 1 : -1) * (.4 + (index % 3) * .18) });
  }

  const chamber = new THREE.Group();
  root.add(chamber);
  mesh(chamber, new THREE.TorusGeometry(.68, .055, 16, 96), edge);
  mesh(chamber, new THREE.TorusGeometry(.6, .023, 10, 96), light, 0, 0, .08);
  const crystal = mesh(chamber, new THREE.IcosahedronGeometry(.49, 1), new THREE.MeshPhysicalMaterial({
    color: 0x9ad43f, emissive: 0x6f9e18, emissiveIntensity: .55,
    metalness: .2, roughness: .12, clearcoat: 1, clearcoatRoughness: .08, flatShading: true
  }));
  crystal.add(new THREE.LineSegments(new THREE.EdgesGeometry(crystal.geometry), new THREE.LineBasicMaterial({
    color: 0xe0ffa0, transparent: true, opacity: .35
  })));
  const nucleus = mesh(chamber, new THREE.SphereGeometry(.18, 32, 16), hot, 0, 0, .38);

  const badge = new THREE.Group();
  chamber.add(badge);
  badge.position.z = .57;
  mesh(badge, new THREE.CylinderGeometry(.23, .23, .045, 64), graphite).rotation.x = Math.PI / 2;
  [-.085, 0, .085].forEach((x, index) => {
    mesh(badge, new THREE.CapsuleGeometry(.014, [.1, .19, .07][index], 3, 8), hot, x, 0, .035).rotation.z = -.22;
  });

  const rear = new THREE.Group();
  rear.position.z = -.43;
  root.add(rear);
  mesh(rear, new THREE.TorusGeometry(1.02, .055, 16, 96), graphite);
  mesh(rear, new THREE.TorusGeometry(.99, .012, 8, 96), light, 0, 0, -.03);
  const toothGeometry = new THREE.BoxGeometry(.08, .024, .085);
  for (let index = 0; index < 36; index++) {
    const angle = index * TAU / 36;
    mesh(rear, toothGeometry, metal, Math.cos(angle), Math.sin(angle)).rotation.z = angle;
  }

  bake(badge);
  bake(rear);

  const orbit = new THREE.Group();
  orbit.rotation.set(.72, -.38, .15);
  root.add(orbit);
  mesh(orbit, new THREE.TorusGeometry(1.47, .01, 8, 160), edge);
  const orbitArc = mesh(orbit, new THREE.TorusGeometry(1.47, .02, 8, 64, 1.15), light);
  const satellite = new THREE.Group();
  orbit.add(satellite);
  mesh(satellite, new THREE.SphereGeometry(.07, 24, 16), graphite, 1.47);
  mesh(satellite, new THREE.SphereGeometry(.035, 16, 8), hot, 1.47, 0, .05);

  const outerOrbit = new THREE.Group();
  outerOrbit.rotation.set(-.5, .6, -.35);
  root.add(outerOrbit);
  mesh(outerOrbit, new THREE.TorusGeometry(1.7, .005, 6, 160), muted);
  const tracer = mesh(outerOrbit, new THREE.TorusGeometry(1.7, .012, 6, 32, .42), light);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xb8ff4a, transparent: true, opacity: .55,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.setScalar(2.6);
  halo.position.z = .2;
  chamber.add(halo);

  return {
    root,
    update(time, state, pointer, still) {
      const open = state.opening;
      root.rotation.set(
        state.rotX + pointer.y * .16,
        state.rotY + pointer.x * .3,
        state.rotZ
      );
      root.position.y += still ? 0 : Math.sin(time * .65) * .05;
      assembly.rotation.z = (still ? 0 : Math.sin(time * .18) * .12) + state.spin;
      for (const { segment, angle, twist } of segments) {
        const distance = open * .42;
        segment.position.set(distance, 0, open * Math.cos(angle * 2) * .22);
        segment.rotation.set(open * twist * .35, open * twist * .5, open * twist * .25);
      }
      chamber.position.z = open * .3;
      rear.position.z = -.43 - open * .45;
      rear.rotation.z = (still ? 0 : -time * .06) - state.spin * .5;
      crystal.rotation.set(time * .09, time * .14, .2);
      nucleus.scale.setScalar(still ? 1 : 1 + Math.sin(time * 1.7) * .08);
      orbit.rotation.y = -.38 + Math.sin(time * .23) * .14 + open * .2;
      orbitArc.rotation.z = time * .25;
      satellite.rotation.z = -time * .3 + 2.5;
      outerOrbit.rotation.y = .6 - Math.sin(time * .15) * .16;
      tracer.rotation.z = -time * .2 + 1;
      const pulse = still ? 0 : Math.sin(time * 1.3) * .18;
      light.emissiveIntensity = (1 + pulse) * state.glow;
      // Facing the camera, the chamber already reads as bright; ease the halo off to avoid a blown-out disc.
      const facing = Math.abs(Math.cos(state.rotY + .38));
      halo.material.opacity = (.22 - facing * .12) * state.glow + pulse * .04;
    }
  };
}

function createParticles(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const lime = new THREE.Color(0xc9ff45), cream = new THREE.Color(0xdfe8d6), teal = new THREE.Color(0x5f8f86);
  for (let index = 0; index < count; index++) {
    // Golden-angle spiral gives an even, non-random-looking field.
    const radius = 2.4 + Math.sqrt(index / count) * 9;
    const angle = index * 2.39996;
    positions.set([Math.cos(angle) * radius, (index % 97 / 97 - .5) * 12, -2 - Math.sin(angle) * radius * .6], index * 3);
    const color = index % 9 === 0 ? lime : index % 3 ? teal : cream;
    colors.set([color.r, color.g, color.b], index * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    size: .028, vertexColors: true, transparent: true, opacity: .8,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
}

/**
 * Mounts the persistent 3D core behind the page.
 * `state` is plain data the scroll timeline tweens; the render loop eases toward it.
 */
export function createExperience(canvas, { reducedMotion = false } = {}) {
  const mobile = window.matchMedia('(max-width: 820px)');
  let renderer;
  try {
    // Bloom renders to its own target, so context antialiasing would only cost memory on desktop.
    renderer = new THREE.WebGLRenderer({ canvas, antialias: mobile.matches, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(BACKGROUND, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.FogExp2(BACKGROUND, .045);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .75;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
  camera.position.set(0, 0, 8);

  const key = new THREE.DirectionalLight(0xf4ffe8, 1.8);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0x9fd8e6, 3);
  rim.position.set(4, 1, -3);
  const accent = new THREE.PointLight(0xbaff54, 14, 9);
  accent.position.set(-1.5, -1.8, 2.2);
  scene.add(key, rim, accent);

  const core = createCore();
  scene.add(core.root);
  const particles = createParticles(mobile.matches ? 520 : 1100);
  scene.add(particles);

  let composer = null;
  if (!mobile.matches) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .22, .35, 1.25);
    // Bloom is a soft blur: half resolution looks the same at a quarter of the pixels.
    const sizeBloom = bloom.setSize.bind(bloom);
    bloom.setSize = (width, height) => sizeBloom(Math.ceil(width / 2), Math.ceil(height / 2));
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // Target state (tweened by the page) and the eased state actually rendered.
  const state = { x: .26, y: 0, scale: 1, rotX: -.2, rotY: -.38, rotZ: -.3, opening: 0, spin: 0, glow: 1, camZ: 0 };
  const view = { ...state };
  // GSAP adds its own bookkeeping to tweened objects, so only these keys are state.
  const stateKeys = Object.keys(state);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let velocity = 0, elapsed = 0, previous = 0, frame = 0, paused = false, running = true, lastSignature = '';
  let width = 0, height = 0, idleFrames = 0;

  // Adaptive quality: start from what the hardware suggests, then follow measured frame times.
  const modestDevice = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
  let level = modestDevice ? 1 : 0, bestLevel = 0;
  let sampleTime = 0, sampleCount = 0, skipSamples = 20, fastWindows = 0, raised = false;

  const applySize = () => {
    const ratio = Math.max(Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 1.75) * QUALITY[level], MIN_PIXEL_RATIO);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    composer?.setPixelRatio(ratio);
    composer?.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    canvas.dataset.quality = level;
  };

  const resize = () => {
    // The canvas is 100lvh, so a phone's address bar sliding away changes nothing here.
    const nextWidth = canvas.clientWidth, nextHeight = canvas.clientHeight;
    if (nextWidth === width && nextHeight === height) return false;
    width = nextWidth;
    height = nextHeight;
    applySize();
    return true;
  };

  const setLevel = next => {
    level = next;
    applySize();
    sampleTime = sampleCount = fastWindows = 0;
    skipSamples = 12;
  };

  const watchFrame = milliseconds => {
    if (milliseconds > 400) return;
    if (skipSamples > 0) { skipSamples--; return; }
    sampleTime += milliseconds;
    sampleCount++;
    if (sampleCount < 45 && (sampleTime < 1200 || sampleCount < 5)) return;
    const average = sampleTime / sampleCount;
    sampleTime = sampleCount = 0;
    // Pinned at 30 fps means a 30 Hz screen or battery saver, which fewer pixels cannot speed up.
    if (Math.abs(average - 1000 / 30) < 1.5) return;
    if (average > 21 && level < QUALITY.length - 1) {
      if (raised) bestLevel = level + 1;
      raised = false;
      setLevel(level + 1);
    } else if (average < 17.5 && level > bestLevel && ++fastWindows >= 8) {
      raised = true;
      setLevel(level - 1);
    }
  };

  const coreOnScreen = () => {
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    const radius = CORE_RADIUS * view.scale;
    return Math.abs(core.root.position.x) - radius < halfWidth && Math.abs(core.root.position.y) - radius < halfHeight;
  };

  const update = delta => {
    const still = reducedMotion || paused;
    const smoothing = still ? 1 : 1 - Math.exp(-delta * 4.5);
    if (!still) elapsed += delta;
    for (const key of stateKeys) view[key] = lerp(view[key], state[key], smoothing);
    pointer.x = damp(pointer.x, still ? 0 : pointer.tx, 3, delta || 1);
    pointer.y = damp(pointer.y, still ? 0 : pointer.ty, 3, delta || 1);
    velocity = damp(velocity, 0, 4, delta || 1);

    // Keep the core inside the frame: positions are expressed as fractions of the viewport.
    const portrait = camera.aspect < 1;
    camera.position.z = 8 + view.camZ;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    const fit = portrait ? clamp(camera.aspect * 1.5, .6, 1) : 1;
    core.root.position.set(view.x * halfWidth, view.y * halfHeight, 0);
    core.root.scale.setScalar(view.scale * fit);
    const spin = view.spin;
    view.spin = spin + velocity * .4;
    core.update(elapsed, view, pointer, still);
    view.spin = spin;

    camera.position.x = pointer.x * .25;
    camera.position.y = -pointer.y * .18;
    camera.lookAt(0, 0, 0);
    particles.rotation.y = elapsed * .012 + view.spin * .1;
    particles.position.y = -view.spin * .25;
    accent.intensity = 14 * view.glow;
  };

  const draw = () => {
    if (composer && level < QUALITY.length - 1) composer.render();
    else renderer.render(scene, camera);
  };

  const render = delta => {
    update(delta);
    draw();
  };

  const tick = now => {
    frame = 0;
    if (!running) return;
    const milliseconds = previous ? now - previous : 1000 / 60;
    previous = now;
    update(Math.min(milliseconds / 1000, .05));
    if (coreOnScreen()) {
      draw();
      watchFrame(milliseconds);
    } else if (++idleFrames % 6 === 0) {
      // Only the slow particle field is showing, so a few frames a second are enough.
      draw();
    }
    if (!reducedMotion && !paused) frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    running = !document.hidden;
    if (running && !frame) {
      previous = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  window.addEventListener('resize', () => { if (resize()) render(0); }, { passive: true });
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer.tx = event.clientX / window.innerWidth * 2 - 1;
    pointer.ty = event.clientY / window.innerHeight * 2 - 1;
  }, { passive: true });
  document.addEventListener('visibilitychange', wake);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    running = false;
    document.documentElement.classList.add('no-webgl');
  });

  resize();
  // Compile shaders off the main thread where the browser supports it, then start drawing.
  const ready = (renderer.compileAsync ? renderer.compileAsync(scene, camera) : Promise.resolve())
    .catch(() => {})
    .then(() => { render(1 / 60); wake(); });

  return {
    ready,
    state,
    /** Snap the rendered state to the target, used for the intro and reduced motion. */
    sync() { Object.assign(view, state); render(0); },
    nudge(amount) { velocity = clamp(velocity + amount, -2, 2); },
    setPaused(value) {
      paused = value;
      if (!paused) wake(); else render(0);
    },
    redraw() {
      if (!paused && !reducedMotion) return;
      const signature = stateKeys.map(key => state[key].toFixed(4)).join();
      if (signature === lastSignature) return;
      lastSignature = signature;
      render(0);
    }
  };
}
