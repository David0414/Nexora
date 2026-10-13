import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('assets/vendor', { recursive: true });
for (const [source, target] of [
  ['node_modules/gsap/dist/gsap.min.js', 'gsap.min.js'],
  ['node_modules/gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
  ['node_modules/three/build/three.module.js', 'three.module.js'],
  ['node_modules/three/build/three.core.js', 'three.core.js'],
  ['node_modules/three/LICENSE', 'THREE-LICENSE.txt']
]) await copyFile(source, `assets/vendor/${target}`);
console.log('Local animation libraries prepared.');
