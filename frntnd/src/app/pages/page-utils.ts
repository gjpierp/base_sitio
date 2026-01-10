import { firstValueFrom } from 'rxjs';

export function setupList(thisRef: any, endpoint: string, preKey: string, mapFn: (r: any) => any) {
  // Solo logs principales en el flujo de API

  const pre = ((thisRef.route?.snapshot?.data as any) || {})['pre'];
  if (pre && Array.isArray(pre[preKey])) {
    const rows = pre[preKey];
    thisRef.data = rows.map(mapFn);
    thisRef.total = Number(pre.total) || thisRef.data.length || 0;
    thisRef.datosListos = true;
    console.log(`[setupList] loaded ${endpoint} from preloaded data, total: ${thisRef.total}`);
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
      } catch {}
      const rows = res?.data || [];
      thisRef.data = rows.map(mapFn);
      thisRef.total = Number(res?.total) || thisRef.data.length || 0;
      thisRef.loading = false;
      thisRef.datosListos = true;
      try {
        thisRef.cdr?.detectChanges();
      } catch (e) {}
    },
    error: (err: any) => {
      try {
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
          thisRef.cdr?.detectChanges();
        } catch {}
        try {
          if (typeof thisRef.load === 'function') await thisRef.load();
          if (typeof thisRef.refrescar === 'function') await thisRef.refrescar();
          if (typeof thisRef.cargarDatosAsync === 'function') await thisRef.cargarDatosAsync();
        } catch {}
        return true;
      } catch (err) {
        try {
        } catch {}
        try {
          const { default: Swal } = await import('sweetalert2');
          const msg = (err as any)?.error?.msg || (err as any)?.message || JSON.stringify(err);
          await Swal.fire('Error', msg || 'No se pudo eliminar', 'error');
        } catch {}
        return false;
      }
    }

    // create or update
    thisRef.modalSaving = true;
    // Build payload with basic validation and type conversion
    const payload: any = {};
    const fields = Array.isArray(thisRef.modalFields) ? thisRef.modalFields : [];
    // Lista de campos calculados que NO deben enviarse al backend
    const camposCalculados = ['nombre_menu_padre', 'nombre_aplicacion', 'nombre_estado'];
    for (const f of fields) {
      const k = f.key;
      if (camposCalculados.includes(k)) continue; // Omitir campos calculados
      let v = (thisRef.modalValues || {})[k];
      if (typeof v === 'string') v = v.trim();
      // Required check (only enforced on create), ignorando 'configuracion_por_defecto'
      const ignoreRequired = ['configuracion_por_defecto'];
      if (
        !f.hidden &&
        !thisRef.modalEditingId &&
        (v === '' || v === null || v === undefined) &&
        !ignoreRequired.includes(k)
      ) {
        // Si el campo está en la lista de ignorados, no validar como requerido
        if (ignoreRequired.includes(k)) {
          payload[k] = v;
          continue;
        }
        try {
          const { default: Swal } = await import('sweetalert2');
          thisRef.modalOpen = false;
          try {
            thisRef.cdr?.detectChanges();
          } catch {}
          await Swal.fire('Error', `El campo "${f.label}" es requerido.`, 'error');
        } catch {}
        thisRef.modalSaving = false;
        return false;
      }
      // Email simple validation
      if (/correo|email|mail/i.test(k)) {
        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(String(v))) {
          try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire('Error', `El campo "${f.label}" debe ser un correo válido.`, 'error');
          } catch {}
          thisRef.modalSaving = false;
          return false;
        }
      }
      // Convert numeric strings to numbers
      if (typeof v === 'string' && /^\d+$/.test(v)) v = Number(v);
      // Convert boolean-like strings
      if (v === 'true') v = true;
      if (v === 'false') v = false;
      payload[k] = v;
    }
    // Limpieza extra: eliminar campos vacíos, nulos o no permitidos
    Object.keys(payload).forEach((k) => {
      if (
        payload[k] === '' ||
        payload[k] === null ||
        typeof payload[k] === 'undefined' ||
        (Array.isArray(payload[k]) && payload[k].length === 0)
      ) {
        delete payload[k];
      }
    });
    // Remove id if empty (backend usually generates it on create, o está en URL en update)
    if (
      payload.id === '' ||
      payload.id === null ||
      payload.id === undefined ||
      thisRef.modalEditingId
    ) {
      delete payload.id;
    }
    // If editing, perform update; otherwise create
    const id = thisRef.modalEditingId ?? null;
    try {
      // Para usuarios endpoint, asegurar campos requeridos por backend
      if (!id && String(endpoint).toLowerCase() === 'usuarios') {
        try {
          if (!payload.contrasena) {
            const rand = Math.random().toString(36).slice(2, 8);
            payload.contrasena = `Pwd${rand}`; // >=6 chars
          }
          const nombreUsuario = payload.nombre_usuario || payload.nombre || '';
          if (!payload.nombres) {
            const parts = String(nombreUsuario || '')
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            payload.nombres = parts.length
              ? parts[0]
              : (payload.correo_electronico || 'Usuario').split('@')[0];
          }
          if (!payload.apellidos) {
            const parts = String(nombreUsuario || '')
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            payload.apellidos = parts.length > 1 ? parts.slice(1).join(' ') : 'N/A';
          }
        } catch (e) {}
      }
      // Log de payload para depuración
      if (typeof window !== 'undefined' && window?.location?.hostname === 'localhost') {
        console.log(`[${id ? 'PUT' : 'POST'} ${endpoint}] Payload enviado:`, payload);
      }
    } catch {}

    thisRef.modalOpen = false;
    thisRef.modalSaving = false;
    try {
      thisRef.cdr?.detectChanges();
    } catch {}
    const { default: Swal } = await import('sweetalert2');
    let res: any;
    try {
      if (id && typeof id !== 'undefined' && id !== null && id !== '') {
        // update
        res = await firstValueFrom(thisRef.api.put(`${endpoint}/${id}`, payload) as any);
        await Swal.fire('Guardado', 'Elemento actualizado', 'success');
      } else {
        // create
        res = await firstValueFrom(thisRef.api.post(endpoint, payload) as any);
        await Swal.fire('Guardado', 'Elemento creado', 'success');
      }
      // Si el endpoint es 'menus', emitir evento para recargar el sidebar
      if (typeof window !== 'undefined' && String(endpoint).toLowerCase().includes('menu')) {
        try {
          const menuResp = await firstValueFrom(thisRef.api.get('menus/arbol'));
          const menuArray = Array.isArray(menuResp)
            ? menuResp
            : Array.isArray(menuResp && (menuResp as any).menus)
            ? (menuResp as any).menus
            : [];
          window.dispatchEvent(new CustomEvent('app:login', { detail: { menu: menuArray } }));
        } catch {
          window.dispatchEvent(new CustomEvent('app:login'));
        }
      }
    } catch (err: any) {
      // Manejo robusto de errores HTTP
      let msg =
        err?.error?.msg ||
        err?.error?.message ||
        err?.message ||
        err?.statusText ||
        'Error desconocido';
      if (typeof msg !== 'string') msg = JSON.stringify(msg);
      await Swal.fire('Error', msg, 'error');
      thisRef.modalSaving = false;
      return false;
    }
    try {
      if (typeof thisRef.load === 'function') await thisRef.load();
      if (typeof thisRef.refrescar === 'function') await thisRef.refrescar();
      if (typeof thisRef.cargarDatosAsync === 'function') await thisRef.cargarDatosAsync();
    } catch {}
    return true;
  } catch (err) {
    thisRef.modalSaving = false;
    try {
      const { default: Swal } = await import('sweetalert2');
      thisRef.modalOpen = false;
      try {
        thisRef.cdr?.detectChanges();
      } catch {}
      let msg = (err as any)?.error?.msg || (err as any)?.message || JSON.stringify(err);
      if (typeof msg !== 'string') msg = JSON.stringify(msg);
      await Swal.fire('Error', msg || 'No se pudo crear', 'error');
    } catch {}
    return false;
  }
  // fallback por si algo falla y no retorna antes
  return false;
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

export async function abrirEditarModalGeneric(
  thisRef: any,
  row: any,
  endpoint: string,
  fields: Array<any> = [],
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
    let payload: any = {};
    for (const f of fields) {
      if (result[f.key] !== undefined && f.key !== 'id' && f.key !== 'ID' && f.key !== 'Id')
        payload[f.key] = result[f.key];
    }
    // Eliminar explícitamente los campos 'id', 'ID', 'Id' si existen
    ['id', 'ID', 'Id'].forEach((k) => {
      if (k in payload) delete payload[k];
    });
    // convert *_id to number
    for (const k of Object.keys(payload)) {
      if (/_id$/.test(k) && payload[k] !== '' && payload[k] != null) {
        const n = Number(payload[k]);
        payload[k] = Number.isNaN(n) ? payload[k] : n;
      }
      if (typeof payload[k] === 'string') payload[k] = payload[k] === 'true' || payload[k] === '1';
      else payload[k] = !!payload[k];
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
