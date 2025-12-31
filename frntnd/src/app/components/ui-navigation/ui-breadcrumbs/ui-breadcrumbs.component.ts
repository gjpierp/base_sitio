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

  constructor(private router: Router, private route: ActivatedRoute) {
    this.sub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.crumbs = this.normalizeCrumbs(this.buildCrumbs(this.route.root));
    });
    // Inicializar en primera carga
    this.crumbs = this.normalizeCrumbs(this.buildCrumbs(this.route.root));
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
    const routeConfig = child.routeConfig;
    const path = routeConfig?.path ?? '';
    const nextUrl = path ? `${baseUrl}/${path}`.replace(/\/+/, '/') : baseUrl || '/';
    const data = (routeConfig?.data as any) || {};
    const label = data.breadcrumb ?? data.title ?? this.formatLabel(path) ?? 'Dashboard';
    if (label) {
      crumbs.push({ label, url: nextUrl });
    }
    return crumbs.concat(this.buildCrumbs(child, nextUrl));
  }

  private normalizeCrumbs(list: Crumb[]): Crumb[] {
    if (!list || list.length === 0) return [];
    // Si hay más de un nivel y el primero es Dashboard, ocultarlo
    if (list.length > 1 && list[0].label.toLowerCase() === 'dashboard') {
      return list.slice(1);
    }
    return list;
  }

  private formatLabel(path: string): string {
    if (!path) return '';
    return path.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
