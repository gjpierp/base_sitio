-- Script completo para crear todas las tablas del sistema VVFF en MySQL desde cero
-- Incluye comentarios descriptivos en español para cada tabla y columna

-- Crear base de datos y seleccionar su uso
DROP DATABASE IF EXISTS db_viviendas_fiscales;
CREATE DATABASE db_viviendas_fiscales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_viviendas_fiscales;

-- Eliminar todas las tablas si existen (orden seguro por dependencias)
DROP TABLE IF EXISTS vvff_factura_servicio;
DROP TABLE IF EXISTS vvff_integracion_log;
DROP TABLE IF EXISTS vvff_uf_historico;
DROP TABLE IF EXISTS vvff_historial_ocupacion;
DROP TABLE IF EXISTS vvff_contrato;
DROP TABLE IF EXISTS vvff_plantilla_contrato;
DROP TABLE IF EXISTS vvff_plantilla_documento;
DROP TABLE IF EXISTS vvff_documento;
DROP TABLE IF EXISTS vvff_beneficiario_seguro;
DROP TABLE IF EXISTS vvff_seguro;
DROP TABLE IF EXISTS vvff_servicios_basicos;
DROP TABLE IF EXISTS vvff_servicio;
DROP TABLE IF EXISTS vvff_ocupante_pieza;
DROP TABLE IF EXISTS vvff_pieza;
DROP TABLE IF EXISTS vvff_pabellon;
DROP TABLE IF EXISTS vvff_asignacion;
DROP TABLE IF EXISTS vvff_familiar;
DROP TABLE IF EXISTS vvff_beneficiario;
DROP TABLE IF EXISTS vvff_vivienda;
DROP TABLE IF EXISTS vvff_motivo;
DROP TABLE IF EXISTS vvff_estado;
DROP TABLE IF EXISTS vvff_parentesco;
DROP TABLE IF EXISTS vvff_tipo_servicio;
DROP TABLE IF EXISTS vvff_tipo_seguro;
DROP TABLE IF EXISTS vvff_tipo_vivienda;
DROP TABLE IF EXISTS vvff_usuario_rol;
DROP TABLE IF EXISTS vvff_usuario;
DROP TABLE IF EXISTS vvff_rol_permiso;
DROP TABLE IF EXISTS vvff_rol;
DROP TABLE IF EXISTS vvff_bitacora;
DROP TABLE IF EXISTS vvff_parametro;
DROP TABLE IF EXISTS vvff_permiso;
DROP TABLE IF EXISTS vvff_mensajeria;
DROP TABLE IF EXISTS vvff_auditoria;
DROP TABLE IF EXISTS vvff_puntuacion;
DROP TABLE IF EXISTS vvff_alerta;
DROP TABLE IF EXISTS vvff_integracion;
DROP TABLE IF EXISTS vvff_pago;
DROP TABLE IF EXISTS vvff_vivienda_geocerca;
DROP TABLE IF EXISTS vvff_pabellon_geocerca;
DROP TABLE IF EXISTS vvff_geocerca;

CREATE TABLE vvff_tipo_vivienda (
    id_tipo_vivienda INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del tipo de vivienda',
    nombre VARCHAR(100) COMMENT 'Nombre del tipo de vivienda',
    descripcion VARCHAR(255) COMMENT 'Descripción del tipo de vivienda',
    activo BOOLEAN COMMENT 'Indica si está activo'
) COMMENT='Tipos de vivienda disponibles en el sistema';

CREATE TABLE vvff_tipo_seguro (
     id_tipo_seguro INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del tipo de seguro',
     nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del tipo de seguro',
     descripcion VARCHAR(255) COMMENT 'Descripción del tipo de seguro',
     activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el tipo de seguro está activo'
) COMMENT='Tipos de seguro disponibles en el sistema';

CREATE TABLE vvff_tipo_servicio (
    id_tipo_servicio INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del tipo de servicio',
     nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del tipo de servicio',
     descripcion VARCHAR(255) COMMENT 'Descripción del tipo de servicio',
    activo BOOLEAN COMMENT 'Indica si está activo'
) COMMENT='Tipos de servicio disponibles en el sistema';

