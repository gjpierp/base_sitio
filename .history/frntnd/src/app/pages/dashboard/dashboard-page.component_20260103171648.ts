/**
 * Componente para el dashboard principal del sistema.
 * Fecha  Autor Versión Descripción
 * 28-12-2025 Gerardo Paiva 1.0.0 Estadísticas y navegación principal.
 */
import { Component, Inject, OnInit, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiBadgeComponent } from '../../components/ui-form/ui-badge/ui-badge.component';
import { Router, RouterModule } from '@angular/router';
import { SidebarStateService } from '../../core/services/sidebar-state.service';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Variant = 'primary' | 'success' | 'warning' | 'danger';
interface Stat {
  label: string;
  value: number;
  icon: string;
  variant: Variant;
}

@Component({
  selector: 'page-dashboard',
  standalone: true,
  imports: [UiCardComponent, UiButtonComponent, UiBadgeComponent, RouterModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit {
  title = 'Dashboard';
  datosListos = false;

  isLoggedIn = false;

  stats: Stat[] = [
    { label: 'Usuarios', value: 0, icon: 'group', variant: 'primary' },
    { label: 'Roles', value: 0, icon: 'shield_person', variant: 'success' },
    { label: 'Permisos', value: 0, icon: 'key', variant: 'warning' },
    { label: 'Menús', value: 0, icon: 'view_list', variant: 'primary' },
  ];
  /**
   * @description Constructor de la clase DashboardPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sidebarState: SidebarStateService,
    private api: ApiService,
    private ngZone: NgZone
  ) {}

  /**
   * @description Inicializa el ciclo de vida del componente y verifica si el usuario está logueado.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('x-token');
      this.isLoggedIn = !!token;
    }
    // Cargar estadísticas reales del backend
    this.cargarStats();

    // Re-cargar estadísticas tras login desde otras partes de la app (e.g. social login)
    try {
      if (typeof window !== 'undefined' && (window as any).addEventListener) {
        (window as any).addEventListener('app:login', () => {
          try {
            this.ngZone.run(() => this.cargarStats());
          } catch {}
        });
      }
    } catch {}

    // Re-cargar estadísticas cuando la navegación aterrice en /dashboard (router reuse cases)
    try {
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((ev: any) => {
        try {
          if (ev && ev.urlAfterRedirects && ev.urlAfterRedirects.indexOf('/dashboard') === 0) {
            this.ngZone.run(() => this.cargarStats());
          }
        } catch {}
      });
    } catch {}
  }

  /**
   * @description Carga conteos reales para el dashboard desde los endpoints listar.
   * Intenta usar el campo `total` si está presente; si no, usa la longitud del arreglo.
   */
  private cargarStats() {
    const usuarios$ = this.api
      .get<any>('usuarios', { desde: 0, limite: 1 })
      .pipe(catchError(() => of({ usuarios: [], total: 0 })));
    const roles$ = this.api
      .get<any>('roles', { desde: 0, limite: 1 })
      .pipe(catchError(() => of({ roles: [], total: 0 })));
    const permisos$ = this.api
      .get<any>('permisos', { desde: 0, limite: 1 })
      .pipe(catchError(() => of({ permisos: [], total: 0 })));
    const menus$ = this.api
      .get<any>('menus', { desde: 0, limite: 1 })
      .pipe(catchError(() => of({ menus: [], total: 0 })));

    forkJoin([usuarios$, roles$, permisos$, menus$]).subscribe({
      next: ([uRes, rRes, pRes, mRes]) => {
        const countFrom = (res: any, key: string) => {
          const arr = Array.isArray(res?.[key]) ? res[key] : Array.isArray(res) ? res : [];
          const total = Number(res?.total) || arr.length || 0;
          return total;
        };
        const usuariosTotal = countFrom(uRes, 'usuarios');
        const rolesTotal = countFrom(rRes, 'roles');
        const permisosTotal = countFrom(pRes, 'permisos');
        const menusTotal = countFrom(mRes, 'menus');
        this.stats = [
          { label: 'Usuarios', value: usuariosTotal, icon: 'group', variant: 'primary' },
          { label: 'Roles', value: rolesTotal, icon: 'shield_person', variant: 'success' },
          { label: 'Permisos', value: permisosTotal, icon: 'key', variant: 'warning' },
          { label: 'Menús', value: menusTotal, icon: 'view_list', variant: 'primary' },
        ];
      },
      error: () => {
        // Mantener valores en 0 si hay error
        this.stats = [
          { label: 'Usuarios', value: 0, icon: 'group', variant: 'primary' },
          { label: 'Roles', value: 0, icon: 'shield_person', variant: 'success' },
          { label: 'Permisos', value: 0, icon: 'key', variant: 'warning' },
          { label: 'Menús', value: 0, icon: 'view_list', variant: 'primary' },
        ];
      },
    });
  }

  /**
   * @description Devuelve la ruta de listado según la etiqueta del stat.
   */
  getRouteFor(label: string): string {
    const key = label.toLowerCase();
    if (key.includes('usuario')) return '/usuarios';
    if (key.includes('rol')) return '/roles';
    if (key.includes('permiso')) return '/permisos';
    if (key.includes('menú') || key.includes('menu')) return '/menus';
    return '/dashboard';
  }

  /**
   * @description Cierra la sesión del usuario y redirige al login.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.sidebarState.clearExpansionState();
      localStorage.removeItem('x-token');
      // Limpiar datos sensibles y caches locales al hacer logout
      try {
        localStorage.removeItem('menu');
        localStorage.removeItem('roles');
        localStorage.removeItem('permisos');
      } catch {}
    }
    this.router.navigateByUrl('/login');
  }
}
