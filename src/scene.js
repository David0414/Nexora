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
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(29, 18), new THREE.MeshStandardMaterial({ color: 0xe6e6de, roughness: 1, metalness: 0 }));
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
  const people = Array.from({ length: count }, (_, i) => ({ x: (rand(i + 1) - .5) * 18, z: (rand(i + 900) - .5) * 10, phase: rand(i + 1800) * 6.28, scale: .8 + rand(i + 2700) * .55, buyer: i % 12 === 0 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, .032, 8, 100), new THREE.MeshBasicMaterial({ color: 0xd4ff3a, toneMapped: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = .055; world.add(ring);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(3.12, 80), new THREE.MeshBasicMaterial({ color: 0xd4ff3a, transparent: true, opacity: .19, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = .018; world.add(halo);
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.42, .007, 5, 90), new THREE.MeshBasicMaterial({ color: 0x828774, transparent: true, opacity: .4 }));
  outerRing.rotation.x = Math.PI / 2; outerRing.position.y = .05; world.add(outerRing);
  const spotlight = { x: 0, z: 0, targetX: 0, targetZ: 0 };
  const motion = { progress: 0 };
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
    spotlight.x += (spotlight.targetX - spotlight.x) * .035;
    spotlight.z += (spotlight.targetZ - spotlight.z) * .035;
    const ringScale = 1 + Math.sin(time * .65) * .025;
    [ring, halo, outerRing].forEach(mesh => { mesh.position.x = spotlight.x; mesh.position.z = spotlight.z; mesh.scale.setScalar(ringScale); });
    limeLight.position.x = spotlight.x;
    world.rotation.y += ((motion.progress - .5) * .35 + pointer.x * .055 - world.rotation.y) * .035;
    camera.position.x += (Math.sin(motion.progress * 1.8) * 3.5 + pointer.x * 1.4 - camera.position.x) * .04;
    camera.position.y += (12 + motion.progress * 5 - pointer.y * 1.3 - camera.position.y) * .04;
    camera.position.z += (17 - motion.progress * 3 - camera.position.z) * .04;
    camera.lookAt(lookAt);
    people.forEach((person, i) => {
      const x = person.x + Math.sin(time * .18 + person.phase) * .2;
      const z = person.z + Math.cos(time * .15 + person.phase) * .15;
      const reached = Math.hypot(x - spotlight.x, z - spotlight.z) < 3.1;
      const rise = reached && person.buyer ? .12 + Math.sin(time * 2 + person.phase) * .04 : 0;
      color.set(reached ? person.buyer ? 0xff3e88 : 0x171a12 : 0x96998a);
      temp.position.set(x, .17 * person.scale + rise, z); temp.scale.setScalar(person.scale); temp.rotation.y = person.phase;
      temp.updateMatrix(); bodyMesh.setMatrixAt(i, temp.matrix); bodyMesh.setColorAt(i, color);
      temp.position.y = .43 * person.scale + rise; temp.updateMatrix(); headMesh.setMatrixAt(i, temp.matrix); headMesh.setColorAt(i, color);
    });
    bodyMesh.instanceMatrix.needsUpdate = true; headMesh.instanceMatrix.needsUpdate = true;
    bodyMesh.instanceColor.needsUpdate = true; headMesh.instanceColor.needsUpdate = true;
    renderer.render(scene, camera);
    if (!ready) {
      ready = true; host.dataset.state = 'ready'; panel.classList.add('scene-ready'); document.dispatchEvent(new Event('reachwise:3d-ready'));
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  // Restore the 2D illustration if the graphics context is lost; try restoration naturally.
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; ready = false; host.dataset.state = 'fallback'; panel.classList.remove('scene-ready'); document.dispatchEvent(new Event('reachwise:3d-unavailable')); });
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
