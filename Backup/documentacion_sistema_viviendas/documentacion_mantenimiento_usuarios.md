# Documentación: Módulo de Mantenimiento y Gestión de Usuarios

## Tablas principales

- **vvff_usuario**: Usuarios del sistema, con credenciales y datos de contacto.
- **vvff_rol**: Roles de usuario para control de acceso y permisos.
- **vvff_permiso**: Permisos de acceso a sistemas y módulos.
- **vvff_usuario_rol**: Relación muchos a muchos entre usuarios y roles.
- **vvff_rol_permiso**: Relación muchos a muchos entre roles y permisos.
- **vvff_bitacora**: Bitácora de acciones y auditoría del sistema.
- **vvff_parametro**: Parámetros configurables para el mantenimiento del sistema.

## Funcionalidades del módulo de mantenimiento

- Alta, baja y modificación de usuarios, roles y permisos.
- Asignación y revocación de roles a usuarios.
- Asignación y revocación de permisos a roles.
- Registro automático de acciones en la bitácora.
- Gestión de parámetros del sistema (opciones, catálogos, reglas, etc.).
- Consultas y reportes de auditoría.

## Recomendaciones

- Implementar interfaz de administración segura para la gestión de usuarios, roles y permisos.
- Registrar toda acción relevante en la bitácora para trazabilidad.
- Permitir la actualización dinámica de parámetros y permisos sin reiniciar el sistema.
- Definir roles mínimos: Administrador, Operador, Consulta.
- Definir permisos por módulo/sistema (ej: acceso a SIAP, SISREM, mantenimiento, reportes, etc.).

## Ejemplo de uso

- Un administrador crea un nuevo usuario, le asigna el rol de Operador y le otorga permisos de acceso a módulos específicos.
- Todas las acciones quedan registradas en la bitácora para auditoría.
