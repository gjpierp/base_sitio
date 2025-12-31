# Endpoints sugeridos para integración

## Empresas de Servicios Básicos

- GET /api/servicios/facturas?rut={rut}&periodo={periodo}
- POST /api/servicios/facturas/registrar
- GET /api/servicios/proveedores

## Sistema de UF

- GET /api/uf/valor?fecha={fecha}
- GET /api/uf/historico?desde={desde}&hasta={hasta}
- POST /api/uf/actualizar

## SIAP (Personal)

- GET /api/siap/personal?rut={rut}
- GET /api/siap/unidades

## SISREM (Remuneraciones)

- GET /api/sisrem/remuneraciones?rut={rut}
- GET /api/sisrem/descuentos?rut={rut}

---

# Flujo de integración (resumen)

1. El sistema consulta SIAP/SISREM para validar y actualizar datos de beneficiarios.
2. Al registrar o actualizar una vivienda, consulta empresas de servicios para obtener facturas asociadas.
3. Al registrar o renovar un seguro, consulta el valor de la UF y almacena el monto en UF y CLP.
4. Se registran logs de integración y errores en tablas de auditoría.
5. Se actualizan los historiales y se notifican los cambios relevantes al usuario.

Para cada integración, se recomienda implementar autenticación, validación de datos y manejo de errores robusto.
