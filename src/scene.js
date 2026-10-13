import * as THREE from '../assets/vendor/three.module.js';

/** Instanced people, a scanning ring and a perspective floor: four principal draw calls. */
export function createAudienceScene(host) {
  const panel = host.closest('.crowd-panel');
  // Probe WebGL before constructing a renderer, so an unsupported device has a quiet fallback.
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl) { host.dataset.state = 'fallback'; return null; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch { host.dataset.state = 'fallback'; return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 681 ? 1.25 : 1.6));
  renderer.setClearColor(0xe6e6de, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6e6de, 23, 44);
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 70);
  camera.position.set(0, 13, 17);
  camera.lookAt(0, 0, 0);
  const world = new THREE.Group(); scene.add(world);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x808273, 3));
  const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(-6, 12, 8); scene.add(key);
  const limeLight = new THREE.PointLight(0xd4ff3a, 12, 14); limeLight.position.set(0, 3, 0); scene.add(limeLight);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(29, 18), new THREE.MeshStandardMaterial({ color: 0xe6e6de, roughness: 1, metalness: 0, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.05; world.add(floor);
  const grid = new THREE.GridHelper(26, 52, 0xb8bbab, 0xcdd0c1);
  grid.material.transparent = true; grid.material.opacity = .35; grid.position.y = -.025; world.add(grid);

  const count = innerWidth < 681 ? 240 : 432;
  const personMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .36, metalness: .15 });
  const bodyMesh = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.075, .18, 3, 6), personMaterial, count);
  const headMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.077, 7, 5), personMaterial, count);
  bodyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); headMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(bodyMesh, headMesh);
  const temp = new THREE.Object3D(), color = new THREE.Color();
  const rand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const people = Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(2 * rand(i + 3600) - 1), theta = rand(i + 4500) * Math.PI * 2;
    return { x: (rand(i + 1) - .5) * 18, z: (rand(i + 900) - .5) * 10, phase: rand(i + 1800) * 6.28, scale: .8 + rand(i + 2700) * .55, buyer: i % 12 === 0, gx: Math.sin(phi) * Math.cos(theta) * 4.5, gy: Math.cos(phi) * 4.5 + 2.5, gz: Math.sin(phi) * Math.sin(theta) * 4.5 };
  });
  const network = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(4.5, 16, 12)), new THREE.LineBasicMaterial({ color: 0x717966, transparent: true, opacity: 0, depthWrite: false }));
  network.position.y = 2.5; world.add(network);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, .032, 8, 100), new THREE.MeshBasicMaterial({ color: 0xd4ff3a, toneMapped: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = .055; world.add(ring);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(3.12, 80), new THREE.MeshBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: .19, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = .018; world.add(halo);
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.42, .007, 5, 90), new THREE.MeshBasicMaterial({ color: 0x828774, transparent: true, opacity: .4 }));
  outerRing.rotation.x = Math.PI / 2; outerRing.position.y = .05; world.add(outerRing);
  const spotlight = { x: 0, z: 0, targetX: 0, targetZ: 0 };
  const motion = { progress: 0, morph: 0, burst: 0 };
  const controls = document.createElement('div'); controls.className = 'scene-mode-switch'; controls.hidden = true; controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Explore the audience');
  controls.innerHTML = '<button data-scene-mode="crowd" aria-pressed="true">Find your crowd</button><button data-scene-mode="network" aria-pressed="false">Connect your world ↗</button>';
  panel.append(controls);
  host.dataset.mode = 'crowd';
  controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const morph = button.dataset.sceneMode === 'network' ? 1 : 0;
    controls.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
    host.dataset.mode = button.dataset.sceneMode;
    panel.querySelector('.scene-hint').textContent = morph ? 'Click to send a signal ↗' : 'Move to explore ↗';
    window.gsap.to(motion, { morph, duration: 1.8, ease: 'power3.inOut', overwrite: 'auto' });
  }));
  const pointer = { x: 0, y: 0 };
  let visible = false, frame = 0, lost = false, ready = false, lastRender = -100;
  const mobile = matchMedia('(hover: none)').matches;
  const clockStart = performance.now();
  const lookAt = new THREE.Vector3(0, 0, 0);
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  function frameLoop(now) {
    frame = 0;
    if (!visible || document.hidden || lost) return;
    frame = requestAnimationFrame(frameLoop);
    // Bound this decorative scene to 30 fps on touch screens.
    if (mobile && now - lastRender < 32) return;
    lastRender = now;
    const time = (now - clockStart) * .001;
    const morph = motion.morph;
    host.dataset.morph = morph.toFixed(2);
    floor.material.opacity = 1 - morph; grid.material.opacity = .35 * (1 - morph);
    floor.visible = grid.visible = morph < .99;
    network.material.opacity = morph * .09 + motion.burst * .12;
    network.rotation.y = time * .045;
    spotlight.x += (spotlight.targetX - spotlight.x) * .035;
    spotlight.z += (spotlight.targetZ - spotlight.z) * .035;
    const ringScale = 1 + Math.sin(time * .65) * .025 + morph * .49;
    [ring, halo, outerRing].forEach(mesh => { mesh.position.x = spotlight.x * (1 - morph); mesh.position.z = spotlight.z * (1 - morph); mesh.scale.setScalar(ringScale); });
    ring.position.y = .055 + morph * 2.5; ring.rotation.x = Math.PI / 2 - morph * .65; ring.rotation.y = morph * Math.sin(time * .18) * .3;
    outerRing.position.y = .05 + morph * 2.5; outerRing.rotation.x = Math.PI / 2 + morph * .7; outerRing.scale.setScalar(ringScale + motion.burst * .9);
    halo.material.opacity = .19 * (1 - morph);
    limeLight.position.x = spotlight.x;
    world.rotation.y += ((motion.progress - .5) * .35 + pointer.x * .12 + Math.sin(time * .16) * morph * .6 - world.rotation.y) * .035;
    camera.position.x += (Math.sin(motion.progress * 1.8) * 3.5 + pointer.x * 1.4 - camera.position.x) * .04;
    camera.position.y += (12 + motion.progress * 5 - morph * 5 - pointer.y * 1.3 - camera.position.y) * .04;
    camera.position.z += (17 - motion.progress * 3 - camera.position.z) * .04;
    lookAt.y = morph * 1.8; camera.lookAt(lookAt);
    people.forEach((person, i) => {
      const x = person.x + Math.sin(time * .18 + person.phase) * .2;
      const z = person.z + Math.cos(time * .15 + person.phase) * .15;
      const reached = Math.hypot(x - spotlight.x, z - spotlight.z) < 3.1;
      const rise = reached && person.buyer ? .12 + Math.sin(time * 2 + person.phase) * .04 : 0;
      const px = THREE.MathUtils.lerp(x, person.gx, morph), pz = THREE.MathUtils.lerp(z, person.gz, morph);
      const py = THREE.MathUtils.lerp(.17 * person.scale + rise, person.gy, morph);
      color.set(morph > .5 ? person.buyer ? 0xd4ff3a : 0x23281e : reached ? person.buyer ? 0xff3e88 : 0x171a12 : 0x96998a);
      temp.position.set(px, py, pz); temp.scale.setScalar(person.scale * (1 - morph * .85)); temp.rotation.y = person.phase;
      temp.updateMatrix(); bodyMesh.setMatrixAt(i, temp.matrix); bodyMesh.setColorAt(i, color);
      temp.position.y = THREE.MathUtils.lerp(.43 * person.scale + rise, person.gy, morph); temp.scale.setScalar(person.scale * (1 + morph * .45 + motion.burst * .25)); temp.updateMatrix(); headMesh.setMatrixAt(i, temp.matrix); headMesh.setColorAt(i, color);
    });
    bodyMesh.instanceMatrix.needsUpdate = true; headMesh.instanceMatrix.needsUpdate = true;
    bodyMesh.instanceColor.needsUpdate = true; headMesh.instanceColor.needsUpdate = true;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true; controls.hidden = false; host.dataset.state = 'ready'; panel.classList.add('scene-ready'); document.dispatchEvent(new Event('reachwise:3d-ready'));
    }
  }
  function start() { if (!frame && !lost) frame = requestAnimationFrame(frameLoop); }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }, { rootMargin: '100px' });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
  function onPointer(event) { const rect = panel.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width - .5) * 2; pointer.y = ((event.clientY - rect.top) / rect.height - .5) * 2; }
  panel.addEventListener('pointermove', onPointer);
  panel.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  panel.querySelectorAll('[data-audience]').forEach((button, i) => button.addEventListener('click', () => { spotlight.targetX = [0, -4, 4][i]; spotlight.targetZ = [0, .5, -.5][i]; }));
  panel.addEventListener('click', event => { if (motion.morph < .5 || event.target.closest('button,a')) return; window.gsap.killTweensOf(motion, 'burst'); motion.burst = 1; window.gsap.to(motion, { burst: 0, duration: 1.7, ease: 'power2.out' }); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  // Restore the 2D illustration if the graphics context is lost; try restoration naturally.
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; ready = false; controls.hidden = true; host.dataset.state = 'fallback'; panel.classList.remove('scene-ready'); document.dispatchEvent(new Event('reachwise:3d-unavailable')); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; start(); });
  window.addEventListener('pageshow', start);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect(); resizeObserver.disconnect();
    scene.traverse(object => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach(material => material.dispose()); else object.material?.dispose(); });
    renderer.dispose();
  }, { once: true });
  return { motion };
}
