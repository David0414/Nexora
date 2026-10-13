import { mkdir, copyFile, cp } from 'node:fs/promises';
import './vendor.mjs';
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
console.log('Build complete: dist/');