CREATE TABLE vvff_parentesco (
    id_parentesco INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del parentesco',
    nombre VARCHAR(100) COMMENT 'Nombre del parentesco',
    descripcion VARCHAR(255) COMMENT 'Descripción del parentesco',
    activo BOOLEAN COMMENT 'Indica si está activo'
) COMMENT='Tipos de parentesco para familiares';

CREATE TABLE vvff_estado (
    id_estado INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del estado',
    nombre VARCHAR(100) COMMENT 'Nombre del estado',
    descripcion VARCHAR(255) COMMENT 'Descripción del estado',
    activo BOOLEAN COMMENT 'Indica si está activo'
) COMMENT='Estados generales del sistema';

CREATE TABLE vvff_motivo (
    id_motivo INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del motivo',
    nombre VARCHAR(100) COMMENT 'Nombre del motivo',
    descripcion VARCHAR(255) COMMENT 'Descripción del motivo',
    activo BOOLEAN COMMENT 'Indica si está activo'
) COMMENT='Motivos para asignaciones y movimientos';

-- Tablas principales

CREATE TABLE vvff_vivienda (
    id_vivienda INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la vivienda',
    direccion VARCHAR(255) COMMENT 'Dirección de la vivienda',
    id_tipo_vivienda INT COMMENT 'Tipo de vivienda',
    estado VARCHAR(50) COMMENT 'Estado de la vivienda',
    superficie DECIMAL(10,2) COMMENT 'Superficie en m2',
    cantidad_habitaciones INT COMMENT 'Número de habitaciones',
    unidad_asignada VARCHAR(100) COMMENT 'Unidad a la que está asignada',
    FOREIGN KEY (id_tipo_vivienda) REFERENCES vvff_tipo_vivienda(id_tipo_vivienda)
) COMMENT='Viviendas fiscales y arrendadas';

CREATE TABLE vvff_beneficiario (
    id_beneficiario INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del beneficiario',
    rut VARCHAR(20) COMMENT 'RUT del beneficiario',
    nombre VARCHAR(100) COMMENT 'Nombre completo',
    grado VARCHAR(50) COMMENT 'Grado o cargo',
    unidad VARCHAR(100) COMMENT 'Unidad de destino',
    fecha_ingreso_institucion DATE COMMENT 'Fecha de ingreso a la institución'
) COMMENT='Beneficiarios del sistema (personal FACH o externos)';


-- Seguros sobre bienes muebles e inmuebles
CREATE TABLE vvff_seguro (
    id_seguro INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del seguro',
    id_beneficiario INT COMMENT 'Beneficiario asegurado',
    tipo VARCHAR(50) COMMENT 'Tipo de seguro',
    monto DECIMAL(10,2) COMMENT 'Monto asegurado',
    moneda ENUM('UF','CLP') COMMENT 'Moneda',
    fecha_inicio DATE COMMENT 'Inicio de vigencia',
    fecha_termino DATE COMMENT 'Término de vigencia',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Estado',
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario)
) COMMENT='Seguros sobre bienes muebles e inmuebles';

CREATE TABLE vvff_familiar (
    id_familiar INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del familiar',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    nombre VARCHAR(100) COMMENT 'Nombre del familiar',
    rut VARCHAR(20) COMMENT 'RUT del familiar',
    id_parentesco INT COMMENT 'Tipo de parentesco',
    fecha_nacimiento DATE COMMENT 'Fecha de nacimiento',
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario),
    FOREIGN KEY (id_parentesco) REFERENCES vvff_parentesco(id_parentesco)
) COMMENT='Familiares de los beneficiarios';

CREATE TABLE vvff_asignacion (
    id_asignacion INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la asignación',
    id_vivienda INT COMMENT 'Vivienda asignada',
    id_beneficiario INT COMMENT 'Beneficiario asignado',
    fecha_asignacion DATE COMMENT 'Fecha de inicio de la asignación',
    fecha_termino DATE COMMENT 'Fecha de término de la asignación',
    id_motivo INT COMMENT 'Motivo de la asignación',
    estado VARCHAR(50) COMMENT 'Estado de la asignación',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda),
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario),
    FOREIGN KEY (id_motivo) REFERENCES vvff_motivo(id_motivo)
) COMMENT='Asignaciones de viviendas a beneficiarios';

