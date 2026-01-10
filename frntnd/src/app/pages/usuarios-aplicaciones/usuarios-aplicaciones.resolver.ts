import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const usuariosAplicacionesResolver: ResolveFn<{
  estados: any[];
  usuariosAplicaciones: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const usuariosAplicaciones$ = api
    .get<any>('usuarios_aplicaciones', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ usuarios_aplicaciones: [], total: 0 })));
  return forkJoin([estados$, usuariosAplicaciones$]).pipe(
    map(([estadosRes, usuariosAplicacionesRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const usuariosAplicaciones = Array.isArray(
        (usuariosAplicacionesRes as any)?.usuarios_aplicaciones
      )
        ? (usuariosAplicacionesRes as any).usuarios_aplicaciones
        : Array.isArray(usuariosAplicacionesRes)
        ? (usuariosAplicacionesRes as any)
        : [];
      const total =
        Number((usuariosAplicacionesRes as any)?.total) || usuariosAplicaciones.length || 0;
      return { estados, usuariosAplicaciones, total };
    })
  );
};
