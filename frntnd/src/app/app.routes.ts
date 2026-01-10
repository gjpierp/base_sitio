import { Routes } from '@angular/router';
import { usuariosResolver } from './pages/usuarios/usuarios.resolver';
import { tiposUsuariosResolver } from './pages/tipos-usuarios/tipos-usuarios.resolver';
import { rolesResolver } from './pages/roles/roles.resolver';
import { permisosResolver } from './pages/permisos/permisos.resolver';
import { menusResolver } from './pages/menus/menus.resolver';
import { menusPermisosResolver } from './pages/menus-permisos/menus-permisos.resolver';
import { estadosResolver } from './pages/estados/estados.resolver';
import { jerarquiasResolver } from './pages/jerarquias/jerarquias.resolver';
import { atributoResolver } from './pages/atributo/atributo.resolver';
import { entidadesResolver } from './pages/entidades/entidades.resolver';
import { rolesPermisosResolver } from './pages/roles_permisos/roles-permisos.resolver';
import { sitiosResolver } from './pages/sitios/sitios.resolver';
import { usuariosAplicacionesResolver } from './pages/usuarios-aplicaciones/usuarios-aplicaciones.resolver';
import { usuariosJerarquiasResolver } from './pages/usuarios-jerarquias/usuarios-jerarquias.resolver';
import { authGuard } from './guards/auth.guard';
import { loginRedirectGuard } from './guards/login-redirect.guard';
import { usuariosRolesResolver } from './pages/usuarios-roles/usuarios-roles.resolver';

