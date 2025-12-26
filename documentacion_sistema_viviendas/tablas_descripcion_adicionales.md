# Tablas adicionales y recomendaciones

## Seguros sobre bienes muebles e inmuebles

- Agregar tabla Bien (mueble/inmueble) para asociar seguros a cada bien:

Bien

- id_bien (PK)
- tipo_bien (mueble/inmueble)
- descripcion
- id_vivienda (FK, opcional)
- id_beneficiario (FK, opcional)

Seguro_Bien

- id_seguro_bien (PK)
- id_bien (FK)
- id_seguro (FK)
- fecha_inicio
- fecha_termino
- estado

## Revisión de posibles faltantes

- Gestión de usuarios y roles (seguridad y auditoría)
- Bitácora de acciones del sistema
- Gestión de notificaciones y alertas
- Integración con sistemas externos (por ejemplo, para validación de documentos o pagos)
- Módulo de reportes y estadísticas

Se recomienda agregar estos módulos/tablas si se requiere mayor control, seguridad y trazabilidad en el sistema.
