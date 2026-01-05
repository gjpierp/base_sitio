import {
  Component,
  Input,
  HostListener,
  ElementRef,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ui-sidebar-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './ui-sidebar-item.component.html',
  styleUrls: ['./ui-sidebar-item.component.css'],
})
export class UiSidebarItemComponent implements OnInit, OnDestroy {
  @Input() item: any;
  @Input() level = 0;
  @Output() expandedChange = new EventEmitter<{ id: string; expanded: boolean }>();
  expanded = false;
  showFlyout = false;
  flyoutStyle: { [k: string]: string } = {};
  private themeSub?: Subscription;
  private openFlyoutSub?: Subscription;
  private expandedSub?: Subscription;
  constructor(
    private elRef: ElementRef,
    private themeService: ThemeService,
    private sidebarState: SidebarStateService,
    private router: Router
  ) {}

  /** Maneja clicks en enlaces del flyout cuando el sidebar está colapsado. */
  onFlyoutLinkClick(event: Event, child: any) {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch {}
    // Cerrar el flyout global y local
    try {
      const mine = this.itemId;
      if (mine) this.sidebarState.setOpenFlyout(null);
    } catch {}
    this.showFlyout = false;

    // Marcar sidebar como colapsado en localStorage (consistencia) y emitir evento para layout
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sidebarCollapsed', '1');
      }
      try {
        window.dispatchEvent(new CustomEvent('sidebar:collapse', { detail: { collapsed: true } }));
      } catch {}
    } catch {}

    // Navegar a la ruta si existe
    const ruta = child?.ruta || child?.url || null;
    if (ruta) {
      try {
        this.router.navigate([ruta]);
      } catch {
        try {
          (window as any).location.href = ruta;
        } catch {}
      }
    }
  }

  // Click manejado en el contenedor: hacer que toda la linea navegue o expanda
  onContainerClick(event: Event) {
    // Evitar que doble manejo ocurra si el click vino de elementos internos que ya manejan el evento
    const target = event.target as HTMLElement | null;
    const hasChildren = this.item?.hijos?.length || this.item?.submenu?.length;
    const ruta = this.item?.ruta || this.item?.url || null;

    // Detectar estado colapsado del sidebar lo antes posible: si está colapsado y el item tiene hijos
    // debemos abrir el flyout incluso si el click ocurrió sobre un <a> o <button> interno.
    const sidebarEl = this.elRef.nativeElement.closest('.ui-sidebar') as Element | null;
    const isCollapsed = !!(sidebarEl && sidebarEl.classList.contains('collapsed'));
    if (hasChildren && isCollapsed) {
      event.preventDefault();
      event.stopPropagation();
      this.showFlyout = !this.showFlyout;
      const mine = this.itemId;
      if (this.showFlyout) {
        if (mine) this.sidebarState.setOpenFlyout(mine);
        try {
          const sidebarEl2 = this.elRef.nativeElement.closest('.ui-sidebar') as HTMLElement | null;
          const sidebarRect = sidebarEl2
            ? sidebarEl2.getBoundingClientRect()
            : ({ right: 68 } as any);
          const itemRect = this.elRef.nativeElement.getBoundingClientRect();
          const top = Math.max(8, itemRect.top + itemRect.height / 2 - 20);
          const left = (sidebarRect.right || sidebarRect.width || 68) + 8;
          this.flyoutStyle = { position: 'fixed', top: `${top}px`, left: `${left}px` };
        } catch {
          this.flyoutStyle = { position: 'fixed', top: '0px', left: '68px' };
        }
      } else {
        try {
          const current = this.sidebarState.getOpenFlyout();
          if (current === mine) this.sidebarState.setOpenFlyout(null);
        } catch {}
      }
      return;
    }

    // Si el target es un link o dentro de un link, dejar que el comportamiento por defecto ocurra
    if (target) {
      const anchor = target.closest('a');
      const btn = target.closest('button');
      if (anchor || btn) {
        // allow anchor/button to handle
        return;
      }
    }

    if (hasChildren) {
      // no estamos en colapsado — alternar expansión (comportamiento por defecto)
      event.preventDefault();
      event.stopPropagation();
      this.toggleExpand();
      return;
    }

    // Si no tiene hijos pero tiene ruta, navegar programáticamente
    if (ruta) {
      event.preventDefault();
      event.stopPropagation();
      try {
        // soportar rutas relativas/absolutas
        this.router.navigate([ruta]);
      } catch {
        // fallback: usar location
        try {
          (window as any).location.href = ruta;
        } catch {}
      }
    }
  }

  ngOnInit(): void {
    const hasChildren = this.item?.hijos?.length || this.item?.submenu?.length;
    // Diagnóstico: verificar si la inyección del servicio está disponible
    if (!this.sidebarState) {
      console.warn(
        '[UiSidebarItemComponent] SidebarStateService injection is undefined. Possible HMR/build issue or provider missing.'
      );
    }
    // Limpiar si no hay sesión activa
    if (!this.sidebarState || !this.sidebarState.hasSession()) {
      this.clearExpansionState();
    }
    if (hasChildren) {
      const id = this.itemId;
      const saved = id ? this.sidebarState?.getExpanded(id) : null;
      if (saved !== null) this.expanded = !!saved;
    }
    // Suscribirse a cambios de tema para limpiar estado persistido
    this.themeSub = this.themeService.theme$.subscribe(() => {
      this.sidebarState.clearExpansionState();
      if (this.expanded) {
        this.expanded = false;
        this.persistExpanded();
      }
    });

    // Suscribirse a cambios globales de flyout para cerrar cuando otro se abra
    try {
      this.openFlyoutSub = this.sidebarState.openFlyout$?.subscribe((id) => {
        const mine = this.itemId;
        if (!mine) return;
        if (id !== mine && this.showFlyout) {
          this.showFlyout = false;
        }
      });
    } catch {}

    // Suscribirse a notificaciones de expansión para colapsar cuando otro elemento sea cerrado
    try {
      this.expandedSub = this.sidebarState.expanded$?.subscribe((evt) => {
        if (!evt || !evt.id) return;
        const mine = this.itemId;
        if (!mine) return;
        // Si recibimos una notificación de colapso para nosotros, aplicarla
        if (evt.id === mine && evt.expanded === false && this.expanded) {
          this.expanded = false;
          this.persistExpanded();
        }
      });
    } catch {}
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    this.openFlyoutSub?.unsubscribe();
    this.expandedSub?.unsubscribe();
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    this.persistExpanded();
    const id = this.itemId;
    if (id) this.expandedChange.emit({ id, expanded: this.expanded });
    if (!this.expanded) {
      // Al colapsar, limpiar expansión de todos los descendientes para consistencia
      const descendants = this.collectDescendantIds(this.getChildItems());
      if (descendants.length) {
        this.sidebarState?.clearExpansionFor(descendants);
      }
    }
  }

  onItemClick(event: Event) {
    const hasChildren = this.item?.hijos?.length || this.item?.submenu?.length;
    if (hasChildren) {
      // Si el sidebar está colapsado, mostrar flyout con hijos sin expandir el menu
      const sidebarEl = this.elRef.nativeElement.closest('.ui-sidebar') as Element | null;
      const isCollapsed = !!(sidebarEl && sidebarEl.classList.contains('collapsed'));
      if (isCollapsed) {
        event.preventDefault();
        event.stopPropagation();
        this.showFlyout = !this.showFlyout;
        const mine = this.itemId;
        if (this.showFlyout) {
          if (mine) this.sidebarState.setOpenFlyout(mine);
          // calcular posicion fija del flyout para alinearlo con la linea del item
          try {
            const sidebarEl = this.elRef.nativeElement.closest('.ui-sidebar') as HTMLElement | null;
            const sidebarRect = sidebarEl
              ? sidebarEl.getBoundingClientRect()
              : ({ right: 68 } as any);
            const itemRect = this.elRef.nativeElement.getBoundingClientRect();
            // Ajustar top para centrar en la linea del icono
            const top = Math.max(8, itemRect.top + itemRect.height / 2 - 20);
            const left = (sidebarRect.right || sidebarRect.width || 68) + 8;
            this.flyoutStyle = { position: 'fixed', top: `${top}px`, left: `${left}px` };
          } catch {
            this.flyoutStyle = { position: 'fixed', top: '0px', left: '68px' };
          }
        } else {
          try {
            const current = this.sidebarState.getOpenFlyout();
            if (current === mine) this.sidebarState.setOpenFlyout(null);
          } catch {}
        }
        return;
      }
      // Evita navegación si hay ruta/url y expande/colapsa normalmente
      event.preventDefault();
      event.stopPropagation();
      this.toggleExpand();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Colapsa si se hace click fuera del componente
    const target = event.target as Node | null;
    if (!target) return;
    const clickedInside = this.elRef.nativeElement.contains(target);
    if (!clickedInside) {
      // Sólo colapsar/ocultar cuando el sidebar está en modo "collapsed"
      try {
        const sidebarEl = this.elRef.nativeElement.closest('.ui-sidebar') as HTMLElement | null;
        const isCollapsed = !!(sidebarEl && sidebarEl.classList.contains('collapsed'));
        if (!isCollapsed) return; // mantener abierto cuando el sidebar está desplegado
      } catch {
        // si hay error al detectar, no colapsar para evitar UX inesperada
        return;
      }

      if (this.expanded) {
        this.expanded = false;
        this.persistExpanded();
      }
      if (this.showFlyout) {
        // si cerramos el flyout local, limpiar estado global si corresponde
        try {
          const mine = this.itemId;
          const current = this.sidebarState.getOpenFlyout();
          if (current === mine) this.sidebarState.setOpenFlyout(null);
        } catch {}
        this.showFlyout = false;
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.expanded) {
      this.expanded = false;
      this.persistExpanded();
    }
  }

  trackById(index: number, item: any) {
    return item.id_menu;
  }

  get childrenId(): string | null {
    const base = this.item?.id_menu ?? null;
    if (base == null) return null;
    return `children-${base}`;
  }

  private get itemId(): string | null {
    const base = this.item?.id_menu ?? null;
    if (base == null) return null;
    return String(base);
  }

  private persistExpanded(): void {
    const id = this.itemId;
    if (!id) return;
    this.sidebarState?.setExpanded(id, this.expanded);
  }

  private clearExpansionState(): void {
    this.sidebarState?.clearExpansionState();
  }

  getChildItems(): any[] {
    const hijos = Array.isArray(this.item?.hijos) ? this.item.hijos : [];
    const submenu = Array.isArray(this.item?.submenu) ? this.item.submenu : [];
    return hijos.length ? hijos : submenu;
  }

  private collectDescendantIds(items: any[]): string[] {
    const ids: string[] = [];
    for (const it of items) {
      const idVal = it?.id_menu;
      if (idVal != null) ids.push(String(idVal));
      const kids = Array.isArray(it?.hijos)
        ? it.hijos
        : Array.isArray(it?.submenu)
        ? it.submenu
        : [];
      if (kids.length) ids.push(...this.collectDescendantIds(kids));
    }
    return ids;
  }

  onChildExpandedChange(evt: { id: string; expanded: boolean }): void {
    if (!evt?.id) return;
    if (evt.expanded) {
      // Modo acordeón a este nivel: colapsar hermanos del hijo expandido
      const siblings = this.getChildItems()
        .filter((c) => c?.hijos?.length || c?.submenu?.length)
        .map((c) => c?.id_menu)
        .filter((id) => id != null)
        .map((id) => String(id));
      const toCollapse = siblings.filter((id) => id !== evt.id);
      if (toCollapse.length) this.sidebarState?.clearExpansionFor(toCollapse);
    }
  }
}
