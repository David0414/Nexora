import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const jsm = 'node_modules/three/examples/jsm';
const files = [
  ['node_modules/gsap/dist/gsap.min.js', 'gsap.min.js'],
  ['node_modules/gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
  ['node_modules/gsap/dist/ScrollSmoother.min.js', 'ScrollSmoother.min.js'],
  ['node_modules/gsap/dist/SplitText.min.js', 'SplitText.min.js'],
  ['node_modules/three/build/three.module.js', 'three.module.js'],
  ['node_modules/three/build/three.core.js', 'three.core.js'],
  ['node_modules/three/LICENSE', 'THREE-LICENSE.txt'],
  // Three.js addons keep their folder layout so their relative imports resolve.
  ...[
    'environments/RoomEnvironment.js',
    'postprocessing/EffectComposer.js',
    'postprocessing/RenderPass.js',
    'postprocessing/ShaderPass.js',
    'postprocessing/MaskPass.js',
    'postprocessing/Pass.js',
    'postprocessing/UnrealBloomPass.js',
    'postprocessing/OutputPass.js',
    'shaders/CopyShader.js',
    'shaders/LuminosityHighPassShader.js',
    'shaders/OutputShader.js',
    'utils/BufferGeometryUtils.js'
  ].map(path => [`${jsm}/${path}`, `jsm/${path}`])
];
for (const [source, target] of files) {
  const destination = `assets/vendor/${target}`;
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
console.log('Local animation libraries prepared.');