export const routes: Routes = [
  // ...existing code...
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [loginRedirectGuard],
    data: { title: 'Iniciar sesión', breadcrumb: 'Login' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent
      ),
    canActivate: [loginRedirectGuard],
    data: { title: 'Registro', breadcrumb: 'Registro' },
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/ui-layout/ui-layout/ui-layout.component').then(
        (m) => m.UiLayoutComponent
      ),
    children: [
      {
        path: 'menus-permisos',
        loadComponent: () =>
          import('./pages/menus-permisos/menus-permisos-page.component').then(
            (m) => m.MenusPermisosPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: menusPermisosResolver },
        data: {
          title: 'Menús-Permisos',
          breadcrumb: 'Menús-Permisos',
          sortKey: 'nombre',
          sortDir: 'asc',
          requiresAdmin: true,
        },
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          ),
        data: { title: 'Inicio', breadcrumb: 'Inicio' },
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          ),
        data: { title: 'Inicio', breadcrumb: 'Inicio' },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/mi-perfil-page.component').then((m) => m.MiPerfilPageComponent),
        canActivate: [authGuard],
        data: { title: 'Mi Perfil', breadcrumb: 'Mi Perfil' },
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion-page.component').then(
            (m) => m.ConfiguracionPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Configuración', breadcrumb: 'Configuración' },
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios-page.component').then((m) => m.UsuariosPageComponent),
        canActivate: [authGuard],
        resolve: { pre: usuariosResolver },
        data: { title: 'Usuarios', breadcrumb: 'Usuarios', sortKey: 'nombre', sortDir: 'asc' },
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles/roles-page.component').then((m) => m.RolesPageComponent),
        canActivate: [authGuard],
        resolve: { pre: rolesResolver },
        data: { title: 'Roles', breadcrumb: 'Roles', sortKey: 'nombre', sortDir: 'asc' },
      },
      {
        path: 'permisos',
        loadComponent: () =>
          import('./pages/permisos/permisos-page.component').then((m) => m.PermisosPageComponent),
        canActivate: [authGuard],
        resolve: { pre: permisosResolver },
        data: { title: 'Permisos', breadcrumb: 'Permisos', sortKey: 'codigo', sortDir: 'asc' },
      },
      {
        path: 'tipos-usuarios',
        loadComponent: () =>
          import('./pages/tipos-usuarios/tipos-usuarios-page.component').then(
            (m) => m.TiposUsuariosPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: tiposUsuariosResolver },
        data: {
          title: 'Tipos de Usuario',
          breadcrumb: 'Tipos de Usuario',
          sortKey: 'nombre',
          sortDir: 'asc',
        },
      },
      {
        path: 'roles-permisos',
        loadComponent: () =>
          import('./pages/roles_permisos/roles-permisos-page.component').then(
            (m) => m.RolesPermisosPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: rolesPermisosResolver },
        data: {
          title: 'Roles-Permisos',
          breadcrumb: 'Roles-Permisos',
          sortKey: 'nombre',
          sortDir: 'asc',
        },
      },
      {
        path: 'menus',
        loadComponent: () =>
          import('./pages/menus/menus-page.component').then((m) => m.MenusPageComponent),
        canActivate: [authGuard],
        resolve: { pre: menusResolver },
        data: {
          title: 'Menús',
          breadcrumb: 'Menús',
          sortKey: 'nombre',
          sortDir: 'asc',
          requiresAdmin: true,
        },
      },
      {
        path: 'estados',
        loadComponent: () =>
          import('./pages/estados/estados-page.component').then((m) => m.EstadosPageComponent),
        canActivate: [authGuard],
        resolve: { pre: estadosResolver },
        data: { title: 'Estados', breadcrumb: 'Estados', sortKey: 'nombre', sortDir: 'asc' },
      },
      {
        path: 'jerarquias',
        loadComponent: () =>
          import('./pages/jerarquias/jerarquias-page.component').then(
            (m) => m.JerarquiasPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: jerarquiasResolver },
        data: { title: 'Jerarquías', breadcrumb: 'Jerarquías', sortKey: 'nombre', sortDir: 'asc' },
      },
      {
        path: 'uploads/usuarios',
        loadComponent: () =>
          import('./pages/uploads/usuarios/usuarios-page.component').then(
            (m) => m.UsuariosPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Uploads de usuarios', breadcrumb: 'Subir Usuarios' },
      },
      {
        path: 'busquedas/general',
        loadComponent: () =>
          import('./pages/busquedas/general/general-page.component').then(
            (m) => m.GeneralPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Búsquedas', breadcrumb: 'Búsquedas generales' },
      },

      {
        path: 'aplicaciones-sitio',
        loadComponent: () =>
          import('./pages/aplicaciones-sitio/aplicaciones-sitio-page.component').then(
            (m) => m.AplicacionesSitioPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Aplicaciones', breadcrumb: 'Aplicaciones' },
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./pages/auditoria/auditoria-page.component').then(
            (m) => m.AuditoriaPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Auditoría', breadcrumb: 'Auditoría' },
      },
      {
        path: 'historial/accesos',
        loadComponent: () =>
          import('./pages/historial-accesos/historial-accesos-page.component').then(
            (m) => m.HistorialAccesosPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Historial accesos', breadcrumb: 'Historial accesos' },
      },
      {
        path: 'historial/acciones',
        loadComponent: () =>
          import('./pages/historial-acciones/historial-acciones-page.component').then(
            (m) => m.HistorialAccionesPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Historial acciones', breadcrumb: 'Historial acciones' },
      },
      {
        path: 'historial/contrasenas',
        loadComponent: () =>
          import('./pages/historial-contrasenas/historial-contrasenas-page.component').then(
            (m) => m.HistorialContrasenasPageComponent
          ),
        canActivate: [authGuard],
        data: { title: 'Historial contraseñas', breadcrumb: 'Historial contraseñas' },
      },
      {
        path: 'sitios',
        loadComponent: () =>
          import('./pages/sitios/sitios-page.component').then((m) => m.SitiosPageComponent),
        canActivate: [authGuard],
        resolve: { pre: sitiosResolver },
        data: { title: 'Sitios', breadcrumb: 'Sitios' },
      },
      {
        path: 'atributos',
        loadComponent: () =>
          import('./pages/atributo/atributo-page.component').then((m) => m.AtributoPageComponent),
        canActivate: [authGuard],
        resolve: { pre: atributoResolver },
        data: { title: 'Atributos', breadcrumb: 'Atributos' },
      },
      {
        path: 'entidades',
        loadComponent: () =>
          import('./pages/entidades/entidades-page.component').then(
            (m) => m.EntidadesPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: entidadesResolver },
        data: { title: 'Entidades', breadcrumb: 'Entidades' },
      },
      {
        path: 'usuarios-aplicaciones',
        loadComponent: () =>
          import('./pages/usuarios-aplicaciones/usuarios-aplicaciones-page.component').then(
            (m) => m.UsuariosAplicacionesPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: usuariosAplicacionesResolver },
        data: {
          title: 'Usuarios-Aplicaciones',
          breadcrumb: 'Usuarios-Aplicaciones',
          sortKey: 'nombre',
          sortDir: 'asc',
        },
      },
      {
        path: 'usuarios-jerarquias',
        loadComponent: () =>
          import('./pages/usuarios-jerarquias/usuarios-jerarquias-page.component').then(
            (m) => m.UsuariosJerarquiasPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: usuariosJerarquiasResolver },
        data: {
          title: 'Usuarios-Jerarquías',
          breadcrumb: 'Usuarios-Jerarquías',
          sortKey: 'nombre',
          sortDir: 'asc',
        },
      },
      {
        path: 'usuarios-roles',
        loadComponent: () =>
          import('./pages/usuarios-roles/usuarios-roles-page.component').then(
            (m) => m.UsuariosRolesPageComponent
          ),
        canActivate: [authGuard],
        resolve: { pre: usuariosRolesResolver },
        data: {
          title: 'Usuarios-Roles',
          breadcrumb: 'Usuarios-Roles',
          sortKey: 'usuario',
          sortDir: 'asc',
        },
      },
    ],
  },
];
