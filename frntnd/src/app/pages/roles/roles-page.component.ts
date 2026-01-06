import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Roles } from '../../models/roles';
import { Estado } from '../../models/estado';
import { UiPaginationComponent } from '../../components/ui-navigation/ui-pagination/ui-pagination.component';
/**
 * Componente para la gestión y listado de roles en el sistema.
 * Fecha  Autor Versión Descripción
 * @date 28-12-2025 @author Gerardo Paiva  @version 1.0.0 @description Listado, edición y eliminación de roles.
 */
@Component({
  selector: 'page-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiButtonComponent,
    UiEntityTableComponent,
    UiModalComponent,
    UiPaginationComponent,
  ],
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RolesPageComponent implements OnInit {
  seleccionado: any = null;
  modalError: string = '';
  nuevo: { nombre: string; descripcion: string } = { nombre: '', descripcion: '' };
  // route: any; // Eliminado, ahora se inyecta en el constructor
  estadoActivoId: string = '';
  title = 'Roles';
  subtitle = 'Administración de roles';
  columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'nombre_estado', label: 'Estado' },
  ];
  data: Roles[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  totalRoles = 0;
  currentPage = 1;
  datosListos = false;
  estados: Estado[] = [];
  filtroNombre: string = '';
  filtroDescripcion: string = '';
  filtroEstado: string = '';

  // Modal
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotificationService);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    // Permitir precarga por resolver en el futuro, por ahora siempre async
    this.cargarDatosAsync();
  }

  onPageChange(event: any) {
    // Puedes ajustar la lógica según paginación real
    this.currentPage = event.page || 1;
    this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      type ResultType = { estados: any; roles: any };
      const results: ResultType = await firstValueFrom(
        (window as any).forkJoin
          ? (window as any).forkJoin({
              estados: this.api.get<any>('estados'),
              roles: this.api.get<any>('roles'),
            })
          : (
              await import('rxjs')
            ).forkJoin({
              estados: this.api.get<any>('estados'),
              roles: this.api.get<any>('roles'),
            })
      );
      this.ngZone.run(() => {
        const { estados, roles } = results;
        // Procesar Estados
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
        // Buscar el id del estado "Activo" y filtrar por defecto
        const estadoActivo = this.estados.find((e) => e.nombre?.toLowerCase() === 'activo');
        if (estadoActivo) {
          this.estadoActivoId = String(estadoActivo.id_estado);
          this.filtroEstado = this.estadoActivoId;
        }
        // Procesar Roles
        const rows = Array.isArray(roles)
          ? roles
          : (typeof roles === 'object' &&
              roles !== null &&
              (Array.isArray((roles as any)['roles'])
                ? (roles as any)['roles']
                : Array.isArray((roles as any)['data'])
                ? (roles as any)['data']
                : [])) ||
            [];
        this.procesarDatosRoles(rows, this.estados);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar roles';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  procesarDatosRoles(rows: any[], estados: Estado[]) {
    // Mostrar todos los roles y usar nombre_estado si viene del backend
    const rolesProcesados = rows.map((r: any) => ({
      ...r,
      nombre_estado: r.nombre_estado || 'Sin estado',
    }));
    this.data = rolesProcesados;
    this.formattedData = this.data;
    this.totalRoles = this.data.length;
  }

  aplicarFiltros() {
    let filtrados = this.data;
    // Filtrar por estado activo si no hay filtro explícito
    if (!this.filtroEstado && this.estadoActivoId) {
      filtrados = filtrados.filter((r) => String(r.id_estado) === String(this.estadoActivoId));
    }
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((r) => (r.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroDescripcion) {
      const desc = this.filtroDescripcion.toLowerCase();
      filtrados = filtrados.filter((r) => (r.descripcion || '').toLowerCase().includes(desc));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((r) => String(r.id_estado) === String(this.filtroEstado));
    }
    this.formattedData = filtrados;
    this.totalRoles = filtrados.length;
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroDescripcion = '';
    this.filtroEstado = '';
    this.formattedData = this.data;
    this.totalRoles = this.data.length;
  }

  // ...existing code...

  openEditModal(rol: any) {
    this.modalTitle = 'Editar rol';
    this.modalFields = this.buildFields(rol);
    this.modalValues = { ...rol };
    this.modalDeleteMode = false;
    this.modalEditingId = rol.id_rol;
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  // ...existing code...

  // ...existing code...

  // ...existing code...

  buildFields(defaults: any = {}) {
    return [
      { key: 'nombre', label: 'Nombre', type: 'text', value: defaults.nombre || '' },
      { key: 'descripcion', label: 'Descripción', type: 'text', value: defaults.descripcion || '' },
      {
        key: 'id_estado',
        label: 'Estado',
        type: 'select',
        options: this.estados.map((e) => ({ value: e.id_estado, label: e.nombre })),
        value: defaults.id_estado || '',
      },
    ];
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  /**
   * @description Constructor de la clase RolesPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor(private route: ActivatedRoute) {
    // Constructor vacío, la carga de datos se realiza en ngOnInit
  }

  /**
   * @description Inicializa el ciclo de vida del componente y limpia el filtro persistido.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */

  /**
   * @description Carga la lista de roles desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargar() {
    this.loading = true;
    this.api.getPaginated('roles', { desde: 0 }).subscribe({
      next: (resp) => {
        const rows = Array.isArray(resp) ? resp : resp && Array.isArray(resp.data) ? resp.data : [];
        this.data = rows.map((r: any) => this.normalizeRole(r));
        this.formattedData = this.data;
        this.totalRoles = Number(resp.total) || this.data.length;
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.msg || 'No se pudo cargar roles';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ...existing code...

  /**
   * @description Crea un nuevo rol utilizando los datos del formulario local.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  // ...existing code...

  /**
   * @description Abre el modal de edición para un rol específico.
   * @param row Datos del rol a editar.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  abrirEditar(row: any) {
    // guard re-entrancy
    if (this.modalOpen || this.modalLoading) return;

    // open modal immediately with spinner to ensure single-click UX
    this.modalTitle = 'Editar rol';
    this.modalEditingId = row?.id ?? row?.id_rol ?? null;
    this.modalDeleteMode = false;
    this.modalLoading = true;
    this.modalFields = [];
    this.modalValues = {};
    // open in next macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      try {
        this.modalOpen = true;
        try {
          this.cdr.detectChanges();
        } catch {}
      } catch {}
    }, 0);

    (async () => {
      try {
        const id = this.modalEditingId;
        // fetch detail
        let payload: any = row || {};
        if (id) {
          try {
            const resp: any = await firstValueFrom(this.api.get(`roles/${id}`) as any).catch(
              () => null
            );
            payload =
              resp && typeof resp === 'object'
                ? resp.rol ?? (Array.isArray(resp.data) ? resp.data[0] : resp.data) ?? resp
                : payload;
          } catch (e) {
            console.debug('[RolesPage] fetch role detail error', e);
          }
        }

        // build fields and values
        this.modalFields = [
          { key: 'nombre', label: 'Nombre', type: 'text', value: payload?.nombre ?? '' },
          {
            key: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            value: payload?.descripcion ?? '',
          },
        ];
        this.modalValues = {};
        for (const f of this.modalFields) this.modalValues[f.key] = f.value ?? '';

        // done loading
        this.modalLoading = false;
        // ensure new references for ngModel
        try {
          this.modalFields = (this.modalFields || []).map((f: any) => ({ ...f }));
          this.modalValues = { ...(this.modalValues || {}) };
        } catch {}
        try {
          this.cdr.detectChanges();
        } catch {}
      } catch (e) {
        console.debug('[RolesPage] abrirEditar error', e);
        this.modalLoading = false;
      }
    })();
  }

  /**
   * @description Abre el modal de confirmación para eliminar un rol.
   * @param row Rol seleccionado para eliminar.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  confirmarEliminar(row: any) {
    const id = row?.id ?? row?.id_rol ?? null;
    this.modalTitle = 'Eliminar rol';
    this.modalEditingId = id;
    this.modalDeleteMode = true;
    this.modalFields = [];
    this.modalValues = { nombre: row?.nombre ?? '' };
    this.modalOpen = true;
  }

  /**
   * @description Cierra el modal de edición y limpia los datos temporales.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cerrarEditar() {
    this.modalOpen = false;
    this.seleccionado = null;
    this.modalValues = {};
    this.modalFields = [];
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalError = '';
    this.cdr.detectChanges();
  }

  /**
   * @description Guarda los cambios realizados en la edición de un rol.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  guardarEdicion() {
    // migrate guardarEdicion to unified modal-saving behaviour
    const id = this.modalEditingId ?? this.seleccionado?.id;
    const nombre = (this.modalValues?.nombre || '').trim();
    if (!nombre) {
      this.modalError = 'El nombre es requerido';
      return;
    }
    this.modalSaving = true;
    const payload = { nombre, descripcion: this.modalValues?.descripcion ?? '' };
    console.log('[RolesPage] PUT payload (editar rol):', { id, ...payload });
    this.api.put(`roles/${id}`, payload).subscribe({
      next: () => {
        this.modalSaving = false;
        this.modalOpen = false;
        this.modalEditingId = null;
        this.cargar();
      },
      error: (err) => {
        this.modalSaving = false;
        this.error = err?.error?.msg || 'No se pudo editar el rol';
      },
    });
  }

  /**
   * @description Cierra el modal de eliminación y limpia la selección.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cerrarEliminar() {
    this.modalOpen = false;
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalValues = {};
    this.cdr.detectChanges();
  }

  /**
   * @description Elimina el rol seleccionado tras confirmación del usuario.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  eliminarSeleccionado() {
    const id = this.modalEditingId ?? this.seleccionado?.id;
    if (!id) return this.cerrarEliminar();
    this.modalSaving = true;
    console.log('[RolesPage] DELETE payload (eliminar rol):', { id });
    this.api.delete(`roles/${id}`).subscribe({
      next: () => {
        this.modalSaving = false;
        this.modalOpen = false;
        this.modalEditingId = null;
        this.cargar();
      },
      error: (err) => {
        this.modalSaving = false;
        this.error = err?.error?.msg || 'No se pudo eliminar el rol';
      },
    });
  }

  // --- Modal unified handlers ---
  async openCreateModal() {
    try {
      console.log('[RolesPage] openCreateModal start');
      this.modalTitle = 'Crear rol';
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      this.modalFields = [
        { key: 'nombre', label: 'Nombre', type: 'text', value: '' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea', value: '' },
        {
          key: 'id_estado',
          label: 'Estado',
          type: 'select',
          options: this.estados.map((e) => ({ value: e.id_estado, label: e.nombre })),
          value: this.estadoActivoId || (this.estados[0]?.id_estado ?? ''),
        },
      ];
      this.modalValues = {};
      for (const f of this.modalFields) this.modalValues[f.key] = f.value ?? '';
      // ensure modalLoading is false for create flow
      this.modalLoading = false;
      // open in next macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        try {
          this.modalOpen = true;
          try {
            this.cdr.detectChanges();
          } catch {}
          console.log('[RolesPage] modal opened (create)');
        } catch (e) {
          console.debug('[RolesPage] openCreateModal open error', e);
        }
      }, 0);
    } catch (e) {
      console.debug('[RolesPage] openCreateModal error', e);
      // make sure modal state is consistent on error
      this.modalLoading = false;
      this.modalOpen = false;
      this.modalFields = [];
      this.modalValues = {};
    }
  }

  onModalConfirm() {
    if (this.modalDeleteMode) {
      // Solo eliminar
      this.eliminarSeleccionado();
      return;
    }
    const id = this.modalEditingId ?? null;
    const nombre = (this.modalValues?.nombre || '').trim();
    if (!nombre) {
      this.modalError = 'El nombre es requerido';
      return;
    }
    this.modalSaving = true;
    // Buscar el registro completo filtrado por id
    const registro = this.data.find((r) => String(r.id_rol) === String(id));
    // Si existe, enviar todos los datos, actualizando los campos editados
    let payload: any = registro ? { ...registro } : {};
    payload.nombre = nombre;
    payload.descripcion = this.modalValues?.descripcion ?? '';
    payload.id_estado = this.modalValues?.id_estado ?? payload.id_estado;
    if (id) {
      // Solo PUT para editar
      console.log('[RolesPage] PUT payload (onModalConfirm editar rol):', { id, ...payload });
      this.api.put(`roles/${id}`, payload).subscribe({
        next: () => {
          this.modalSaving = false;
          this.modalOpen = false;
          this.modalEditingId = null;
          this.cargar();
        },
        error: (err) => {
          this.modalSaving = false;
          this.error = err?.error?.msg || 'No se pudo guardar el rol';
        },
      });
    } else {
      // Solo POST para crear
      console.log('[RolesPage] POST payload (crear rol):', payload);
      this.api.post('roles', payload).subscribe({
        next: () => {
          this.modalSaving = false;
          this.modalOpen = false;
          this.cargar();
        },
        error: (err) => {
          this.modalSaving = false;
          this.error = err?.error?.msg || 'No se pudo crear el rol';
        },
      });
    }
  }

  onModalClosed() {
    this.modalOpen = false;
    this.modalFields = [];
    this.modalValues = {};
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalSaving = false;
    this.modalError = '';
    this.cdr.detectChanges();
  }

  // Normalized handlers for templates expecting onEdit/onRemove
  onEdit(e: any) {
    try {
      return (this as any).openEditModal ? (this as any).openEditModal(e) : undefined;
    } catch (err) {
      // noop
    }
  }

  onRemove(e: any) {
    try {
      return (this as any).confirmarEliminar ? (this as any).confirmarEliminar(e) : undefined;
    } catch (err) {
      // noop
    }
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  private normalizeRole(r: any): Roles {
    if (!r || typeof r !== 'object') return { id_rol: 0, nombre: '', descripcion: '' };
    const id_rol = r.id_rol ?? r.id ?? r.ID ?? r.idRole ?? r.role_id ?? 0;
    const nombre = r.nombre ?? r.nombre_rol ?? r.nombreRole ?? r.name ?? r.titulo ?? '';
    const descripcion = r.descripcion ?? r.descripcion_rol ?? r.desc ?? r.descripcionRol ?? '';
    return { id_rol, nombre, descripcion };
  }
}