CREATE TABLE vvff_pabellon (
    id_pabellon INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del pabellón',
    id_vivienda INT COMMENT 'Vivienda asociada al pabellón',
    nombre_pabellon VARCHAR(100) COMMENT 'Nombre del pabellón',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda)
) COMMENT='Pabellones de solteros';

CREATE TABLE vvff_pieza (
    id_pieza INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la pieza',
    id_pabellon INT COMMENT 'Pabellón al que pertenece la pieza',
    numero_pieza VARCHAR(20) COMMENT 'Número o código de la pieza',
    capacidad INT COMMENT 'Capacidad máxima de la pieza',
    FOREIGN KEY (id_pabellon) REFERENCES vvff_pabellon(id_pabellon)
) COMMENT='Piezas dentro de los pabellones';

CREATE TABLE vvff_ocupante_pieza (
    id_ocupante_pieza INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del registro',
    id_pieza INT COMMENT 'Pieza ocupada',
    id_beneficiario INT COMMENT 'Beneficiario ocupante',
    fecha_ingreso DATE COMMENT 'Fecha de ingreso a la pieza',
    fecha_salida DATE COMMENT 'Fecha de salida de la pieza',
    FOREIGN KEY (id_pieza) REFERENCES vvff_pieza(id_pieza),
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario)
) COMMENT='Ocupantes de cada pieza en pabellones';

-- Geocercas para viviendas y pabellones
CREATE TABLE vvff_geocerca (
    id_geocerca INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la geocerca',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la geocerca',
    descripcion VARCHAR(255) COMMENT 'Descripción de la geocerca',
    tipo ENUM('POLIGONO','RADIO') DEFAULT 'POLIGONO' COMMENT 'Tipo de geocerca: polígono o radio',
    coordenadas TEXT NOT NULL COMMENT 'Coordenadas en formato GeoJSON o lista de puntos',
    radio_metros INT COMMENT 'Radio en metros (si aplica)',
    activa BOOLEAN DEFAULT TRUE COMMENT 'Indica si la geocerca está activa',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación'
) COMMENT='Definición de geocercas para viviendas y pabellones';

CREATE TABLE vvff_vivienda_geocerca (
    id_vivienda INT COMMENT 'Vivienda asociada',
    id_geocerca INT COMMENT 'Geocerca asociada',
    PRIMARY KEY (id_vivienda, id_geocerca),
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda),
    FOREIGN KEY (id_geocerca) REFERENCES vvff_geocerca(id_geocerca)
) COMMENT='Relación entre viviendas y geocercas';

CREATE TABLE vvff_pabellon_geocerca (
    id_pabellon INT COMMENT 'Pabellón asociado',
    id_geocerca INT COMMENT 'Geocerca asociada',
    PRIMARY KEY (id_pabellon, id_geocerca),
    FOREIGN KEY (id_pabellon) REFERENCES vvff_pabellon(id_pabellon),
    FOREIGN KEY (id_geocerca) REFERENCES vvff_geocerca(id_geocerca)
) COMMENT='Relación entre pabellones y geocercas';

CREATE TABLE vvff_servicios_basicos (
    id_servicio INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del servicio',
    id_vivienda INT COMMENT 'Vivienda asociada',
    id_tipo_servicio INT COMMENT 'Tipo de servicio',
    estado_servicio VARCHAR(50) COMMENT 'Estado del servicio',
    vivienda_ocupada BOOLEAN COMMENT 'Indica si la vivienda está ocupada',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda),
    FOREIGN KEY (id_tipo_servicio) REFERENCES vvff_tipo_servicio(id_tipo_servicio)
) COMMENT='Servicios básicos asociados a viviendas';

