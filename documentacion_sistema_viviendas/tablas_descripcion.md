# Descripción de Tablas y Relaciones

Incluye todas las tablas principales, de historial, parametrización y automatización documental, con sus campos y relaciones clave.

## Tablas Principales

- Vivienda
- Beneficiario
- Familiar
- Asignacion
- Pabellon
- Pieza
- Ocupante_Pieza
- Servicios_Basicos
- Factura_Servicio
- Seguro
- Beneficiario_Seguro
- Documento
- Contrato

## Tablas de Parametrización

- Tipo_Vivienda
- Tipo_Servicio
- Parentesco
- Estado
- Motivo
- Plantilla_Documento

## Tablas de Historial

- Historial_Ocupacion
- Historial_Servicio
- Historial_Seguro
- Historial_Pieza
- Historial_Familiar
- Historial_Asignacion
- Historial_Inspeccion
- Historial_Documento

## Relaciones

- Una vivienda puede tener muchas asignaciones, servicios y documentos.
- Un beneficiario puede tener familiares, seguros, asignaciones y documentos.
- Un pabellón puede tener muchas piezas, y cada pieza muchos ocupantes.
- Los historiales permiten trazabilidad completa de cambios y eventos.
- Los documentos y contratos se generan y almacenan automáticamente, asociados a los flujos del sistema.
