import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const sitiosResolver: ResolveFn<{
  sitios: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  return api
    .get<any>('sitios', { desde: 0, limite: 10, sortKey, sortDir })
    .pipe(
      catchError(() => of({ sitios: [], total: 0 })),
      map((resp: any) => {
        const sitios = Array.isArray(resp?.sitios)
          ? resp.sitios
          : Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data)
          ? resp.data
          : [];
        const total = Number(resp?.total) || sitios.length || 0;
        return { sitios, total };
      })
    );
};
