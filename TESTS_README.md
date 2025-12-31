# Ejecutar pruebas (instrucciones)

Pasos rápidos en Windows (PowerShell o CMD):

1. Backend (Jest)

```
cd bcknd
npm install
npm test
```

2. Frontend (Vitest - pruebas unitarias ligeras)

```
cd frntnd
npm install
npm run test:unit
```

Notas:

- Se añadieron tests de ejemplo y configuración: `bcknd/jest.config.cjs`, `bcknd/tests/helpers/jwt.test.js`, `frntnd/vitest.config.ts`, `frntnd/src/test-setup/example.spec.ts`.
- En `bcknd/package.json` se añadió el script `test` y dependencias dev para `jest`. Ejecuta `npm install` dentro de `bcknd` para instalarlas.
- No se ejecutaron instalaciones ni tests desde este entorno; sigue los pasos anteriores en tu máquina.
