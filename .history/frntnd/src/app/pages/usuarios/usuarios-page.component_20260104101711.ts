import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user';
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
  // Create-user UI removed: form fields and showForm flag omitted
  tiposUsuario: TipoUsuario[] = [];
  estados: Estado[] = [];
  data: User[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalUsuarios = 0;
  // generic total used by shared helpers
  total = 0;

  usuarioAEliminar: any = null;

  // modal integrado para crear/editar/eliminar genérico
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false; // muestra spinner dentro del modal mientras carga datos
  modalEditingId: any = null;
  modalDeleteMode = false;
  currentPage = 1;

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

  async openCreateModal() {
    try {
      this.modalTitle = 'Crear usuario';

      // Abrir modal mostrando spinner de carga
      this.modalFields = [];
      this.modalValues = {};
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      this.modalLoading = true;
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}

      // Cargar opciones en background y luego renderizar el formulario completo
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
          fields.push({
            key: 'nombre_usuario',
            label: 'Nombre de usuario',
            type: 'text',
            value: '',
          });
          fields.push({
            key: 'correo_electronico',
            label: 'Correo electrónico',
            type: 'text',
            value: '',
          });
          fields.push({
            key: 'id_rol',
            label: 'Rol',
            type: 'select',
            options: rolOptions,
            value: rolOptions[0]?.value ?? '',
          });
          fields.push({
            key: 'id_jerarquia',
            label: 'Jerarquía',
            type: 'select',
            options: jerarquiaOptions,
            value: jerarquiaOptions[0]?.value ?? '',
          });
          fields.push({
            key: 'id_tipo_usuario',
            label: 'Tipo usuario',
            type: 'select',
            options: tipoOptions,
            value: tipoOptions[0]?.value ?? '',
          });
          fields.push({
            key: 'id_estado',
            label: 'Estado',
            type: 'select',
            options: estadoOptions,
            value: estadoOptions[0]?.value ?? '',
          });
          fields.push({
            key: 'activo',
            label: 'Activo',
            type: 'select',
            options: [
              { value: 'true', label: 'Sí' },
              { value: 'false', label: 'No' },
            ],
            value: 'true',
          });

          this.modalFields = fields;
          this.modalValues = {};
          for (const f of fields) this.modalValues[f.key] = f.value ?? '';
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

  async onModalConfirm() {
    try {
      await onModalConfirmGeneric(this, 'usuarios');
    } catch {}
  }

  onModalClosed() {
    try {
      onModalClosedGeneric(this);
    } catch {}
  }

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

  // simple alias used by other pages/helpers
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
    // keep generic `total` in sync
    try {
      this.total = this.totalUsuarios;
    } catch {}
  }

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

  /**
   * @description Devuelve los datos de usuarios con fechas y nombres formateados para la vista.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  get dataFormateada() {
    return this.data.map((u) => ({
      ...u,
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
        id: r.id_usuario ?? r.id ?? r.ID ?? '',
        nombre: r.nombre_usuario ?? r.nombre ?? r.name ?? '',
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
   * @description Refresca los datos de la tabla de usuarios.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  refrescar() {
    this.cargarDatosAsync();
  }

  async onEdit(usuario: any) {
    try {
      console.debug('[UsuariosPage] onEdit click', usuario);
      // Abrir modal de edición en lugar de navegar
      await this.openEditModal(usuario);
      return;
    } catch (err: any) {
      console.error('[UsuariosPage] onEdit error', err);
      this.notify.warning('No se pudo iniciar la edición del usuario: ' + (err?.message || ''));
    }
  }

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
   * Abrir modal de edición y precargar campos/valores.
   */
  async openEditModal(usuario: any) {
    try {
      this.modalTitle = 'Editar usuario';
      console.debug('[UsuariosPage] openEditModal start', { usuario });
      // Reset modal state to avoid stale values from previous opens
      this.modalOpen = false;
      this.modalFields = [];
      this.modalValues = {};
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      // Clone usuario to avoid mutating list reference
      const u = usuario ? JSON.parse(JSON.stringify(usuario)) : {};

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
      const fields: any[] = [];
      fields.push({
        key: 'nombre_usuario',
        label: 'Nombre de usuario',
        type: 'text',
        value: u?.nombre_usuario ?? u?.nombre ?? '',
      });
      fields.push({
        key: 'correo_electronico',
        label: 'Correo electrónico',
        type: 'text',
        value: u?.correo_electronico ?? u?.correo ?? '',
      });
      fields.push({
        key: 'id_rol',
        label: 'Rol',
        type: 'select',
        options: makeInitialOption('id_rol'),
        value: String(u?.id_rol ?? ''),
      });
      fields.push({
        key: 'id_jerarquia',
        label: 'Jerarquía',
        type: 'select',
        options: makeInitialOption('id_jerarquia'),
        value: String(u?.id_jerarquia ?? ''),
      });
      fields.push({
        key: 'id_tipo_usuario',
        label: 'Tipo usuario',
        type: 'select',
        options: makeInitialOption('id_tipo_usuario'),
        value: String(u?.id_tipo_usuario ?? ''),
      });
      fields.push({
        key: 'id_estado',
        label: 'Estado',
        type: 'select',
        options: makeInitialOption('id_estado'),
        value: String(u?.id_estado ?? ''),
      });
      fields.push({
        key: 'activo',
        label: 'Activo',
        type: 'select',
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
        value: u?.activo ? 'true' : 'false',
      });

      // Apply initial fields/values and open modal immediately (avoid blocking awaits)
      this.modalFields = fields;
      this.modalValues = {};
      for (const f of fields) this.modalValues[f.key] = f.value ?? '';
      this.modalEditingId = u?.id || u?.id_usuario || u?.ID || null;
      this.modalTitle = 'Editar usuario';
      this.modalDeleteMode = false;
      // Open modal immediately; UiModal ignores immediate backdrop clicks
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}

      // Load options and extra values in background and patch modalFields/modalValues
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

          // Map options
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

          // (no assigned-roles lookup here; keep modal simple and rely on user selects)

          // Ensure modalValues keep existing user values if present
          for (const f of this.modalFields) {
            this.modalValues[f.key] = this.modalValues[f.key] ?? f.value ?? '';
          }

          // Trigger change detection to update selects/options
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

  onTableReady() {
    // Marcar lista la tabla para asegurar que se pinte
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