CREATE TABLE vvff_beneficiario_seguro (
    id_beneficiario_seguro INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del registro',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    id_seguro INT COMMENT 'Seguro asociado',
    fecha_inicio DATE COMMENT 'Fecha de inicio del seguro',
    fecha_termino DATE COMMENT 'Fecha de término del seguro',
    estado VARCHAR(50) COMMENT 'Estado del seguro',
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario),
    FOREIGN KEY (id_seguro) REFERENCES vvff_seguro(id_seguro)
) COMMENT='Relación entre beneficiarios y seguros';

CREATE TABLE vvff_documento (
    id_documento INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del documento',
    tipo_documento VARCHAR(50) COMMENT 'Tipo de documento',
    nombre VARCHAR(100) COMMENT 'Nombre del documento',
    descripcion VARCHAR(255) COMMENT 'Descripción del documento',
    fecha_creacion DATE COMMENT 'Fecha de creación',
    fecha_modificacion DATE COMMENT 'Fecha de modificación',
    id_vivienda INT COMMENT 'Vivienda asociada',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    id_asignacion INT COMMENT 'Asignación asociada',
    url_archivo VARCHAR(255) COMMENT 'Ruta del archivo almacenado',
    version INT COMMENT 'Versión del documento',
    generado_automaticamente BOOLEAN COMMENT 'Indica si fue generado automáticamente',
    metadatos JSON COMMENT 'Metadatos adicionales',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda),
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario),
    FOREIGN KEY (id_asignacion) REFERENCES vvff_asignacion(id_asignacion)
) COMMENT='Documentos y contratos generados por el sistema';

CREATE TABLE vvff_plantilla_documento (
    id_plantilla INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la plantilla',
    tipo_documento VARCHAR(50) COMMENT 'Tipo de documento',
    nombre VARCHAR(100) COMMENT 'Nombre de la plantilla',
    contenido TEXT COMMENT 'Contenido de la plantilla',
    fecha_creacion DATE COMMENT 'Fecha de creación',
    fecha_modificacion DATE COMMENT 'Fecha de modificación',
    activa BOOLEAN COMMENT 'Indica si la plantilla está activa',
    aprendizaje_automatico BOOLEAN COMMENT 'Indica si la plantilla usa aprendizaje automático'
) COMMENT='Plantillas para generación automática de documentos';

CREATE TABLE vvff_contrato (
    id_contrato INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del contrato',
    id_documento INT COMMENT 'Documento asociado',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    id_vivienda INT COMMENT 'Vivienda asociada',
    fecha_inicio DATE COMMENT 'Fecha de inicio del contrato',
    fecha_termino DATE COMMENT 'Fecha de término del contrato',
    estado VARCHAR(50) COMMENT 'Estado del contrato',
    firmado BOOLEAN COMMENT 'Indica si el contrato está firmado',
    url_archivo_firmado VARCHAR(255) COMMENT 'Ruta del archivo firmado',
    FOREIGN KEY (id_documento) REFERENCES vvff_documento(id_documento),
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario),
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda)
) COMMENT='Contratos generados y firmados en el sistema';

CREATE TABLE vvff_plantilla_contrato (
    id_plantilla_contrato INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la plantilla de contrato',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la plantilla',
    descripcion VARCHAR(255) COMMENT 'Descripción de la plantilla',
    contenido TEXT COMMENT 'Contenido de la plantilla',
    tipo_contrato VARCHAR(50) COMMENT 'Tipo de contrato',
    activa BOOLEAN DEFAULT TRUE COMMENT 'Indica si la plantilla está activa',
    fecha_creacion DATE COMMENT 'Fecha de creación',
    fecha_modificacion DATE COMMENT 'Fecha de última modificación',
    aprendizaje_automatico BOOLEAN DEFAULT FALSE COMMENT 'Indica si la plantilla usa aprendizaje automático'
) COMMENT='Plantillas para generación automática de contratos';

CREATE TABLE vvff_historial_ocupacion (
    id_historial INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del historial',
    id_vivienda INT COMMENT 'Vivienda asociada',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    fecha_entrada DATE COMMENT 'Fecha de entrada',
    fecha_salida DATE COMMENT 'Fecha de salida',
    motivo_salida VARCHAR(255) COMMENT 'Motivo de salida',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda),
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario)
) COMMENT='Historial de ocupación de viviendas';

