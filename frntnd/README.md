# Admin-Pro UI

Admin-Pro es un frontend especializado para la gestión de sitios y aplicaciones del backend `admin-bcknd`. Construido con Angular standalone y un sistema de diseño propio (dark, moderno).

## Servidor de desarrollo

```bash
npm install
ng serve
```

Abre `http://localhost:4200/`. La app recarga al guardar cambios.

## Sistema de diseño

- Variables y base: `src/design-system`.
- Estilos globales: `src/styles.css`.
- Componentes UI: `src/app/components` (botones, tarjetas, tablas, badges, inputs).

## Páginas y rutas

- Layout con sidebar: `LayoutShell`.
- Páginas: Usuarios, Roles, Permisos, Menús, Multi Sitios (Tenants, Entornos, Aplicaciones, Sitios, Dominios, Páginas, Rutas), Territorios (Continentes, Países, Divisiones), Uploads, Búsquedas, Traducciones.
- Rutas definidas en `src/app/app.routes.ts` con carga perezosa.

## API Backend

- Base actual: `http://localhost:3005/api` (ajústala en `src/app/services/api.service.ts` según tu backend).
- Autenticación: se adjunta el header `x-token` automáticamente mediante un interceptor. Guarda el token en `localStorage` como `x-token` (o `token`).

## Compilar

```bash
ng build
```

Artefactos en `dist/`.

## Tests

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Próximos pasos

- Conectar páginas a endpoints reales.
- Formularios de creación/edición.
- Paginación y filtros.
