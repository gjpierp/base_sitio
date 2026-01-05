import { Component, inject, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User, USUARIO_SCHEMA } from '../../models/usuario';
import { TipoUsuario } from '../../models/tipo-usuario';
import { Estado } from '../../models/estado';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import {
  setupList,
  onPageChangeGeneric,
  abrirEditarGeneric,
  abrirCrearModalGeneric,
  onModalConfirmGeneric,
  onModalClosedGeneric,
} from '../page-utils';

/**
 * Componente para la gestión y listado de usuarios en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
@Component({
  selector: 'page-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiModalComponent,
  ],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css'],
})
export class UsuariosPageComponent implements OnInit {
  /**
   * @description Inicio de Variables
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  title = 'Usuarios';
  subtitle = 'Usuarios';
  tiposUsuario: TipoUsuario[] = [];
  estados: Estado[] = [];
  data: User[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalUsuarios = 0;
  total = 0;
  usuarioAEliminar: any = null;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  currentPage = 1;

  @ViewChild('modalRef') modalComp: any;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);

  /**
   * @description Constructor de la clase UsuariosPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor() {}

  /**
   * @description Construye el array de campos del modal basándose en el modelo `usuario`.
   * Permite inyectar opciones (roles, jerarquías, tipos, estados) y valores por defecto.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  private buildUsuarioFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const rolOptions = opts.rolOptions ?? [];
    const jerarquiaOptions = opts.jerarquiaOptions ?? [];
    const tipoOptions = opts.tipoOptions ?? [];
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields =
      USUARIO_SCHEMA && Array.isArray(USUARIO_SCHEMA.fields) ? USUARIO_SCHEMA.fields : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        hiddenOnCreate: !!s.hiddenOnCreate,
        hiddenOnEdit: !!s.hiddenOnEdit,
        hidden: !!s.hidden, // will be adjusted below based on mode
      };
      // determine options and default value per key
      if (base.type === 'select') {
        if (key === 'id_rol') base.options = rolOptions;
        else if (key === 'id_jerarquia') base.options = jerarquiaOptions;
        else if (key === 'id_tipo_usuario') base.options = tipoOptions;
        else if (key === 'id_estado') base.options = estadoOptions;
        else if (key === 'activo')
          base.options = [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ];
      }
      // determine hidden based on create/edit flags
      base.hidden =
        base.hidden || (!isEdit && !!base.hiddenOnCreate) || (isEdit && !!base.hiddenOnEdit);

      // value: try multiple candidate keys in defaults (key, alias, sensible fallbacks)
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        candidates.push(baseKey, `${baseKey}_nombre`, `${baseKey}_name`, `nombre_${baseKey}`);
      }
      if (key.endsWith('_usuario')) {
        const baseKey = key.replace(/_usuario$/, '');
        candidates.push(baseKey, `${baseKey}_nombre`, 'nombre', 'name');
      }
      // common fallbacks
      candidates.push(
        key.replace(/_/g, ''),
        key.replace(/_/g, ' '),
        'nombre',
        'name',
        'correo',
        'correo_electronico'
      );

      let val: any = undefined;
      for (const k of candidates) {
        if (!k) continue;
        if (
          Object.prototype.hasOwnProperty.call(defaults, k) &&
          typeof defaults[k] !== 'undefined'
        ) {
          val = defaults[k];
          break;
        }
      }
      if (typeof val === 'undefined') {
        if (key === 'correo_electronico') val = defaults.correo ?? '';
        else val = '';
      }
      base.value = val == null ? '' : String(val);
      return base;
    });
    return fields;
  }

  /**
   * @description Inicializa el componente y configura la lista de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  ngOnInit() {
    // Use shared setupList to normalize resolver and API fallback behaviour
    try {
      setupList(this, 'usuarios', 'usuarios', (r: any) => ({
        id: r.id_usuario ?? r.id ?? r.ID ?? '',
        nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
        correo_electronico: r.correo ?? r.correo_electronico ?? '',
        id_tipo_usuario: r.id_tipo_usuario ?? '',
        id_estado: r.id_estado ?? '',
        activo:
          typeof r.activo !== 'undefined'
            ? r.activo === 1 || r.activo === '1' || r.activo === true
            : true,
      }));
    } catch {}

    // Fallback: si setupList no dejó datos, cargar explícitamente
    setTimeout(async () => {
      try {
        if (!this.datosListos && !this.loading) {
          try {
            await this.load();
          } catch (err) {}
        }
      } catch (e) {}
    }, 500);
  }

  /**
   * @description Carga todos los datos requeridos de forma asíncrona y en orden.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async cargarDatosAsync() {
    this.loading = true;
    try {
      const [tipos, estados] = await Promise.all([
        firstValueFrom(this.api.get<TipoUsuario[]>('tipos_usuario') as any),
        firstValueFrom(this.api.get<Estado[]>('estados') as any),
      ]);
      // Normaliza la respuesta del endpoint /api/tipos_usuario
      this.tiposUsuario = Array.isArray(tipos)
        ? tipos
        : (typeof tipos === 'object' &&
            tipos !== null &&
            (Array.isArray((tipos as any)['tipos'])
              ? (tipos as any)['tipos']
              : Array.isArray((tipos as any)['tipos_usuario'])
              ? (tipos as any)['tipos_usuario']
              : Array.isArray((tipos as any)['data'])
              ? (tipos as any)['data']
              : [])) ||
          [];
      this.estados = Array.isArray(estados)
        ? estados
        : (typeof estados === 'object' &&
            estados !== null &&
            (Array.isArray((estados as any)['estados'])
              ? (estados as any)['estados']
              : Array.isArray((estados as any)['data'])
              ? (estados as any)['data']
              : [])) ||
          [];
      // Cargar primera página (server-side) con tamaño por defecto
      const res: any = await firstValueFrom(this.api.getPaginated('usuarios', { desde: 0 }) as any);
      const rows = res?.data || [];
      this.data = rows.map((r: any) => ({
        // keep both backend names and frontend aliases for compatibility
        id: r.id_usuario ?? r.id ?? r.ID ?? '',
        id_usuario: r.id_usuario ?? r.id ?? r.ID ?? '',
        nombre_usuario: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
        nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
        correo: r.correo ?? r.correo_electronico ?? '',
        correo_electronico: r.correo ?? r.correo_electronico ?? '',
        id_tipo_usuario: r.id_tipo_usuario ?? '',
        id_estado: r.id_estado ?? '',
        activo:
          typeof r.activo !== 'undefined'
            ? r.activo === 1 || r.activo === '1' || r.activo === true
            : true,
        img: r.img ?? null,
        fecha_creacion: r.fecha_creacion ?? null,
        fecha_actualizacion: r.fecha_actualizacion ?? null,
      }));
      this.totalUsuarios = Number(res?.total) || rows.length || 0;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
  }

  /**
   * @description Carga inicial (alias) usado por otras páginas para refrescar la lista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  // simple alias used by other pages/helpers
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
    // keep generic `total` in sync
    try {
      this.total = this.totalUsuarios;
    } catch {}
  }

  /**
   * @description Devuelve los datos de usuarios con fechas y nombres formateados para la vista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  get dataFormateada() {
    return this.data.map((u) => ({
      ...u,
      // ensure display-friendly aliases exist
      nombre: (u as any).nombre_usuario ?? (u as any).nombre ?? '',
      correo_electronico: (u as any).correo ?? (u as any).correo_electronico ?? '',
      tipo_usuario_nombre:
        this.tiposUsuario.find(
          (t) => Number((t as any).id_tipo_usuario) === Number((u as any)['id_tipo_usuario'])
        )?.nombre || '',
      estado_nombre:
        this.estados.find((e) => Number((e as any).id_estado) === Number((u as any)['id_estado']))
          ?.nombre || '',
    }));
  }

  /**
   * @description Maneja cambios de paginación, búsqueda y orden en la tabla.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    try {
      this.currentPage = Number(evt.page) || 1;
    } catch {}

    onPageChangeGeneric(this, evt, 'usuarios', (r: any) => ({
      id: r.id_usuario ?? r.id ?? r.ID ?? '',
      nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
      correo_electronico: r.correo ?? r.correo_electronico ?? '',
      id_tipo_usuario: r.id_tipo_usuario ?? '',
      id_estado: r.id_estado ?? '',
      activo:
        typeof r.activo !== 'undefined'
          ? r.activo === 1 || r.activo === '1' || r.activo === true
          : true,
    }));
  }

  /**
   * @description Notifica que la tabla está lista para renderizar y dispara detección de cambios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onTableReady() {
    // Marcar lista la tabla para asegurar que se pinte
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  /**
   * @description Abre el modal de creación de usuario y carga opciones en background.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async openCreateModal() {
    try {
      this.modalTitle = 'Crear usuario';

      this.modalFields = [];
      this.modalValues = {};
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      this.modalLoading = true;
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}

      (async () => {
        try {
          const [rresp, jresp, tresp, eresp] = await Promise.all([
            firstValueFrom(this.api.getPaginated('roles', { desde: 0 }) as any).catch(
              () => ({ data: [] } as any)
            ),
            firstValueFrom(this.api.getPaginated('jerarquias', { desde: 0 }) as any).catch(
              () => ({ data: [] } as any)
            ),
            firstValueFrom(this.api.getPaginated('tipos_usuario', { desde: 0 }) as any).catch(
              () => ({ data: [] } as any)
            ),
            firstValueFrom(this.api.getPaginated('estados', { desde: 0 }) as any).catch(
              () => ({ data: [] } as any)
            ),
          ]);

          const rrows = (rresp as any)?.data || (rresp as any) || [];
          const jrows = (jresp as any)?.data || (jresp as any) || [];
          const trows = (tresp as any)?.data || (tresp as any) || [];
          const erows = (eresp as any)?.data || (eresp as any) || [];

          const rolOptions = (Array.isArray(rrows) ? rrows : []).map((r: any) => ({
            value: String(r.id_rol ?? r.id ?? ''),
            label:
              r.nombre ??
              r.label ??
              r.title ??
              r.descripcion ??
              r.nombre_rol ??
              r.rol ??
              r.name ??
              String(r.id_rol ?? r.id ?? ''),
          }));
          const jerarquiaOptions = (Array.isArray(jrows) ? jrows : []).map((j: any) => ({
            value: String(j.id_jerarquia ?? j.id ?? ''),
            label:
              j.nombre ??
              j.label ??
              j.title ??
              j.descripcion ??
              j.nombre_jerarquia ??
              j.jerarquia ??
              j.name ??
              String(j.id_jerarquia ?? j.id ?? ''),
          }));
          const tipoOptions = (Array.isArray(trows) ? trows : []).map((t: any) => ({
            value: String(t.id_tipo_usuario ?? t.id ?? ''),
            label: t.nombre ?? t.title ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          }));
          const estadoOptions = (Array.isArray(erows) ? erows : []).map((e: any) => ({
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
          }));

          const fields: any[] = [];
          // build fields from model-based helper
          this.modalFields = this.buildUsuarioFields(
            {
              rolOptions,
              jerarquiaOptions,
              tipoOptions,
              estadoOptions,
            },
            {},
            false
          );
          this.modalValues = {};
          for (const f of this.modalFields) this.modalValues[f.key] = f.value ?? '';
        } catch (e) {
          console.debug('[openCreateModal] background load error', e);
          this.modalFields = [];
          this.modalValues = {};
        } finally {
          this.modalLoading = false;
          try {
            this.cdr.detectChanges();
          } catch {}
        }
      })();
    } catch (err) {
      try {
        console.error(err);
      } catch {}
    }
  }

  /**
   * @description Inicia el flujo de edición para un usuario (abre modal).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async onEdit(usuario: any) {
    try {
      console.log('[UsuariosPage] onEdit click', usuario);
      // Abrir modal inmediatamente (forzar) y luego cargar detalles/fields
      try {
        this.modalOpen = true;
        this.cdr.detectChanges();
      } catch {}
      await this.openEditModal(usuario);
      return;
    } catch (err: any) {
      console.error('[UsuariosPage] onEdit error', err);
      this.notify.warning('No se pudo iniciar la edición del usuario: ' + (err?.message || ''));
    }
  }

  /**
   * @description Muestra confirmación para eliminar un usuario (abre modal de confirmación).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onRemove(usuario: any) {
    // Mostrar modal de confirmación de borrado
    try {
      this.modalFields = [];
      this.modalValues = { nombre: usuario?.nombre ?? '' };
      this.modalTitle = 'Eliminar usuario';
      this.modalEditingId = usuario?.id || usuario?.id_usuario || usuario?.ID || null;
      this.modalDeleteMode = true;
      // Abrir modal inmediatamente (cargar opciones en background)
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (err) {
      console.error(err);
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  /**
   * @description Abrir modal de edición y precargar campos/valores.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async openEditModal(usuario: any) {
    try {
      this.modalTitle = 'Editar usuario';
      console.log('[UsuariosPage] openEditModal start', { usuario });
      // Ensure modal is marked open early so UI renders promptly
      this.modalOpen = true;
      // Reset modal state to avoid stale values from previous opens
      this.modalOpen = false;
      this.modalFields = [];
      this.modalValues = {};
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      // Clone usuario to avoid mutating list reference
      let u: any = usuario ? JSON.parse(JSON.stringify(usuario)) : {};

      // If we only received a partial user (from table row), try to fetch full details
      try {
        const idToFetch = u?.id || u?.id_usuario || u?.ID || null;
        if (idToFetch) {
          const detailResp: any = await firstValueFrom(
            this.api.get(`usuarios/${idToFetch}`) as any
          ).catch(() => null);
          if (detailResp) {
            const payload = detailResp?.data ?? detailResp;
            if (payload && typeof payload === 'object') {
              u = { ...u, ...payload };
            }
          }
        }
      } catch (e) {
        console.debug('[openEditModal] could not fetch user detail', e);
      }

      // Prepare initial fields with option lists that contain at least the current value
      // so the select shows a label immediately even before full options load.
      const makeInitialOption = (key: string) => {
        try {
          const val = u?.[key];
          const base = String(key).replace(/^id_/, '');
          if (val === null || val === undefined || val === '') return [];
          // heuristically find a label in the user object
          const candidates = [
            `${key}_nombre`,
            `${base}_nombre`,
            `${base}_name`,
            `nombre_${base}`,
            `nombre`,
            `name`,
            `titulo`,
          ];
          let label: any = null;
          for (const c of candidates) {
            if (typeof u?.[c] !== 'undefined' && u[c] != null) {
              label = u[c];
              break;
            }
          }
          if (label == null) label = val;
          return [{ value: String(val), label: String(label) }];
        } catch {
          return [];
        }
      };

      // Prepare initial fields with empty option lists so modal can open fast
      // Prepare initial fields using model-based helper, but seed select options
      this.modalFields = this.buildUsuarioFields(
        {
          rolOptions: makeInitialOption('id_rol'),
          jerarquiaOptions: makeInitialOption('id_jerarquia'),
          tipoOptions: makeInitialOption('id_tipo_usuario'),
          estadoOptions: makeInitialOption('id_estado'),
        },
        u,
        true
      );
      console.log(
        '[UsuariosPage] initial modalFields built',
        this.modalFields.map((f: any) => ({
          key: f.key,
          value: f.value,
          readonly: f.readonly,
          hidden: f.hidden,
        }))
      );
      this.modalValues = {};
      for (const f of this.modalFields) this.modalValues[f.key] = f.value ?? '';
      this.modalEditingId = u?.id || u?.id_usuario || u?.ID || null;
      this.modalTitle = 'Editar usuario';
      this.modalDeleteMode = false;
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
      (async () => {
        try {
          const [rresp, jresp, tresp, eresp] = await Promise.all([
            firstValueFrom(this.api.getPaginated('roles', { desde: 0 }) as any).catch(
              () =>
                ({
                  data: [],
                } as any)
            ),
            firstValueFrom(this.api.getPaginated('jerarquias', { desde: 0 }) as any).catch(
              () =>
                ({
                  data: [],
                } as any)
            ),
            firstValueFrom(this.api.getPaginated('tipos_usuario', { desde: 0 }) as any).catch(
              () => ({ data: [] } as any)
            ),
            firstValueFrom(this.api.getPaginated('estados', { desde: 0 }) as any).catch(
              () =>
                ({
                  data: [],
                } as any)
            ),
          ]);
          const rrows = (rresp as any)?.data || (rresp as any) || [];
          const jrows = (jresp as any)?.data || (jresp as any) || [];
          const trows = (tresp as any)?.data || (tresp as any) || [];
          const erows = (eresp as any)?.data || (eresp as any) || [];
          const rolOptions = (Array.isArray(rrows) ? rrows : []).map((r: any) => ({
            value: String(r.id_rol ?? r.id ?? ''),
            label:
              r.nombre ??
              r.label ??
              r.title ??
              r.descripcion ??
              r.nombre_rol ??
              r.rol ??
              r.name ??
              String(r.id_rol ?? r.id ?? ''),
          }));
          const jerarquiaOptions = (Array.isArray(jrows) ? jrows : []).map((j: any) => ({
            value: String(j.id_jerarquia ?? j.id ?? ''),
            label:
              j.nombre ??
              j.label ??
              j.title ??
              j.descripcion ??
              j.nombre_jerarquia ??
              j.jerarquia ??
              j.name ??
              String(j.id_jerarquia ?? j.id ?? ''),
          }));
          const tipoOptions = (Array.isArray(trows) ? trows : []).map((t: any) => ({
            value: String(t.id_tipo_usuario ?? t.id ?? ''),
            label: t.nombre ?? String(t.id_tipo_usuario ?? t.id ?? ''),
          }));
          const estadoOptions = (Array.isArray(erows) ? erows : []).map((e: any) => ({
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? String(e.id_estado ?? e.id ?? ''),
          }));

          // Patch modalFields options
          this.modalFields = (this.modalFields || []).map((f: any) => {
            if (f.key === 'id_rol') return { ...f, options: rolOptions };
            if (f.key === 'id_jerarquia') return { ...f, options: jerarquiaOptions };
            if (f.key === 'id_tipo_usuario') return { ...f, options: tipoOptions };
            if (f.key === 'id_estado') return { ...f, options: estadoOptions };
            return f;
          });
          for (const f of this.modalFields) {
            const current = this.modalValues[f.key];
            const resolved = (f.value ?? '') as any;
            this.modalValues[f.key] =
              current !== undefined && current !== null && String(current) !== ''
                ? current
                : resolved != null
                ? String(resolved)
                : '';
          }
          console.log(
            '[UsuariosPage] modalFields after options',
            this.modalFields.map((f: any) => ({
              key: f.key,
              optionsLength: (f.options || []).length,
            }))
          );
          try {
            this.cdr.detectChanges();
          } catch {}
        } catch (e) {
          console.debug('[openEditModal] background load error', e);
        }
      })();
    } catch (err) {
      console.error(err);
      this.notify.warning('No se pudo abrir modal de edición');
    }
  }

  /**
   * @description Confirma la acción del modal (crear/editar/borrar) usando helpers genéricos.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async onModalConfirm() {
    try {
      await onModalConfirmGeneric(this, 'usuarios');
    } catch {}
  }

  /**
   * @description Se ejecuta al cerrar el modal; limpia estado y delega al helper genérico.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  onModalClosed() {
    try {
      onModalClosedGeneric(this);
    } catch {}
  }

  /**
   * @description Refresca los datos de la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  refrescar() {
    this.cargarDatosAsync();
  }

  /**
   * @description Cambia el tema visual del sitio según selección.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cambiarEstilo(evt: Event) {
    const sel = (evt.target as HTMLSelectElement)?.value || 'base';
    const theme = sel === 'modern' ? 'modern' : 'base';
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }

  /**
   * @description Método legacy para compatibilidad; no realiza acción (no-op).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  openNewUser() {
    // Create-user functionality removed from users page.
    // Legacy method retained as no-op for backwards compatibility.
  }

  /**
   * @description Devuelve las columnas visibles en la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'correo_electronico', label: 'Correo' },
      { key: 'tipo_usuario_nombre', label: 'Tipo usuario' },
      { key: 'estado_nombre', label: 'Estado' },
    ];
  }
}
