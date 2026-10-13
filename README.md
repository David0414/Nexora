# Reachwise

Sitio web basado en la referencia visual https://joyful-studies-761814.framer.app/.

Incluye una portada con fotografía y círculo interactivo, radar de clientes animado, visualización de audiencias, seis servicios, comparativa de resultados, proceso, informe interactivo, contenido social, equipo, reseñas, precios, FAQ, artículos y formulario.

## Abrir localmente

Desde esta carpeta:

```powershell
npm run dev
```

Abre http://localhost:5173. También puedes ejecutar `node scripts/serve.mjs` sin instalar paquetes.

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
- `assets`: imágenes y fuentes locales.

El contenido de marca, equipo, reseñas y métricas es de demostración, siguiendo la referencia. El formulario valida y guarda un brief en el navegador y permite descargarlo; no envía correos. Conectar el envío requiere configurar un destinatario y un servicio de formulario o backend.

Las pruebas de navegador usan Playwright con Chrome ya instalado. `scripts/qa.mjs` comprueba las vistas de escritorio y celular y las interacciones principales.