-- Tablas de integración
-- Tabla para el valor de la UF del mes actual
CREATE TABLE vvff_uf_actual (
    id_uf_actual INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único',
    mes INT NOT NULL COMMENT 'Mes (1-12)',
    anio INT NOT NULL COMMENT 'Año',
    valor_uf DECIMAL(12,4) NOT NULL COMMENT 'Valor de la UF para el mes',
    fecha_actualizacion DATE NOT NULL COMMENT 'Fecha de actualización',
    UNIQUE KEY uq_mes_anio (mes, anio)
) COMMENT='Valor de la UF del mes actual';

CREATE TABLE vvff_uf_historico (
    id_uf INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único',
    fecha DATE NOT NULL COMMENT 'Fecha del valor UF',
    valor_uf DECIMAL(12,4) NOT NULL COMMENT 'Valor de la UF en esa fecha'
) COMMENT='Histórico de valores de la UF';

CREATE TABLE vvff_integracion_log (
    id_log INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único',
    sistema_origen VARCHAR(50) NOT NULL COMMENT 'Sistema externo (SIAP, SISREM, SERVICIOS, UF)',
    tipo_operacion VARCHAR(50) NOT NULL COMMENT 'Tipo de operación (consulta, sincronización, error)',
    fecha_hora DATETIME NOT NULL COMMENT 'Fecha y hora del evento',
    usuario VARCHAR(100) COMMENT 'Usuario que ejecuta',
    descripcion TEXT COMMENT 'Descripción del evento',
    estado VARCHAR(50) COMMENT 'Estado del evento'
) COMMENT='Log de integraciones con sistemas externos';

CREATE TABLE vvff_factura_servicio (
    id_factura INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único',
    id_servicio INT COMMENT 'Servicio asociado',
    periodo VARCHAR(20) NOT NULL COMMENT 'Periodo de la factura',
    fecha_emision DATE NOT NULL COMMENT 'Fecha de emisión',
    monto_uf DECIMAL(12,4) COMMENT 'Monto en UF',
    monto_clp DECIMAL(14,2) COMMENT 'Monto en CLP',
    numero_boleta VARCHAR(50) COMMENT 'Número de boleta/factura',
    proveedor VARCHAR(100) COMMENT 'Empresa proveedora',
    estado_pago VARCHAR(50) COMMENT 'Estado de pago',
    observaciones VARCHAR(255) COMMENT 'Observaciones',
    FOREIGN KEY (id_servicio) REFERENCES vvff_servicios_basicos(id_servicio)
) COMMENT='Facturas electrónicas de servicios básicos';
-- Script para módulo de mantenimiento y gestión de usuarios en MySQL
-- Incluye tablas para usuarios, roles, bitácora y parametrización de mantenimiento

-- Tabla de usuarios del sistema
CREATE TABLE vvff_usuarios(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del usuario',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña',
    nombre_completo VARCHAR(100) COMMENT 'Nombre completo',
    email VARCHAR(100) COMMENT 'Correo electrónico',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el usuario está activo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del usuario'
) COMMENT='Usuarios del sistema de viviendas fiscales';

-- Tabla de roles de usuario
CREATE TABLE vvff_rol (
    id_rol INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del rol',
    nombre VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del rol',
    descripcion VARCHAR(255) COMMENT 'Descripción del rol',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el rol está activo'
) COMMENT='Roles de usuario para control de acceso';

