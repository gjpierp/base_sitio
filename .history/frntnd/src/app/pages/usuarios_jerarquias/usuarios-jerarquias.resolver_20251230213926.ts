import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const usuariosJerarquiasResolver: ResolveFn<{
  usuarios: any[];
  jerarquias: any[];
  usuariosJerarquias: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const usuarios$ = api.get<any>('usuarios').pipe(catchError(() => of([])));
  const jer$ = api.get<any>('jerarquias').pipe(catchError(() => of([])));
  const list$ = api
    .get<any>('usuarios_jerarquias', { desde: 0, limite: 10 })
    .pipe(catchError(() => of({ usuarios_jerarquias: [], total: 0 })));

  return forkJoin([usuarios$, jer$, list$]).pipe(
    map(([uRes, jRes, listRes]) => {
      const usuarios = Array.isArray(uRes)
        ? uRes
        : Array.isArray((uRes as any)?.usuarios)
        ? (uRes as any).usuarios
        : Array.isArray((uRes as any)?.data)
        ? (uRes as any).data
        : [];
      const jerarquias = Array.isArray(jRes)
        ? jRes
        : Array.isArray((jRes as any)?.jerarquias)
        ? (jRes as any).jerarquias
        : Array.isArray((jRes as any)?.data)
        ? (jRes as any).data
        : [];
      const usuariosJerarquias = Array.isArray(listRes?.usuarios_jerarquias)
        ? listRes.usuarios_jerarquias
        : Array.isArray(listRes)
        ? listRes
        : [];
      const total = Number(listRes?.total) || usuariosJerarquias.length || 0;
      return { usuarios, jerarquias, usuariosJerarquias, total };
    })
  );
};
