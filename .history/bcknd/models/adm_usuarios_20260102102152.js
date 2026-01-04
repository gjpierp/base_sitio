/**
 * Modelo: adm_usuarios.js
 * Propósito: Gestión completa de usuarios (CRUD, autenticación, roles,
 * permisos, historial de contraseñas). Contiene métodos para crear, actualizar,
 * cambiar/resetear contraseña, listar, obtener por id y utilidades relacionadas.
 */
const AdmRolPermiso = require("./adm_roles_permisos");
const AdmPermiso = require("./adm_permisos");
const AdmUsuarioRol = require("./adm_usuarios_roles");
const AdmRol = require("./adm_roles");
const db = require("../database/config");

// Hint para el validador de integridad: columnas usadas en la entidad
const __ENTITY_COLUMNS_HINT = [
  "fecha_cambio_contraseña",
  "fecha_cambio_contrasena",
];

class AdmUsuario {
  static async actualizarImagen(id_usuario, nombreArchivo) {
    await db.query("UPDATE adm_usuarios SET img = ? WHERE id_usuario = ?", [
      nombreArchivo,
      id_usuario,
    ]);
  }
  // Cambiar contraseña de un usuario
  static async cambiarContrasena(
    id_usuario,
    contrasena_actual,
    contrasena_nueva
  ) {
    // Obtener el usuario
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios WHERE id_usuario = ?",
      [id_usuario]
    );
    const usuario = rows[0];
    if (!usuario) return { error: true, msg: "Usuario no encontrado" };
    const bcrypt = require("bcryptjs");
    // Verificar contraseña actual
    const match = await bcrypt.compare(
      contrasena_actual,
      usuario.hash_contrasena
    );
    if (!match)
      return { error: true, msg: "La contraseña actual es incorrecta" };

    // Validar complejidad de la nueva contraseña
    // Al menos 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial, largo 8-12
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if (!regex.test(contrasena_nueva)) {
      return {
        error: true,
        msg: "La contraseña debe tener entre 8 y 12 caracteres, incluir al menos 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial",
      };
    }

    const nuevaHash = bcrypt.hashSync(contrasena_nueva, bcrypt.genSaltSync());
    const mismaActual = await bcrypt.compare(
      contrasena_nueva,
      usuario.hash_contrasena
    );
    if (mismaActual)
      return {
        error: true,
        msg: "La nueva contraseña no puede ser igual a la actual",
      };

    // Validar que la nueva contraseña no esté entre las últimas 10
    const [historial] = await db.query(
      "SELECT hash_contrasena FROM adm_historial_contrasenas WHERE id_usuario = ? ORDER BY fecha_cambio DESC LIMIT 10",
      [id_usuario]
    );
    for (const row of historial) {
      if (await bcrypt.compare(contrasena_nueva, row.hash_contrasena)) {
        return {
          error: true,
          msg: "La nueva contraseña no puede ser igual a ninguna de las últimas 10 contraseñas",
        };
      }
    }

    // Registrar la contraseña anterior en el historial
    await db.query(
      "INSERT INTO adm_historial_contrasenas (id_usuario, hash_contrasena, fecha_cambio) VALUES (?, ?, NOW())",
      [id_usuario, usuario.hash_contrasena]
    );

