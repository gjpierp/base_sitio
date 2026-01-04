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
      try {
        console.debug('[setupList] response for', endpoint, res);
      } catch {}
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
      try {
        console.error('[setupList] error loading', endpoint, err);
      } catch {}
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
          const base =
            String(routePath || '')
              .replace(/^\//, '')
              .split('/')[0] || '';
          if (base) {
            // build API endpoint name (use underscore for API routes)
            const apiEndpoint = String(base).replace(/-/g, '_');
            // fields left undefined so modal will build from detail dynamically
            // call the generic modal helper in background (non-blocking)
            try {
              if (typeof abrirEditarModalGeneric === 'function') {
                // call async helper but don't await to keep this function sync
                void abrirEditarModalGeneric(thisRef, row, apiEndpoint, [], idKeys).catch(() => {});
                return true;
              }
            } catch {}
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

    // Helper: prettify label
    const prettify = (k: string) =>
      String(k)
        .replace(/^id_/, '')
        .replace(/_id$/, '')
        .replace(/_/g, ' ')
        .replace(/\b(\w)/g, (s: string) => s.toUpperCase());

    // Helper: build candidate endpoints from a base key (no id)
    const buildCandidates = (base: string) => {
      const kebab = base.replace(/_/g, '-');
      const words = base.split('_').filter(Boolean);
      const pluralWordsUnderscore = words.map((w) => (w.endsWith('s') ? w : w + 's')).join('_');
      const pluralWordsKebab = words.map((w) => (w.endsWith('s') ? w : w + 's')).join('-');
      const candidates = new Set<string>([]);
      candidates.add(base);
      candidates.add(base + 's');
      candidates.add(kebab);
      candidates.add(kebab + 's');
      candidates.add(pluralWordsUnderscore);
      candidates.add(pluralWordsKebab);
      // also try underscored singular with prefix 'tipos_' as some endpoints use that form
      if (words.length > 1) candidates.add('tipos_' + words.slice(1).join('_'));
      return Array.from(candidates).filter(Boolean);
    };

    // Helper: try to resolve options for a given key by probing candidate endpoints
    const resolveOptionsForKey = async (key: string) => {
      const base = String(key).replace(/^id_/, '').replace(/_id$/, '');
      const candidates = buildCandidates(base);
      for (const cand of candidates) {
        try {
          const resp: any = await firstValueFrom(
            thisRef.api.getPaginated(cand, { desde: 0 }) as any
          );
          const rows = resp?.data || resp || [];
          if (Array.isArray(rows) && rows.length > 0) {
            // choose valueKey and labelKey heuristically
            const sample = rows[0] || {};
            const valueKey = [
              'id',
              `id_${base}`,
              Object.keys(sample).find((k) => /id$/i.test(k)) || 'id',
            ][0];
            const labelKey =
              (['nombre', 'title', 'titulo', 'dominio', 'label'] as string[]).find(
                (k) => k in sample
              ) ||
              Object.keys(sample).find((k) => /name|nombre|title|titulo|label|dominio/i.test(k)) ||
              valueKey;
            return (rows || []).map((r: any) => ({
              value: String(r[valueKey] ?? r.id ?? ''),
              label: String(r[labelKey] ?? r[valueKey] ?? r.id ?? ''),
            }));
          }
        } catch {}
      }
      return [];
    };

    // If no fields provided, build them from `detail` automatically
    let builtFields: any[] = [];
    try {
      if ((!fields || fields.length === 0) && detail && typeof detail === 'object') {
        for (const k of Object.keys(detail)) {
          // skip primary id and timestamps
          if (/^id$|^ID$/.test(k)) continue;
          if (/fecha|created_at|updated_at|timestamp/i.test(k)) continue;
          const val = detail[k];
          if (/_id$/.test(k) || /^id_/.test(k)) {
            builtFields.push({
              key: k,
              label: prettify(k),
              type: 'select',
              options: {
                endpointCandidates: buildCandidates(k.replace(/^id_/, '').replace(/_id$/, '')),
              },
            });
          } else if (typeof val === 'boolean') {
            builtFields.push({
              key: k,
              label: prettify(k),
              type: 'select',
              options: [
                { value: 'true', label: 'Sí' },
                { value: 'false', label: 'No' },
              ],
            });
          } else if (typeof val === 'number') {
            builtFields.push({ key: k, label: prettify(k), type: 'number' });
          } else {
            builtFields.push({ key: k, label: prettify(k), type: 'text' });
          }
        }
        fields = builtFields;
      }
    } catch {}

    // resolve options for fields that declare an options.endpoint or options.endpointCandidates
    const resolvedFields: any[] = [];
    for (const f of fields) {
      const ff: any = { ...f };
      // If options is an object with endpoint, keep legacy behavior
      if (ff.options && typeof ff.options === 'object' && ff.options.endpoint) {
        try {
          const optResp: any = await firstValueFrom(
            thisRef.api.getPaginated(ff.options.endpoint, { desde: 0 }) as any
          );
          const rows = optResp?.data || optResp?.[ff.options.endpoint] || optResp || [];
          ff.options = (Array.isArray(rows) ? rows : []).map((r: any) => ({
            value: String(r[ff.options.valueKey ?? 'id'] ?? r.id ?? ''),
            label:
              r[ff.options.labelKey ?? 'nombre'] ??
              String(r[ff.options.valueKey ?? 'id'] ?? r.id ?? ''),
          }));
        } catch {
          ff.options = [];
        }
      } else if (
        ff.options &&
        ff.options.endpointCandidates &&
        Array.isArray(ff.options.endpointCandidates)
      ) {
        // Try candidates in order
        try {
          let resolved: any[] = [];
          for (const cand of ff.options.endpointCandidates) {
            try {
              const optResp: any = await firstValueFrom(
                thisRef.api.getPaginated(cand, { desde: 0 }) as any
              );
              const rows = optResp?.data || optResp || [];
              if (Array.isArray(rows) && rows.length > 0) {
                const sample = rows[0] || {};
                const valueKey =
                  (Object.keys(sample).find((k) => /id$/i.test(k)) as string) || 'id';
                const labelKey =
                  (['nombre', 'title', 'titulo', 'dominio', 'label'] as string[]).find(
                    (k) => k in sample
                  ) ||
                  Object.keys(sample).find((k) =>
                    /name|nombre|title|titulo|label|dominio/i.test(k)
                  ) ||
                  valueKey;
                resolved = (rows || []).map((r: any) => ({
                  value: String(r[valueKey] ?? r.id ?? ''),
                  label: String(r[labelKey] ?? r[valueKey] ?? r.id ?? ''),
                }));
                break;
              }
            } catch {}
          }
          ff.options = resolved;
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

/**
 * Abre un modal de creación genérico para un endpoint.
 * Construye campos básicos si no se proveen y abre el modal en el componente destino.
 */
export async function abrirCrearModalGeneric(
  thisRef: any,
  endpoint: string,
  fields: Array<any> = []
) {
  try {
    // build default fields if none
    if (!Array.isArray(fields) || fields.length === 0) {
      fields = [
        { key: 'nombre', label: 'Nombre', type: 'text', value: '' },
        {
          key: 'activo',
          label: 'Activo',
          type: 'select',
          options: [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ],
          value: 'true',
        },
      ];
    }

    thisRef.modalTitle = `Crear ${String(endpoint).replace(/[-_]/g, ' ')}`;
    thisRef.modalFields = fields;
    thisRef.modalValues = {};
    for (const f of fields) thisRef.modalValues[f.key] = f.value ?? '';
    thisRef.modalEditingId = null;
    thisRef.modalDeleteMode = false;
    thisRef.modalOpen = true;
    try {
      thisRef.cdr?.detectChanges();
    } catch {}
    return true;
  } catch {
    return false;
  }
}

export async function onModalConfirmGeneric(thisRef: any, endpoint: string) {
  try {
    if (thisRef.modalDeleteMode) {
      // deletion was handled elsewhere; keep simple
      const id = thisRef.modalEditingId ?? null;
      if (!id) return false;
      try {
        const { default: Swal } = await import('sweetalert2');
        await firstValueFrom(thisRef.api.delete(`${endpoint}/${id}`));
        await Swal.fire('Eliminado', 'Elemento eliminado', 'success');
        thisRef.modalOpen = false;
        thisRef.modalDeleteMode = false;
        thisRef.modalEditingId = null;
        try {
          if (typeof thisRef.load === 'function') await thisRef.load();
          if (typeof thisRef.refrescar === 'function') await thisRef.refrescar();
          if (typeof thisRef.cargarDatosAsync === 'function') await thisRef.cargarDatosAsync();
        } catch {}
        return true;
      } catch (err) {
        try {
          const { default: Swal } = await import('sweetalert2');
          await Swal.fire('Error', (err as any)?.error?.msg || 'No se pudo eliminar', 'error');
        } catch {}
        return false;
      }
    }

    // create
    try {
      const payload: any = {};
      for (const k of Object.keys(thisRef.modalValues || {})) payload[k] = thisRef.modalValues[k];
      const { default: Swal } = await import('sweetalert2');
      await firstValueFrom(thisRef.api.post(endpoint, payload) as any);
      await Swal.fire('Guardado', 'Elemento creado', 'success');
      thisRef.modalOpen = false;
      try {
        if (typeof thisRef.load === 'function') await thisRef.load();
        if (typeof thisRef.refrescar === 'function') await thisRef.refrescar();
        if (typeof thisRef.cargarDatosAsync === 'function') await thisRef.cargarDatosAsync();
      } catch {}
      return true;
    } catch (err) {
      try {
        const { default: Swal } = await import('sweetalert2');
        await Swal.fire('Error', (err as any)?.error?.msg || 'No se pudo crear', 'error');
      } catch {}
      return false;
    }
  } catch {
    return false;
  }
}

export function onModalClosedGeneric(thisRef: any) {
  try {
    thisRef.modalOpen = false;
    thisRef.modalFields = [];
    thisRef.modalValues = {};
    thisRef.modalEditingId = null;
    thisRef.modalDeleteMode = false;
    try {
      thisRef.cdr?.detectChanges();
    } catch {}
  } catch {}
}
