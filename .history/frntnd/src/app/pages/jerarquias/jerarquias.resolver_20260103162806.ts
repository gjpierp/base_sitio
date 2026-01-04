import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const jerarquiasResolver: ResolveFn<{
  jerarquias: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const jerarquias$ = api
    .get<any>('jerarquias', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ jerarquias: [], total: 0 })));
  return forkJoin([jerarquias$]).pipe(
    map(([resp]) => {
      const jerarquias = Array.isArray((resp as any)?.jerarquias)
        ? (resp as any).jerarquias
        : Array.isArray(resp)
        ? (resp as any)
        : [];
      const total = Number((resp as any)?.total) || jerarquias.length || 0;
      return { jerarquias, total };
    })
  );
};
