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
        // Try to open modal editor generically using abrirEditarModalGeneric
        try {
          const base = String(routePath || '').replace(/^\//, '').split('/')[0] || '';
          if (base) {
            // fields left undefined so modal will build from detail dynamically
            // call the generic modal helper
            // import dynamically to avoid circular deps
            // @ts-ignore
            const { abrirEditarModalGeneric } = await import('./page-utils');
            // If the helper is defined in this module (we added it), call it
            if (typeof abrirEditarModalGeneric === 'function') {
              // Note: pass minimal field defs so modal can auto-resolve
              await abrirEditarModalGeneric(thisRef, row, base, [], idKeys);
              return true;
            }
          }
        } catch {}

        // fallback: navigate to routePath with query id
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

/**
 * Abre un modal editable para recursos genéricos usando `swalForm`.
 * - `endpoint`: base API (p.ej. 'sitios' o 'aplicaciones_sitio')
 * - `fields`: array de definiciones { key,label,type?, options? }
 *    options can be an array [{value,label}] or an object { endpoint, valueKey, labelKey }
 */
export async function abrirEditarModalGeneric(
  thisRef: any,
  row: any,
  endpoint: string,
  fields: Array<any>,
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
    if (id === null || id === undefined) {
      // fallback to navigation behavior
      try {
        return abrirEditarGeneric(thisRef, row, `/${endpoint}/crear`, idKeys);
      } catch {
        return false;
      }
    }

    // lazy import swalForm to avoid circular deps in some builds
    const { swalForm } = await import('../shared/swal-form.util');

    // fetch detail
    let detail: any = null;
    try {
      const resp: any = await firstValueFrom(thisRef.api.get(`${endpoint}/${id}`));
      detail = resp?.data ?? resp?.[endpoint?.slice?.(0, -1)] ?? resp ?? null;
    } catch {
      detail = null;
    }

    // resolve options for fields that declare an options.endpoint
    const resolvedFields: any[] = [];
    for (const f of fields) {
      const ff: any = { ...f };
      if (ff.options && typeof ff.options === 'object' && ff.options.endpoint) {
        try {
          const optResp: any = await firstValueFrom(
            thisRef.api.getPaginated(ff.options.endpoint, { desde: 0 }) as any
          );
          const rows = optResp?.data || optResp?.[ff.options.endpoint] || optResp || [];
          ff.options = (Array.isArray(rows) ? rows : []).map((r: any) => ({
            value: String(
              r[ff.options.valueKey ?? 'id'] ??
                r[ff.options.valueKey ?? 'id_' + ff.options.endpoint?.replace(/s$/, '')] ??
                ''
            ),
            label:
              r[ff.options.labelKey ?? 'nombre'] ?? String(r[ff.options.valueKey ?? 'id'] ?? ''),
          }));
        } catch {
          ff.options = [];
        }
      }
      // set current value from detail
      try {
        ff.value = detail && detail[ff.key] != null ? detail[ff.key] : ff.value ?? '';
        if (ff.type === 'select' && ff.value != null) ff.value = String(ff.value);
      } catch {}
      resolvedFields.push(ff);
    }

    const title =
      detail && (detail.nombre || detail.title || detail.titulo)
        ? `Editar: ${detail.nombre ?? detail.title ?? detail.titulo}`
        : `Editar ${endpoint}`;
    const result = await swalForm(title, resolvedFields as any, { width: '720px' });
    if (!result) return false;

    // build payload and normalize common types
    const payload: any = {};
    for (const f of fields) {
      if (result[f.key] !== undefined) payload[f.key] = result[f.key];
    }
    // convert *_id to number
    for (const k of Object.keys(payload)) {
      if (/_id$/.test(k) && payload[k] !== '' && payload[k] != null) {
        const n = Number(payload[k]);
        payload[k] = Number.isNaN(n) ? payload[k] : n;
      }
      // convert 'activo' like fields to boolean
      if (/^(activo|enabled|active)$/i.test(k)) {
        if (typeof payload[k] === 'string')
          payload[k] = payload[k] === 'true' || payload[k] === '1';
        else payload[k] = !!payload[k];
      }
    }

    // send update
    try {
      await firstValueFrom(thisRef.api.put(`${endpoint}/${id}`, payload) as any);
      try {
        await (
          await import('sweetalert2')
        ).default.fire('Guardado', 'Elementos actualizado', 'success');
      } catch {}
      // try refresh common load methods
      try {
        if (typeof thisRef.load === 'function') await thisRef.load();
      } catch {}
      try {
        if (typeof thisRef.refrescar === 'function') await thisRef.refrescar();
      } catch {}
      try {
        if (typeof thisRef.cargarDatosAsync === 'function') await thisRef.cargarDatosAsync();
      } catch {}
      return true;
    } catch (err) {
      try {
        await (
          await import('sweetalert2')
        ).default.fire('Error', (err as any)?.error?.msg || 'No se pudo actualizar', 'error');
      } catch {}
      return false;
    }
  } catch {
    return false;
  }
}