-- Relación usuario-rol (muchos a muchos)
CREATE TABLE vvff_usuario_rol (
    id_usuario INT COMMENT 'Usuario',
    id_rol INT COMMENT 'Rol',
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES vvff_usuarios(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES vvff_rol(id_rol)
) COMMENT='Relación entre usuarios y roles';

-- Bitácora de acciones del sistema
CREATE TABLE vvff_bitacora (
    id_bitacora INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la bitácora',
    id_usuario INT COMMENT 'Usuario que realiza la acción',
    accion VARCHAR(100) COMMENT 'Acción realizada',
    descripcion TEXT COMMENT 'Descripción de la acción',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la acción',
    FOREIGN KEY (id_usuario) REFERENCES vvff_usuarios(id_usuario)
) COMMENT='Bitácora de acciones y auditoría del sistema';

-- Tabla de parámetros de mantenimiento
CREATE TABLE vvff_parametro (
    id_parametro INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del parámetro',
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre del parámetro',
    valor VARCHAR(255) COMMENT 'Valor del parámetro',
    descripcion VARCHAR(255) COMMENT 'Descripción del parámetro',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el parámetro está activo'
) COMMENT='Parámetros configurables del sistema';

-- Tabla de permisos del sistema
CREATE TABLE vvff_permiso (
    id_permiso INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del permiso',
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre del permiso',
    descripcion VARCHAR(255) COMMENT 'Descripción del permiso',
    modulo VARCHAR(100) COMMENT 'Módulo o sistema asociado'
) COMMENT='Permisos de acceso a sistemas y módulos';

-- Relación rol-permiso (muchos a muchos)
CREATE TABLE vvff_rol_permiso (
    id_rol INT COMMENT 'Rol',
    id_permiso INT COMMENT 'Permiso',
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES vvff_rol(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES vvff_permiso(id_permiso)
) COMMENT='Relación entre roles y permisos';

CREATE TABLE vvff_mensajeria (
    id_mensaje INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del mensaje',
    tipo VARCHAR(50) COMMENT 'Tipo de mensaje (alerta, notificación, recordatorio, etc.)',
    destinatario INT COMMENT 'Usuario destinatario',
    asunto VARCHAR(100) COMMENT 'Asunto del mensaje',
    cuerpo TEXT COMMENT 'Contenido del mensaje',
    parametros JSON COMMENT 'Parámetros dinámicos para personalización',
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de envío',
    leido BOOLEAN DEFAULT FALSE COMMENT 'Estado de lectura',
    FOREIGN KEY (destinatario) REFERENCES vvff_usuarios(id_usuario)
) COMMENT='Mensajería personalizada y parametrizable para usuarios del sistema';

-- Auditoría y trazabilidad
CREATE TABLE vvff_auditoria (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de auditoría',
    usuario_id INT COMMENT 'Usuario que realizó la acción',
    accion VARCHAR(100) COMMENT 'Acción realizada',
    tabla_afectada VARCHAR(100) COMMENT 'Tabla afectada',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora',
    FOREIGN KEY (usuario_id) REFERENCES vvff_usuarios(id_usuario)
) COMMENT='Registro de auditoría y trazabilidad';

-- Asignación de viviendas y piezas

-- Servicios básicos de viviendas
CREATE TABLE vvff_servicio (
    id_servicio INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del servicio',
    id_vivienda INT COMMENT 'Vivienda asociada',
    tipo VARCHAR(50) COMMENT 'Tipo de servicio',
    proveedor VARCHAR(100) COMMENT 'Proveedor',
    periodo VARCHAR(20) COMMENT 'Periodo de facturación',
    monto DECIMAL(10,2) COMMENT 'Monto facturado',
    pagado BOOLEAN DEFAULT FALSE COMMENT 'Estado de pago',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda)
) COMMENT='Servicios básicos de viviendas (versión legacy, para compatibilidad)';

-- Puntuación de Oficiales y PCP para asignación de viviendas
CREATE TABLE vvff_puntuacion (
    id_puntuacion INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la puntuación',
    id_beneficiario INT COMMENT 'Beneficiario evaluado',
    tipo_beneficiario ENUM('OFICIAL','PCP', 'PAC') COMMENT 'Tipo de beneficiario',
    periodo VARCHAR(20) COMMENT 'Periodo de evaluación',
    puntaje DECIMAL(5,2) COMMENT 'Puntaje obtenido',
    observaciones VARCHAR(255) COMMENT 'Observaciones',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario)
) COMMENT='Puntuación de Oficiales y PCP para asignación de viviendas';

