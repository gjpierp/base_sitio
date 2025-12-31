# Integración con Empresas de Servicios Básicos y Sistema de UF

## Empresas de Servicios Básicos

- Integración para obtener facturas electrónicas de agua, luz, gas, etc.
- Consulta automática de boletas/facturas por vivienda y periodo
- Registro de facturas en vvff_factura_servicio
- Validación de estado de pago y consumo

## Sistema de UF

- Integración para obtener el valor diario de la UF (Unidad de Fomento)
- Actualización automática y almacenamiento histórico
- Conversión de montos de seguros y contratos entre UF y CLP

## Tablas sugeridas

- vvff_uf_historico

  - id_uf (PK)
  - fecha
  - valor_uf

- vvff_factura_servicio
  - id_factura (PK)
  - id_servicio (FK)
  - periodo
  - fecha_emision
  - monto_uf
  - monto_clp
  - numero_boleta
  - proveedor
  - estado_pago
  - observaciones

## Seguros en UF y CLP

- Los montos de seguros deben almacenarse en ambas monedas:
  - monto_uf
  - monto_clp
- Conversión automática según valor de la UF vigente

## Recomendaciones técnicas

- Definir endpoints para integración con empresas de servicios y sistema de UF
- Registrar logs de integración y errores
- Validar y auditar los datos importados
