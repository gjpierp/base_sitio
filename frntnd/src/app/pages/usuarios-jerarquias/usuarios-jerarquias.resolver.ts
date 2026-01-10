import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const usuariosJerarquiasResolver: ResolveFn<{
  estados: any[];
  usuariosJerarquias: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const usuariosJerarquias$ = api
    .get<any>('usuarios_jerarquias', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ usuarios_jerarquias: [], total: 0 })));
  return forkJoin([estados$, usuariosJerarquias$]).pipe(
    map(([estadosRes, usuariosJerarquiasRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const usuariosJerarquias = Array.isArray((usuariosJerarquiasRes as any)?.usuarios_jerarquias)
        ? (usuariosJerarquiasRes as any).usuarios_jerarquias
        : Array.isArray(usuariosJerarquiasRes)
        ? (usuariosJerarquiasRes as any)
        : [];
      const total = Number((usuariosJerarquiasRes as any)?.total) || usuariosJerarquias.length || 0;
      return { estados, usuariosJerarquias, total };
    })
  );
};
