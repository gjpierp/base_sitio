(async () => {
  try {
    const AdmAuditoria = require('../models/adm_auditoria');
    const AdmHistAcc = require('../models/adm_historial_accesos');
    const AdmConf = require('../models/adm_configuraciones');
    const AdmUsuarios = require('../models/adm_usuarios');
    const AdmMenus = require('../models/adm_menus');
    const AdmMenusPerm = require('../models/adm_menus_permisos');
    const AdmPermisos = require('../models/adm_permisos');

    console.log('Models loaded');

    // Call aliases without DB interaction where possible
    if (typeof AdmAuditoria.search === 'function') console.log('AdmAuditoria.search OK');
    if (typeof AdmAuditoria.countFiltered === 'function') console.log('AdmAuditoria.countFiltered OK');
    if (typeof AdmHistAcc.search === 'function') console.log('AdmHistorialAccesos.search OK');
    if (typeof AdmConf.updateByClave === 'function') console.log('AdmConfiguraciones.updateByClave OK');
    if (typeof AdmUsuarios.obtenerPorCorreo === 'function') console.log('AdmUsuarios.obtenerPorCorreo OK');
    if (typeof AdmUsuarios.obtenerPorId === 'function') console.log('AdmUsuarios.obtenerPorId OK');
    if (typeof AdmUsuarios.obtenerRolesPorUsuario === 'function') console.log('AdmUsuarios.obtenerRolesPorUsuario OK');
    if (typeof AdmMenus.obtenerPermisos === 'function') console.log('AdmMenus.obtenerPermisos OK');
    if (typeof AdmMenus.existsByNombre === 'function') console.log('AdmMenus.existsByNombre OK');
    if (typeof AdmMenus.findByIds === 'function') console.log('AdmMenus.findByIds OK');
    if (typeof AdmMenusPerm.obtenerPermisos === 'function') console.log('AdmMenusPermisos.obtenerPermisos OK');
    if (typeof AdmMenusPerm.deleteByMenuAndPerm === 'function') console.log('AdmMenusPermisos.deleteByMenuAndPerm OK');
    if (typeof AdmPermisos.obtenerPorId === 'function') console.log('AdmPermisos.obtenerPorId OK');

    console.log('Done smoke checks');
  } catch (e) {
    console.error('Error executing checks:', e);
    process.exit(1);
  }
})();
