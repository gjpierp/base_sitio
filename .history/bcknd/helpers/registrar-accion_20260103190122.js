/**
 * Helper: registrar-accion.js
 * Propósito: Proveer middleware/factory para registrar acciones del sistema
 * en la tabla de auditoría. Usado en rutas para anotar CREAR/ACTUALIZAR/ELIMINAR.
 */
let HistorialAcciones = require("../models/adm_historial_acciones");
// Manejar posible export por defecto (interop) o módulos incompletos por circular requires
if (HistorialAcciones && typeof HistorialAcciones.default !== "undefined") {
  HistorialAcciones = HistorialAcciones.default;
}

const registrarAccion = async (
  idUsuario,
  accion,
  entidad,
  idEntidad = null,
  descripcion = null,
  req = null
) => {
  try {
    const ipOrigen = req
      ? req.headers["x-forwarded-for"] || req.connection.remoteAddress
      : null;

    // Compatibilidad: preferir .registrar, fallback a .create
    const registrarFn =
      HistorialAcciones &&
      (HistorialAcciones.registrar || HistorialAcciones.create);
    if (typeof registrarFn === "function") {
      await registrarFn.call(HistorialAcciones, {
        id_usuario: idUsuario,
        accion,
        entidad,
        id_entidad: idEntidad,
        descripcion,
        ip_origen: ipOrigen,
      });
    } else {
      console.error(
        "HistorialAcciones.registrar no disponible. Valor:",
        HistorialAcciones
      );
    }
  } catch (error) {
    // No lanzar error para no afectar la operación principal
    console.error("Error al registrar acción:", error);
  }
};

// Middleware para registrar acciones automáticamente
const middlewareRegistrarAccion = (accion, entidad) => {
  return async (req, res, next) => {
    // Guardar el método send original
    const originalSend = res.send;

    // Sobrescribir el método send
    res.send = function (data) {
      // Intentar parsear la respuesta si es JSON
      let responseData;
      try {
        responseData = typeof data === "string" ? JSON.parse(data) : data;
      } catch (e) {
        responseData = data;
      }

      // Si la respuesta es exitosa, registrar la acción
      if (responseData && responseData.ok) {
        const idUsuario = req.uid;
        const idEntidad =
          req.params.id ||
          responseData.id_usuario ||
          responseData.id_rol ||
          responseData.id_permiso ||
          responseData.id_menu;
        const descripcion = `${accion} en ${entidad}`;

        registrarAccion(
          idUsuario,
          accion,
          entidad,
          idEntidad,
          descripcion,
          req
        );
      }

      // Llamar al método send original
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  registrarAccion,
  middlewareRegistrarAccion,
};
