import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';

export const menusResolver: ResolveFn<any> = async (route) => {
  const api = inject(ApiService);
  try {
    const res: any = await new Promise((resolve, reject) => {
      const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
      const sortDir = (route?.data as any)?.sortDir ?? 'asc';
      api.get<any>('menus', { desde: 0, limite: 10, sortKey, sortDir }).subscribe({
        next: resolve,
        error: reject,
      });
    });
    const rows = Array.isArray(res?.menus) ? res.menus : Array.isArray(res) ? res : [];
    const total = Number(res?.total) || rows.length;
    return { menus: rows, total };
  } catch {
    return { menus: [], total: 0 };
  }
};
