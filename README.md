# Uso de Pantallas

Sitio académico de una sola página para el Taller de Investigación (Diseño de Medios Interactivos, USFQ). Autor: Joshua Alexander Lozada Zurita. Escritorio, mínimo 1280px de ancho.

## Correr el proyecto

```bash
npm install
npm run dev
```

Abre `http://localhost:4321`.

Otros comandos:

```bash
npm run build
npm run preview
```

## Entrar al panel de edición (Decap CMS)

El panel vive en `/admin` (`http://localhost:4321/admin`).

### En local, sin GitHub

1. En `public/admin/config.yml`, descomenta `local_backend: true`.
2. En otra terminal: `npx decap-server`
3. Abre `/admin` y edita. Los cambios se escriben en `src/content/`.

### En producción, con GitHub

El repositorio es `Scorpwik/UsoDePantallas`. Decap usa el backend de GitHub, así que hace falta una app OAuth:

1. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Homepage URL: la URL de Vercel (por ejemplo `https://uso-de-pantallas.vercel.app`).
3. Authorization callback URL: `https://TU-PROXY-OAUTH.vercel.app/callback`.
4. Despliega un proxy OAuth (por ejemplo [decap-cms-oauth](https://github.com/decap-cms/decap-cms/blob/main/packages/decap-cms-backend-github/README.md) o un servicio equivalente en Vercel) con:
   - `OAUTH_CLIENT_ID`
   - `OAUTH_CLIENT_SECRET`
5. En `public/admin/config.yml` agrega:

```yml
backend:
  name: github
  repo: Scorpwik/UsoDePantallas
  branch: main
  base_url: https://TU-PROXY-OAUTH.vercel.app
```

6. La cuenta de GitHub que inicie sesión debe tener permiso de escritura en el repositorio, aunque sea privado.

Sin el proxy, el panel no puede intercambiar el `client_secret`. No pongas secretos en el frontend.

## Agregar una entrada del diario

1. Entra a `/admin` y abre **Diario de campo**.
2. Crea una entrada nueva. Completa fecha, hora, espacio, textos, frases, categorías, imagen, galería, preguntas y la nota de privacidad.
3. Marca **La imagen tiene desenfoque aplicado** si el archivo ya está desenfocado.
4. Sube las fotos a `public/uploads/` (desde el propio panel). Usa archivos ya desenfocados.
5. Publica. Decap hace commit en GitHub; Vercel vuelve a construir el sitio.
6. La entrada aparece sola en **Diario de campo** y dentro de las **Categorías culturales** que hayas marcado. No hay que tocar código.

## Desplegar en Vercel

1. Sube el repositorio a GitHub (ya está en `Scorpwik/UsoDePantallas`).
2. En Vercel: **Add New Project** → importa ese repo.
3. Framework preset: Astro. Build: `npm run build`. Output: `dist`.
4. En `astro.config.mjs`, cambia `site` por la URL real de Vercel.
5. En `public/admin/config.yml`, actualiza `site_url` y `display_url`.
6. Deploy. El sitio es estático; no hace falta adapter de servidor.
