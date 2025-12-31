# Integraciones del Sistema de Viviendas Fiscales FACH

## Sistemas Externos

- **SIAP (Sistema de Personal):**

  - Consulta y sincronización de datos de personal (identidad, grado, unidad, situación laboral, etc.)
  - Actualización automática de beneficiarios y sus datos relevantes

- **SISREM (Sistema de Remuneraciones):**
  - Consulta de información de remuneraciones y descuentos
  - Validación de requisitos económicos para asignación o arriendo
  - Gestión de descuentos automáticos por uso de vivienda

## Recomendaciones técnicas

- Definir endpoints o servicios web para la integración (REST, SOAP, etc.)
- Registrar logs de integración y errores
- Sincronización periódica y/o bajo demanda
- Validar y auditar los datos importados

## Tablas sugeridas para trazabilidad de integración

- vvff_integracion_log

  - id_log (PK)
  - sistema_origen (SIAP/SISREM)
  - tipo_operacion (consulta, sincronización, error)
  - fecha_hora
  - usuario
  - descripcion
  - estado

- vvff_personal_externo
  - id_personal (PK)
  - rut
  - nombre
  - datos_siap (JSON)
  - datos_sisrem (JSON)
  - fecha_ultima_sync

Esto permitirá trazabilidad, auditoría y robustez en la integración con sistemas externos clave.