-- Alertas de viviendas desocupadas con alto gasto
CREATE TABLE vvff_alerta (
    id_alerta INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la alerta',
    id_vivienda INT COMMENT 'Vivienda asociada',
    tipo VARCHAR(50) COMMENT 'Tipo de alerta',
    descripcion VARCHAR(255) COMMENT 'Descripción',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la alerta',
    FOREIGN KEY (id_vivienda) REFERENCES vvff_vivienda(id_vivienda)
) COMMENT='Alertas de viviendas desocupadas con alto gasto';

-- Integración con SIAP, SISREM y servicios externos
CREATE TABLE vvff_integracion (
    id_integracion INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único de la integración',
    tipo VARCHAR(50) COMMENT 'Tipo de integración',
    referencia VARCHAR(100) COMMENT 'Referencia externa',
    endpoint VARCHAR(255) COMMENT 'URL o endpoint de integración',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de integración'
) COMMENT='Integración con SIAP, SISREM y servicios externos';

-- Pagos (considerando porcentaje, fijo, UF)
CREATE TABLE vvff_pago (
    id_pago INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador único del pago',
    id_beneficiario INT COMMENT 'Beneficiario asociado',
    tipo_pago ENUM('PORCENTAJE','FIJO','UF') COMMENT 'Tipo de pago',
    monto DECIMAL(10,2) COMMENT 'Monto del pago',
    periodo VARCHAR(20) COMMENT 'Periodo de pago',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de pago',
    FOREIGN KEY (id_beneficiario) REFERENCES vvff_beneficiario(id_beneficiario)
) COMMENT='Pagos de arriendo y servicios, considerando porcentaje, fijo y UF';

-- Inserción correcta de usuarios en vvff_usuarios
INSERT INTO vvff_rol (nombre, descripcion, activo) VALUES
  ('Administrador', 'Acceso total al sistema, gestión y configuración', TRUE),
  ('Gestor Viviendas', 'Gestión de viviendas, asignaciones y mantención', TRUE),
  ('Finanzas', 'Gestión de pagos, servicios y facturación', TRUE),
  ('Beneficiario', 'Acceso a información personal, contratos y mensajería', TRUE),
  ('Auditor', 'Consulta y revisión de bitácora y auditoría', TRUE),
  ('Supervisor', 'Supervisión de procesos y validación de asignaciones', TRUE),
  ('Soporte', 'Gestión técnica y soporte de usuarios', TRUE);

INSERT INTO vvff_usuarios (username, password_hash, nombre_completo, email, activo) VALUES
    ('admin', 'hash123', 'Administrador General', 'admin@fach.cl', TRUE),
    ('gestor', 'hash456', 'Gestor Viviendas', 'gestor@fach.cl', TRUE);
    
INSERT INTO vvff_usuario_rol (id_usuario, id_rol) VALUES (1, 1);

-- Inserciones para tablas de parametrización
INSERT INTO vvff_tipo_vivienda (nombre, descripcion, activo) VALUES
    ('Casa', 'Vivienda unifamiliar', TRUE),
    ('Departamento', 'Vivienda en edificio', TRUE),
    ('Pabellón', 'Vivienda compartida tipo pabellón', TRUE);

-- Inserciones para vvff_tipo_servicio
INSERT INTO vvff_tipo_servicio (nombre, descripcion, activo) VALUES
    ('Agua', 'Servicio de agua potable', TRUE),
    ('Electricidad', 'Servicio de energía eléctrica', TRUE),
    ('Gas', 'Servicio de gas', TRUE),
    ('Internet', 'Servicio de internet', TRUE),
    ('Alcantarillado', 'Servicio de alcantarillado', TRUE),
    ('Basura', 'Servicio de recolección de basura', TRUE),
    ('TV Cable', 'Servicio de televisión por cable', TRUE),
    ('Teléfono', 'Servicio de telefonía fija', TRUE);

INSERT INTO vvff_parentesco (nombre, descripcion, activo) VALUES
  ('Cónyuge', 'Esposo/a', TRUE),
  ('Hijo', 'Hijo/a', TRUE),
  ('Padre', 'Padre', TRUE),
  ('Madre', 'Madre', TRUE);

