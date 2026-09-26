# Catálogo Ray-Ban — listo para Vercel

Incluye la última versión: 138 variantes, fotos originales, consulta por WhatsApp al +54 9 11 3933-0693, selector de rostro y estimación local mediante cámara o selfie.

## Opción 1: publicar desde tu computadora

Requiere Node.js instalado.

1. Descomprimí el ZIP.
2. Abrí una terminal dentro de la carpeta `catalogo-rayban` (donde está `vercel.json`).
3. Ejecutá:

```sh
npx vercel login
npx vercel --prod
```

4. Elegí tu cuenta/equipo y creá un proyecto nuevo para este catálogo. No lo vincules a otro sitio que quieras conservar.
5. La carpeta del proyecto es `./`. Si pregunta si querés modificar los ajustes detectados, usá los indicados abajo.
6. Vercel mostrará la dirección publicada al terminar.

## Opción 2: publicar desde GitHub

1. Creá un repositorio y subí el contenido descomprimido. `vercel.json` y la carpeta `public` deben quedar en la raíz del repositorio.
2. En Vercel, seleccioná Add New → Project e importá ese repositorio.
3. Usá estos ajustes:

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | raíz del repositorio |
| Build Command | vacío |
| Install Command | vacío |
| Output Directory | public |
| Environment Variables | ninguna |

4. Hacé clic en Deploy.

El archivo `vercel.json` ya define la configuración. El proyecto es estático: no necesita React, compilación, servidor propio, claves de API ni instalación de dependencias.

## Comprobar después de publicar

- Abrí el enlace de producción en una ventana privada. Si pide iniciar sesión en Vercel, revisá Settings → Deployment Protection y la protección del despliegue de producción.
- Tocá un modelo y comprobá que WhatsApp muestre el nombre, código y talle.
- Abrí “Ver mi tipo de rostro” y probá las opciones manuales.
- Probá la cámara desde el enlace HTTPS en Safari o Chrome. Debés autorizar el permiso de cámara. También podés elegir una selfie.
- La primera carga del analizador descarga los archivos del modelo. Las fotos se procesan localmente, no se envían a un servidor ni se guardan. La clasificación es una estimación geométrica orientativa, no una medición validada. La cámara aún requiere una prueba real en tu celular.

## Archivos principales

- `public/index.html`: estructura y textos.
- `public/style.css`: diseño y adaptación a celular.
- `public/app.js`: catálogo, talles, enlaces de WhatsApp y recomendaciones.
- `public/catalog-data.js`: datos que utiliza el catálogo.
- `public/products.json`: copia de los datos para edición/exportación. Si modificás productos, actualizá también `catalog-data.js`.
- `public/face-scan.mjs`: cámara, selfie y detección local.
- `public/face-geometry.mjs`: estimación orientativa de la forma del rostro.
- `public/assets/`: fotos de los productos.
- `public/vendor/mediapipe/`: modelo y librerías locales con su licencia. Conservá toda esta carpeta.

El stock refleja el catálogo original 15/09; no hay sincronización automática.

Documentación de referencia:
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/cli/deploy
