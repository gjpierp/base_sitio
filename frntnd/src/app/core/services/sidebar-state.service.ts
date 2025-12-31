import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private readonly prefix = 'sidebar-expanded-';
  // Identificador del flyout actualmente abierto (en modo collapsed)
  private openFlyoutSubject = new BehaviorSubject<string | null>(null);
  public openFlyout$ = this.openFlyoutSubject.asObservable();
  // Notifica cambios puntuales de expansión/colapso para ids concretos
  private expandedSubject = new BehaviorSubject<{ id: string; expanded: boolean } | null>(null);
  public expanded$ = this.expandedSubject.asObservable();

  clearExpansionState(): void {
    if (!this.storageAvailable()) return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  getExpanded(id: string, tag?: string): boolean | null {
    if (!this.storageAvailable()) return null;
    const val = localStorage.getItem(this.computeKey(id, tag));
    if (val === '1') return true;
    if (val === '0') return false;
    return null;
  }

  setExpanded(id: string, expanded: boolean, tag?: string): void {
    if (!this.storageAvailable()) return;
    localStorage.setItem(this.computeKey(id, tag), expanded ? '1' : '0');
  }

  /**
   * Limpia el estado por sección usando una etiqueta opcional en las claves.
   * Elimina todas las entradas que comiencen con `prefix + tag + '-'`.
   */
  clearExpansionByTag(tag: string): void {
    if (!this.storageAvailable()) return;
    const tagPrefix = `${this.prefix}${tag}-`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(tagPrefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  /**
   * Limpia el estado para un conjunto de IDs específicos (opcionalmente filtrado por `tag`).
   */
  clearExpansionFor(ids: Array<string | number>, tag?: string): void {
    if (!this.storageAvailable()) return;
    ids.forEach((id) => localStorage.removeItem(this.computeKey(String(id), tag)));
    // Notificar a los componentes que esos ids fueron colapsados
    try {
      for (const id of ids) {
        this.expandedSubject.next({ id: String(id), expanded: false });
      }
    } catch {}
  }

  /**
   * Establece el id del flyout actualmente abierto. Usar `null` para cerrarlo.
   */
  setOpenFlyout(id: string | null) {
    try {
      this.openFlyoutSubject.next(id);
    } catch {}
  }

  /** Emitir un cambio puntual de expansión para que los componentes se sincronicen. */
  notifyExpandedChange(id: string, expanded: boolean) {
    try {
      this.expandedSubject.next({ id, expanded });
    } catch {}
  }

  /** Devuelve el id del flyout actualmente abierto (puede ser null). */
  getOpenFlyout(): string | null {
    try {
      return this.openFlyoutSubject.getValue();
    } catch {
      return null;
    }
  }

  private storageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  /**
   * Indica si existe una sesión activa (token presente), con guardas SSR.
   */
  hasSession(): boolean {
    try {
      // Aceptar ambos nombres de clave: 'x-token' (principal) o 'token' (legacy/SSR)
      const hasX = !!localStorage.getItem('x-token');
      const hasLegacy = !!localStorage.getItem('token');
      return typeof window !== 'undefined' && !!window.localStorage && (hasX || hasLegacy);
    } catch {
      return false;
    }
  }

  /**
   * Construye la clave, soportando una etiqueta de sección opcional sin romper claves existentes.
   */
  private computeKey(id: string, tag?: string): string {
    return `${this.prefix}${tag ? `${tag}-` : ''}${id}`;
  }
}
