import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableConfigService {
  readonly defaultPageSize = 10;
  readonly defaultPageSizeOptions = [5, 10, 25, 50];

  // Columnas visibles por defecto por tabla (tableId)
  // Nota: se intersectan con columnas disponibles en cada vista
  private readonly defaultVisibleByTableId: Record<string, string[]> = {
    usuarios: ['nombre', 'correo_electronico'],
    roles: ['nombre', 'descripcion'],
    permisos: ['codigo', 'descripcion'],
    menus: ['nombre', 'ruta', 'icono'],
  };

  getDefaultVisible(tableId: string, availableKeys: string[]): string[] {
    const defaults = this.defaultVisibleByTableId[tableId];
    if (!defaults || defaults.length === 0) return availableKeys;
    const set = new Set(availableKeys);
    const filtered = defaults.filter((k) => set.has(k));
    return filtered.length > 0 ? filtered : availableKeys;
  }
}
