import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface Crumb {
  label: string;
  url: string;
}

@Component({
  selector: 'ui-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ui-breadcrumbs.component.html',
  styleUrls: ['./ui-breadcrumbs.component.css'],
})
export class UiBreadcrumbsComponent implements OnDestroy {
  crumbs: Crumb[] = [];
  private sub: Subscription;
  // etiquetas amigables para rutas con nombres largos
  private labelMap: Record<string, string> = {
    'aplicaciones-sitio': 'Aplicaciones',
    aplicaciones: 'Aplicaciones',
    sitios: 'Sitios',
    usuarios: 'Usuarios',
    roles: 'Roles',
    permisos: 'Permisos',
    menus: 'Menús',
    'tipos-usuarios': 'Tipos de usuario',
    'tipos_usuarios': 'Tipos de usuario',
    jerarquias: 'Jerarquías',
    estados: 'Estados',
    auditoria: 'Auditoría',
    temas: 'Temas',
  };

  constructor(private router: Router, private route: ActivatedRoute) {
    this.sub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      // Defer assignment para evitar ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => {
        this.crumbs = this.normalizeCrumbs(this.buildCrumbs(this.route.root));
      });
    });
    // Inicializar en primera carga (deferida)
    Promise.resolve().then(() => {
      this.crumbs = this.normalizeCrumbs(this.buildCrumbs(this.route.root));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private buildCrumbs(route: ActivatedRoute, baseUrl = ''): Crumb[] {
    const crumbs: Crumb[] = [];
    const child = route.firstChild;
    if (!child) {
      // raíz: dashboard
      return [{ label: 'Dashboard', url: '/' }];
    }

    // Usar snapshot de los segmentos para construir URLs acumuladas correctamente
    const childSnapshot = child.snapshot;
    const segments = childSnapshot.url.map((s) => s.path).filter(Boolean);
    const segmentPath = segments.join('/');
    const nextUrl = segmentPath ? `${baseUrl}/${segmentPath}`.replace(/\/+/g, '/') : baseUrl || '/';
    const routeConfig = child.routeConfig;
    const data = (routeConfig?.data as any) || {};
    const routeKey = routeConfig?.path ?? segmentPath;
    const mappedLabel = this.labelMap[routeKey];
    const labelRaw =
      data.breadcrumb ?? data.title ?? mappedLabel ?? this.formatLabel(routeKey) ?? 'Dashboard';
    const label = labelRaw || 'Dashboard';
    crumbs.push({ label, url: nextUrl });

    // Recorrer recursivamente usando el siguiente child
    return crumbs.concat(this.buildCrumbs(child, nextUrl));
  }

  private normalizeCrumbs(list: Crumb[]): Crumb[] {
    if (!list || list.length === 0) return [];
    // eliminar duplicados consecutivos de label
    let dedup: Crumb[] = [];
    for (let i = 0; i < list.length; i++) {
      const cur = list[i];
      const prev = i > 0 ? list[i - 1] : null;
      if (!prev || cur.label !== prev.label) dedup.push(cur);
    }

    // Asegurar que siempre exista la miga raíz 'Dashboard' al inicio
    if (dedup.length === 0 || dedup[0].label.toLowerCase() !== 'dashboard') {
      dedup.unshift({ label: 'Dashboard', url: '/' });
    }

    // Caso especial: "Dashboard / Dashboard" -> dejar solo uno
    if (
      dedup.length > 1 &&
      dedup[0].label.toLowerCase() === 'dashboard' &&
      dedup[dedup.length - 1].label.toLowerCase() === 'dashboard'
    ) {
      return [dedup[dedup.length - 1]];
    }

    return dedup;
  }

  private formatLabel(path: string): string {
    if (!path) return '';
    return path.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
