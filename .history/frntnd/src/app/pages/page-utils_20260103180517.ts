import { firstValueFrom } from 'rxjs';

export function setupList(thisRef: any, endpoint: string, preKey: string, mapFn: (r: any) => any) {
  const pre = ((thisRef.route?.snapshot?.data as any) || {})['pre'];
  if (pre && Array.isArray(pre[preKey])) {
    const rows = pre[preKey];
    thisRef.data = rows.map(mapFn);
    thisRef.total = Number(pre.total) || thisRef.data.length || 0;
    thisRef.datosListos = true;
    try {
      thisRef.cdr?.detectChanges();
    } catch {}
    return;
  }
  // Fallback: cargar desde API
  try {
    thisRef.loading = true;
  } catch {}
  thisRef.api.getPaginated(endpoint, { desde: 0 }).subscribe({
    next: (res: any) => {
      const rows = res?.data || [];
      thisRef.data = rows.map(mapFn);
      thisRef.total = Number(res?.total) || thisRef.data.length || 0;
      thisRef.loading = false;
      thisRef.datosListos = true;
      try {
        thisRef.cdr?.detectChanges();
      } catch {}
    },
    error: (err: any) => {
      thisRef.error = (err as any)?.error?.msg || `Error al cargar ${endpoint}`;
      thisRef.data = [];
      thisRef.loading = false;
      thisRef.datosListos = false;
    },
  });
}

export function onPageChangeGeneric(
  thisRef: any,
  evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  },
  endpoint: string,
  mapFn: (r: any) => any
) {
  const desde = (evt.page - 1) * evt.pageSize;
  const limite = evt.pageSize;
  const term = (evt.term || '').trim();
  const sortKey = (evt.sortKey || '').trim();
  const sortDir = (evt.sortDir || 'asc').toLowerCase() as 'asc' | 'desc';
  thisRef.loading = true;
  thisRef.datosListos = false;
  try {
    thisRef.cdr?.detectChanges();
  } catch {}
  if (term) {
    thisRef.api.get(`todo/coleccion/${endpoint}/${encodeURIComponent(term)}`).subscribe({
      next: (resp: any) => {
        const list = Array.isArray(resp?.resultados)
          ? resp.resultados
          : Array.isArray(resp)
          ? resp
          : [];
        const mapped = list.map(mapFn);
        thisRef.total = mapped.length;
        thisRef.data = mapped.slice(desde, desde + limite);
        thisRef.loading = false;
        thisRef.datosListos = true;
        try {
          thisRef.cdr?.detectChanges();
        } catch {}
      },
      error: () => {
        thisRef.error = `No se pudo filtrar ${endpoint}`;
        thisRef.loading = false;
      },
    });
  } else {
    thisRef.api.getPaginated(endpoint, { desde, limite, sortKey, sortDir }).subscribe({
      next: (res: any) => {
        const rows = res?.data || [];
        const mapped = rows.map(mapFn);
        thisRef.data = mapped;
        thisRef.total = Number(res?.total) || mapped.length;
        thisRef.loading = false;
        thisRef.datosListos = true;
        try {
          thisRef.cdr?.detectChanges();
        } catch {}
      },
      error: () => {
        thisRef.error = `No se pudieron cargar ${endpoint}`;
        thisRef.loading = false;
      },
    });
  }
}

export function abrirEditarGeneric(
  thisRef: any,
  row: any,
  routePath: string,
  idKeys: string[] = ['id', 'id_menu', 'ID']
) {
  try {
    let id: any = null;
    for (const k of idKeys) {
      if (row?.[k] != null) {
        id = row[k];
        break;
      }
    }
    // Allow id === 0 (falsy) but not null/undefined
    if (id !== null && id !== undefined) {
      try {
        // If routePath is a full path string, navigate with absolute path
        if (String(routePath).startsWith('/')) {
          thisRef.router.navigate([routePath], { queryParams: { id } });
        } else {
          thisRef.router.navigate([routePath], { queryParams: { id } });
        }
      } catch {}
      return true;
    }
  } catch {}
  return false;
}