INSERT INTO vvff_estado (nombre, descripcion, activo) VALUES
  ('Disponible', 'Vivienda disponible para asignación', TRUE),
  ('Ocupada', 'Vivienda actualmente ocupada', TRUE),
  ('En Mantención', 'Vivienda en proceso de mantención', TRUE);

INSERT INTO vvff_motivo (nombre, descripcion, activo) VALUES
  ('Asignación inicial', 'Primera asignación de vivienda', TRUE),
  ('Cambio de destino', 'Cambio por traslado institucional', TRUE),
  ('Vacancia', 'Asignación por vacancia', TRUE);

-- Ejemplo de inserción de mensajes personalizados
INSERT INTO vvff_mensajeria (tipo, destinatario, asunto, cuerpo, parametros, fecha_envio, leido) VALUES
  ('alerta', 1, 'Alerta de consumo', 'El consumo de agua en su vivienda ha superado el umbral parametrizado.', JSON_OBJECT('umbral', 30, 'unidad', 'm3'), NOW(), FALSE),
  ('notificacion', 1, 'Nuevo contrato disponible', 'Su contrato de arriendo ha sido generado y está disponible para firma.', JSON_OBJECT('contrato_id', 101), NOW(), FALSE),
  ('recordatorio', 1, 'Recordatorio de pago', 'Recuerde realizar el pago de servicios básicos antes del 5 de cada mes.', JSON_OBJECT('servicio', 'Electricidad', 'fecha_limite', '2025-01-05'), NOW(), FALSE);
  
INSERT INTO vvff_integracion (tipo, referencia, endpoint) VALUES
  ('SIAP', 'Personal y cargas familiares', '/api/v1/integracion/siap/{rut}'),
  ('SISREM', 'Descuentos mensuales', '/api/v1/integracion/sisrem/descuento'),
  ('UF', 'Actualización diaria de la UF', '/api/v1/externo/uf'),
  ('VIVIENDAS', 'Asignación y contrato automático', '/api/v1/viviendas/asignar'),
  ('SERVICIOS', 'Registro y pago de servicios básicos', '/api/v1/servicios/registrar');

-- Inserciones para tipos de seguro
INSERT INTO vvff_tipo_seguro (nombre, descripcion, activo) VALUES
  ('Incendio', 'Seguro contra incendio de la vivienda', TRUE),
  ('Robo', 'Seguro contra robo de bienes muebles', TRUE),
  ('Responsabilidad Civil', 'Seguro de responsabilidad civil', TRUE),
  ('Daños por Agua', 'Seguro por daños causados por agua', TRUE),
  ('Multirriesgo', 'Seguro multirriesgo para vivienda', TRUE);
  -- Inserciones para vvff_plantilla_contrato
INSERT INTO vvff_plantilla_contrato (nombre, descripcion, contenido, tipo_contrato, activa) VALUES
  ('Contrato de Arriendo', 'Plantilla estándar para arriendo de vivienda fiscal', 'Contenido base del contrato de arriendo...', 'Arriendo', TRUE),
  ('Contrato de Uso Pabellón', 'Plantilla para uso de pabellón de solteros', 'Contenido base del contrato de pabellón...', 'Pabellón', TRUE),
  ('Contrato de Vacancia', 'Plantilla para arriendo a externo por vacancia', 'Contenido base del contrato de vacancia...', 'Vacancia', TRUE);

-- Inserciones para vvff_plantilla_documento
INSERT INTO vvff_plantilla_documento (tipo_documento, nombre, contenido, activa, aprendizaje_automatico) VALUES
  ('Contrato', 'Plantilla Contrato Arriendo', 'Texto base para contrato de arriendo...', TRUE, FALSE),
  ('Certificado', 'Plantilla Certificado Residencia', 'Texto base para certificado de residencia...', TRUE, FALSE),
  ('Notificación', 'Plantilla Notificación de Pago', 'Texto base para notificación de pago...', TRUE, FALSE);