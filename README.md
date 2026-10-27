# Reachwise

Sitio web basado en la referencia visual https://joyful-studies-761814.framer.app/.

Incluye una portada con fotografía y círculo interactivo, radar de clientes animado, visualización de audiencias, seis servicios, comparativa de resultados, proceso, informe interactivo, contenido social, equipo, reseñas, precios, FAQ, artículos y formulario.

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
