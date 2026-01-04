/**
 * Helper: menu-frontend.js
 * Propósito: Construir el menú que se envía al frontend según roles y permisos
 * de un usuario. Usado para armar la navegación dinámica en el cliente.
 */
const AdmMenu = require("../models/adm_menus");

const getMenuFrontend = (role) => {
  const esAdmin =
    role === "ADMIN_ROLE" || role === "ADMIN" || role === "SUPERADMIN";

  const menu = [
    {
      titulo: "Dashboard",
      icono: "mdi mdi-gauge",
      submenu: [
        { titulo: "Inicio", url: "/" },
        { titulo: "Gráficas", url: "grafica1" },
      ],
    },
    {
      titulo: "Administración",
      icono: "mdi mdi-shield-lock-outline",
      submenu: [],
    },
    {
      titulo: "Multi Sitios",
      icono: "mdi mdi-web",
      submenu: [],
    },
    {
      titulo: "Territorios",
      icono: "mdi mdi-earth",
      submenu: [
        { titulo: "Continentes", url: "territorios/continentes" },
        { titulo: "Países", url: "territorios/paises" },
        { titulo: "Divisiones", url: "territorios/divisiones" },
      ],
    },
  ];

  // Administración (RBAC)
  if (esAdmin) {
    menu[1].submenu.push(
      { titulo: "Usuarios", url: "usuarios", icono: "mdi mdi-account" },
      { titulo: "Roles", url: "roles", icono: "mdi mdi-shield-account" },
      { titulo: "Permisos", url: "permisos", icono: "mdi mdi-key" },
      { titulo: "Menús", url: "menus", icono: "mdi mdi-view-list" }
    );
  } else {
    menu[1].submenu.push(
      { titulo: "Mi Perfil", url: "perfil", icono: "mdi mdi-account" },
      { titulo: "Mis Menús", url: "menus/usuario", icono: "mdi mdi-view-list" }
    );
  }

  // Multi Sitios
  if (esAdmin) {
    menu[2].submenu.push(
      {
        titulo: "Tenants",
        url: "multisitios/tenants",
        icono: "mdi mdi-office-building",
      },
      {
        titulo: "Entornos",
        url: "multisitios/entornos",
        icono: "mdi mdi-cloud-outline",
      },
      {
        titulo: "Aplicaciones",
        url: "multisitios/aplicaciones",
        icono: "mdi mdi-application",
      },
      { titulo: "Sitios", url: "multisitios/sitios", icono: "mdi mdi-web" },
      {
        titulo: "Dominios",
        url: "multisitios/dominios",
        icono: "mdi mdi-web-box",
      },
      {
        titulo: "Páginas",
        url: "multisitios/paginas",
        icono: "mdi mdi-file-document-outline",
      },
      {
        titulo: "Rutas",
        url: "multisitios/rutas",
        icono: "mdi mdi-sign-direction",
      }
    );
  } else {
    menu[2].submenu.push({
      titulo: "Mis Sitios",
      url: "multisitios/sitios",
      icono: "mdi mdi-web",
    });
  }

  return menu;
};

const mapNodo = (nodo) => {
  return {
    titulo: nodo.nombre,
    icono: nodo.icono || "",
    url: nodo.url || null,
    orden: Number(nodo.orden ?? nodo.order ?? 0),
    submenu: Array.isArray(nodo.hijos) ? nodo.hijos.map(mapNodo) : [],
  };
};

const getMenuFrontendUsuario = async (idUsuario) => {
  const arbol = await AdmMenu.buildUserMenuTree(idUsuario);
  return arbol.map(mapNodo);
};

module.exports = {
  getMenuFrontend,
  getMenuFrontendUsuario,
};
