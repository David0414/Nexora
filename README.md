# Nexora

Sitio de Nexora, consultoría de software, plataformas, automatización industrial y hardware.

La página principal está en `index.html` y usa `src/site.css`, `src/site.js` y `src/experience.js`.

- `src/experience.js`: escena Three.js fija detrás de la página. Contiene el núcleo de ocho piezas con reflejos de entorno, bloom (solo en escritorio) y un campo de partículas. Expone un objeto `state` (posición, escala, apertura, giro y brillo) que la página anima. La calidad se adapta sola: mide el tiempo de cada cuadro y baja o sube la resolución (`QUALITY`), y con el núcleo fuera de pantalla casi no dibuja.
- `src/site.js`: coreografía con GSAP. Usa ScrollSmoother (scroll suave en escritorio), SplitText (titulares) y ScrollTrigger. El núcleo cambia de pose entre secciones (`SCENES`, con variantes de escritorio y celular). Servicios se desplaza en horizontal, los proyectos se apilan y el método fija la sección mientras el núcleo se ensambla. También maneja el cursor, los botones magnéticos y el formulario, que abre el correo con el mensaje ya escrito.
- Accesibilidad: respeta `prefers-reduced-motion` (sin intro, scroll nativo, escena estática) e incluye el botón **Pausar movimiento**. Cuando WebGL no está disponible usa `assets/nexora-core.svg`.

`scripts/vendor.mjs` copia GSAP y los complementos de Three.js desde `node_modules` a `assets/vendor/` y se ejecuta en cada `npm run build`. Los archivos `src/nexora-*.js|css`, `main.js`, `premium.*`, `motion.*` y `scene.js` pertenecen a versiones anteriores y la página ya no los carga. Lo mismo pasa con `scripts/qa-*.mjs`.

## Publicar Nexora en Vercel

Importa el repositorio `David0414/Nexora` y selecciona la raíz del repositorio en **Root Directory** (dejar vacío; la interfaz puede mostrar `./`).

El archivo `vercel.json` configura:

- **Framework Preset:** Other.
- **Install Command:** `npm ci`.
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.


## Abrir localmente

Desde esta carpeta:

```powershell
npm run dev
```

Abre http://localhost:5173. También puedes ejecutar `node scripts/serve.mjs` sin instalar paquetes.

Para verlo en un celular, conecta ambos dispositivos a la misma red Wi-Fi. Reinicia `npm start` y abre en el celular la dirección que la terminal muestra como `Celular / misma red Wi-Fi`. Mantén encendida la computadora y abierta la terminal. Puedes limitar el servidor a esta computadora con la variable `HOST=127.0.0.1`.

## Compilar

```powershell
npm run check
npm run build
```

La carpeta `dist` contiene el sitio estático completo. No necesita React, Framer, servicios de terceros ni un servidor de aplicación para funcionar. Las imágenes y fuentes están guardadas en `assets`.

## Editar

- `index.html`: textos, estructura, enlaces y formulario.
- `src/style.css`: estilos, colores, espaciado y diseños responsivos.
- `src/main.js`: servicios, equipo, reseñas, artículos e interacciones.
- `src/motion.js`: animaciones GSAP, ScrollTrigger, parallax y sección de proceso fijada durante el scroll.
- `src/scene.js`: escena Three.js con personas instanciadas, cámara en perspectiva y anillo de búsqueda animado.
- `src/motion.css`: profundidad, estados y adaptación de los efectos a celular.
- `src/premium.js` y `src/premium.css`: transiciones completas entre servicios, menú a pantalla completa, galería horizontal, cursor contextual, navegación entre capítulos, gráficos explorables, acordeones y diálogos animados.
- `assets`: imágenes y fuentes locales.

El contenido de marca, equipo, reseñas y métricas es de demostración, siguiendo la referencia. El formulario valida y guarda un brief en el navegador y permite descargarlo; no envía correos. Conectar el envío requiere configurar un destinatario y un servicio de formulario o backend.

Las pruebas de navegador usan Playwright con Chrome ya instalado. `scripts/qa.mjs` comprueba las vistas de escritorio y celular y las interacciones principales.

Los efectos 3D y de scroll usan GSAP y Three.js, servidos desde `assets/vendor` para funcionar sin CDN. `npm run build` actualiza estas copias desde los paquetes instalados. El scroll mantiene su comportamiento nativo; la sección del embudo se fija temporalmente únicamente en pantallas de escritorio suficientemente altas. En celular se reducen los efectos y la escena 3D se limita a 30 cuadros por segundo. Se respetan las preferencias de movimiento reducido; si WebGL no está disponible, se conserva la ilustración 2D.

La escena de audiencia permite transformar la multitud en un globo 3D y volver. La galería incorpora seis piezas, navegación con flechas y arrastre, y en escritorio acompaña el scroll vertical. En celular se navega con deslizamiento horizontal nativo. El menú «Explore» se abre desde el botón adicional de la portada en escritorio. Las gráficas muestran datos ilustrativos al pasar el cursor. `npm run test:premium` valida estas interacciones, las transiciones y los tamaños de pantalla.
