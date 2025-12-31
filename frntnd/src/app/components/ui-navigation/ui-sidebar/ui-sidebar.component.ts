import { Component, Input, Inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { Subscription, filter } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { UiSidebarItemComponent } from './ui-sidebar-item.component';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, UiSidebarItemComponent],
  templateUrl: './ui-sidebar.component.html',
  styleUrls: ['./ui-sidebar.component.css'],
})
export class UiSidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @HostBinding('class.collapsed') get hostCollapsed() {
    return this.collapsed;
  }
  isLoggedIn = false;
  loading = false;
  errorMsg: string | null = null;
  private isBrowser = false;
  private routerSub?: Subscription;
  private successNotified = false;
  private storageListener?: (e: Event) => void;
  private loginListener?: (e: Event) => void;
  menuItems: Array<{
    id_menu: number;
    nombre: string;
    ruta?: string;
    icono?: string;
    hijos?: any[];
  }> = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private api: ApiService,
    private router: Router,
    private notify: NotificationService,
    private sidebarState: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.syncLoginAndMaybeLoad();
    if (this.isBrowser) {
      // Escuchar evento custom disparado al hacer login en la app
      this.loginListener = (e?: any) => {
        try {
          console.log('[ui-sidebar] app:login recibido, event.detail:', e?.detail);
        } catch {}
        // Si el event trae el menu en detail, actualizar solo el componente
        try {
          const menuFromEvent = e?.detail?.menu;
          if (Array.isArray(menuFromEvent) && menuFromEvent.length) {
            this.menuItems = this.sanitizeMenuTree(menuFromEvent);
            this.autoExpandForCurrentRoute();
            return;
          }
        } catch (err) {
          // continuar y forzar recarga si algo falla
        }
        // Si no hay menú en el event, recargar desde backend
        this.reloadMenu(true);
      };
      try {
        window.addEventListener('app:login', this.loginListener as EventListener);
      } catch {}
      this.routerSub = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          this.syncLoginAndMaybeLoad();
          this.autoExpandForCurrentRoute();
        });
    }
  }

  public async reloadMenu(forceBackend: boolean = true) {
    if (!this.isBrowser) return;
    localStorage.removeItem('menu');
    this.menuItems = [];
    this.loading = true;
    // Forzar carga del árbol desde backend
    this.api.get<{ ok: boolean; menus: any[] }>('menus/arbol').subscribe({
      next: (resp) => {
        const arbol = Array.isArray(resp?.menus) ? resp.menus : [];
        this.menuItems = this.sanitizeMenuTree(arbol);
        localStorage.setItem('menu', JSON.stringify(this.menuItems));
        this.loading = false;
        this.autoExpandForCurrentRoute();
        this.notify.success('Menú recargado', 1500);
      },
      error: () => {
        this.menuItems = [];
        this.errorMsg = 'No se pudo cargar el menú';
        this.loading = false;
        this.notify.error('Error al recargar menú');
      },
    });
  }
  // ...resto de la clase igual...
  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    try {
      if (this.loginListener)
        window.removeEventListener('app:login', this.loginListener as EventListener);
    } catch {}
  }
  private syncLoginAndMaybeLoad() {
    if (!this.isBrowser) return;
    // Verificar token
    const token = localStorage.getItem('x-token') || localStorage.getItem('token');
    this.isLoggedIn = !!token;
    this.errorMsg = null;
    if (!this.isLoggedIn) {
      this.menuItems = [];
      return;
    }
    // Intentar cargar menú desde localStorage
    try {
      const menuStr = localStorage.getItem('menu');
      if (menuStr) {
        const menuRaw = JSON.parse(menuStr);
        if (Array.isArray(menuRaw)) {
          // Intentar normalizar cualquier forma que venga del cache
          const sanitized = this.sanitizeMenuTree(menuRaw);
          if (Array.isArray(sanitized) && sanitized.length) {
            this.menuItems = sanitized;
            this.autoExpandForCurrentRoute();
            return;
          }
          // Si el cache tenía entradas pero la sanitización no produjo nada,
          // limpiar cache y forzar recarga desde backend
          if (menuRaw.length) {
            localStorage.removeItem('menu');
          }
        }
      }
    } catch (e) {
      this.menuItems = [];
      this.errorMsg = 'Error al leer menú local';
      // continuar y reintentar carga desde backend
    }
    // Si no hay menú en localStorage, intentar cargar árbol desde backend
    this.loading = true;
    this.api.get<{ ok: boolean; menus: any[] }>('menus/arbol').subscribe({
      next: (resp) => {
        const arbol = Array.isArray(resp?.menus) ? resp.menus : [];
        this.menuItems = this.sanitizeMenuTree(arbol);
        localStorage.setItem('menu', JSON.stringify(this.menuItems));
        this.loading = false;
        this.autoExpandForCurrentRoute();
      },
      error: () => {
        this.menuItems = [];
        this.errorMsg = 'No se pudo cargar el menú';
        this.loading = false;
      },
    });
  }

  private autoExpandForCurrentRoute(): void {
    if (!this.isBrowser || !this.menuItems?.length) return;
    const current = (this.router.url || '').replace(/^\//, '');
    if (!current) return;
    const parentsToExpand = new Set<string>();

    const visit = (item: any, parentId: string | null): void => {
      const ruta: string = (item?.ruta || item?.url || '').toString();
      const children: any[] = Array.isArray(item?.hijos) ? item.hijos : [];

      // Si este item coincide con la ruta actual, expandir su padre
      if (ruta && (current === ruta || current.startsWith(ruta + '/'))) {
        if (parentId) parentsToExpand.add(parentId);
      }

      // Recorrer hijos
      for (const child of children) {
        const id = item?.id_menu;
        visit(child, id != null ? String(id) : parentId);
      }
    };

    for (const root of this.menuItems) {
      visit(root, null);
    }

    // Persistir expansión para los padres detectados
    parentsToExpand.forEach((id) => this.sidebarState?.setExpanded(id, true));
  }

  onExpandedChange(evt: { id: string; expanded: boolean }): void {
    if (!this.isBrowser || !evt?.id) return;
    // Modo acordeón: si se expande un grupo raíz, colapsar los demás
    if (evt.expanded) {
      const rootIds = this.menuItems
        .filter(
          (m) =>
            (Array.isArray(m?.hijos) && m.hijos.length) ||
            (Array.isArray((m as any)?.submenu) && (m as any).submenu.length)
        )
        .map((m) => String(m.id_menu))
        .filter(Boolean);
      const toCollapse = rootIds.filter((id) => id !== evt.id);
      if (toCollapse.length) this.sidebarState.clearExpansionFor(toCollapse);
    }
  }

  // Garantiza estructura válida: `id_menu` y `hijos` como array, elimina entradas inválidas
  // Cuando el backend no provee `id`, genera un id estable determinista
  private sanitizeMenuTree(
    items: any[]
  ): Array<{ id_menu: number; nombre: string; ruta?: string; icono?: string; hijos: any[] }> {
    const result: Array<{
      id_menu: number;
      nombre: string;
      ruta?: string;
      icono?: string;
      hijos: any[];
    }> = [];

    const usedIds = new Set<number>();

    const walk = (list: any[], parentPrefix: string | null): Array<any> => {
      const out: any[] = [];
      for (const it of list || []) {
        // Aceptar varias formas de id: id_menu, id, idMenu
        let id: number | null = null;
        const rawId = it?.id_menu ?? it?.id ?? it?.idMenu ?? it?.menuId;
        if (typeof rawId === 'number') id = rawId;
        else if (typeof rawId === 'string' && rawId.trim() !== '') {
          const parsed = Number(rawId);
          if (!Number.isNaN(parsed)) id = parsed;
        }

        // Nombre puede venir como 'nombre', 'title' o 'titulo'
        const nombre =
          typeof it?.nombre === 'string'
            ? it.nombre
            : typeof it?.title === 'string'
            ? it.title
            : typeof it?.titulo === 'string'
            ? it.titulo
            : '';

        // Ruta/icono: aceptar varias claves
        const ruta = it?.ruta ?? it?.url ?? it?.path ?? '';
        const icono = it?.icono ?? it?.icon ?? it?.iconName ?? '';

        // Si no hay id numérico válido, intentar extraer de 'key' o 'clave'
        if (id == null) {
          const alt = it?.key ?? it?.clave ?? null;
          if (typeof alt === 'number') id = alt;
          else if (typeof alt === 'string' && alt.trim() !== '') {
            const p = Number(alt);
            if (!Number.isNaN(p)) id = p;
          }
        }

        // Si aún no hay id, generar uno estable a partir de la jerarquía
        if (id == null) {
          const prefix = parentPrefix ? parentPrefix + '>' : '';
          const seed = `${prefix}${nombre}::${ruta}`;
          id = this.computeStableId(seed);
        }

        // Evitar colisiones: si ya existe, ajustar con contador
        let finalId = id;
        let tweak = 0;
        while (usedIds.has(finalId!)) {
          tweak += 1;
          finalId = Number(String(id) + String(tweak));
          if (!Number.isFinite(finalId)) finalId = id! + tweak;
        }
        usedIds.add(finalId!);

        const childrenRaw = Array.isArray(it?.hijos)
          ? it.hijos
          : Array.isArray(it?.children)
          ? it.children
          : Array.isArray(it?.submenu)
          ? it.submenu
          : [];

        const cleanChildren = walk(childrenRaw, `${parentPrefix ?? ''}/${nombre}`);

        out.push({
          id_menu: finalId!,
          nombre,
          ruta: ruta || undefined,
          icono: icono || undefined,
          hijos: cleanChildren,
        });
      }
      return out;
    };

    return walk(items || [], null);
  }

  // Genera un id numérico estable a partir de una cadena (hash simple, positivo)
  private computeStableId(input: string): number {
    let h = 2166136261 >>> 0; // FNV-1a 32-bit offset basis
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    // devolver un número entero no demasiado grande
    return Math.abs(h) || Date.now() % 1000000000;
  }
}