    // Actualizar en la base de datos
    await db.query(
      "UPDATE adm_usuarios SET hash_contrasena = ?, fecha_cambio_contrasena = NOW() WHERE id_usuario = ?",
      [nuevaHash, id_usuario]
    );
    return true;
  }
  // Alias para compatibilidad con controladores antiguos
  static async eliminar(id_usuario) {
    return this.delete(id_usuario);
  }
  /**
   * Verifica si el usuario tiene un rol específico (por nombre de rol)
   * @param {number} id_usuario
   * @param {string} nombreRol
   * @returns {Promise<boolean>}
   */
  static async tieneRol(id_usuario, nombreRol) {
    // Obtener todos los roles del usuario
    const usuarioRoles = await AdmUsuarioRol.findAll();
    const rolesIds = usuarioRoles
      .filter((r) => r.id_usuario === id_usuario)
      .map((r) => r.id_rol);
    if (!rolesIds.length) return false;
    // Obtener todos los roles y buscar si alguno coincide por nombre
    const roles = await AdmRol.findAll();
    const resultado = roles.some(
      (rol) => rolesIds.includes(rol.id_rol) && rol.nombre === nombreRol
    );
    return resultado;
  }
  // Alias para compatibilidad con controladores antiguos
  static async crear(data) {
    return this.create(data);
  }
  // Buscar usuario por correo
  static async obtenerPorCorreo(correo) {
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios WHERE correo = ?",
      [correo]
    );
    return rows[0] || null;
  }
  // Alias para compatibilidad con controladores antiguos
  static async obtenerPorId(id_usuario) {
    return this.findById(id_usuario);
  }
  // Listar usuarios con paginación y ordenación segura
  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre_usuario",
    sortDir = "ASC"
  ) {
    const col = [
      "id_usuario",
      "nombre_usuario",
      "correo",
      "id_tipo_usuario",
      "id_estado",
      "fecha_creacion",
      "fecha_actualizacion",
    ].includes(sortColumn)
      ? sortColumn
      : "nombre_usuario";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    // Si se pasan `null` explícitamente como señal, devolver todos sin paginar
    if (desde === null && limite === null) {
      const [rows] = await db.query(
        `SELECT * FROM adm_usuarios WHERE id_estado = 1 ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_usuarios WHERE id_estado = 1 ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  // Contar total de usuarios
  static async contar() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM adm_usuarios");
    return rows[0]?.total || 0;
  }
  static async findById(id_usuario) {
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios WHERE id_usuario = ? AND id_estado = 1",
      [id_usuario]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios WHERE id_estado = 1"
    );
    return rows;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_usuarios (nombre_usuario, correo, hash_contrasena, id_tipo_usuario, id_estado, activo, fecha_cambio_contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.nombre_usuario,
      data.correo,
      data.hash_contrasena,
      data.id_tipo_usuario,
      data.id_estado ?? 1,
      typeof data.activo !== "undefined" ? data.activo : 1,
      data.fecha_cambio_contrasena || data.fecha_cambio_contraseña || null,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_usuario, data) {
    // Construir dinámicamente el set de campos a actualizar, excluyendo correo y contraseña
    // Obtener columnas válidas de la tabla adm_usuarios
    const [cols] = await db.query("SHOW COLUMNS FROM adm_usuarios");
    const columnasValidas = cols.map((c) => c.Field);
    const camposNoPermitidos = [
      "correo",
      "contrasena",
      "hash_contrasena",
      "id_usuario",
    ];
    const campos = Object.keys(data).filter(
      (k) => !camposNoPermitidos.includes(k) && columnasValidas.includes(k)
    );
    if (campos.length === 0) return;
    const setSql = campos.map((k) => `${k} = ?`).join(", ");
    const values = campos.map((k) => data[k]);
    // Agregar fecha_actualizacion
    const sql = `UPDATE adm_usuarios SET ${setSql}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?`;
    values.push(id_usuario);
    await db.query(sql, values);
  }

  static async delete(id_usuario) {
    // Borrado físico (legacy) — eliminar relaciones y usuario
    await db.query("DELETE FROM adm_usuarios_jerarquias WHERE id_usuario = ?", [
      id_usuario,
    ]);
    await db.query("DELETE FROM adm_usuarios_roles WHERE id_usuario = ?", [
      id_usuario,
    ]);
    await db.query("DELETE FROM adm_usuarios WHERE id_usuario = ?", [
      id_usuario,
    ]);
  }

  static async softDelete(id_usuario) {
    // Soft delete: marcar como inactivo
    await db.query(
      "UPDATE adm_usuarios SET id_estado = 2 WHERE id_usuario = ?",
      [id_usuario]
    );
  }

  // Obtener roles de un usuario
  static async obtenerRoles(id_usuario) {
    const usuarioRoles = await AdmUsuarioRol.findAll();
    const idNum = Number(id_usuario);
    const rolesIds = usuarioRoles
      .filter((r) => Number(r.id_usuario) === idNum)
      .map((r) => r.id_rol);
    const roles = (await AdmRol.findAll()).filter((r) =>
      rolesIds.includes(r.id_rol)
    );
    return roles;
  }

  // Obtener roles vía JOIN (más eficiente que cargar todas las tablas)
  static async obtenerRolesPorUsuario(id_usuario) {
    const [rows] = await db.query(
      `SELECT r.* FROM adm_roles r INNER JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ?`,
      [id_usuario]
    );
    return rows || [];
  }

  // Sincronizar roles de un usuario
  static async sincronizarRoles(id_usuario, idsRoles) {
    // Eliminar todos los roles del usuario de una vez para evitar duplicados
    await db.query("DELETE FROM adm_usuarios_roles WHERE id_usuario = ?", [
      id_usuario,
    ]);
    // Validar duplicados
    if (idsRoles && idsRoles.length > 0) {
      const rolesUnicos = [...new Set(idsRoles.map(Number))];
      if (rolesUnicos.length !== idsRoles.length) {
        throw new Error(
          "No se puede asignar el mismo rol más de una vez al usuario"
        );
      }
      for (const id_rol of rolesUnicos) {
        await AdmUsuarioRol.create({ id_usuario, id_rol });
      }
    }
    return true;
  }
  static async obtenerPermisos(id_usuario) {
    const usuarioRoles = await AdmUsuarioRol.findAll();
    const idNum = Number(id_usuario);
    const rolesIds = usuarioRoles
      .filter((r) => Number(r.id_usuario) === idNum)
      .map((r) => r.id_rol);
    const rolesPermisos = await AdmRolPermiso.findAll();
    const permisosIds = rolesPermisos
      .filter((rp) => rolesIds.includes(rp.id_rol))
      .map((rp) => rp.id_permiso);
    const permisos = (await AdmPermiso.findAll()).filter((p) =>
      permisosIds.includes(p.id_permiso)
    );
    return permisos;
  }

  // Obtener permisos vía JOINs (más eficiente que cargar todas las tablas)
  static async obtenerPermisosPorUsuario(id_usuario) {
    const [rows] = await db.query(
      `SELECT DISTINCT p.* FROM adm_permisos p
       INNER JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso
       INNER JOIN adm_usuarios_roles ur ON ur.id_rol = rp.id_rol
       WHERE ur.id_usuario = ?`,
      [id_usuario]
    );
    return rows || [];
  }
}

module.exports = AdmUsuario;
