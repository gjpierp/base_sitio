import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { Role } from '../../models/role';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';

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
    UiEntityTableComponent,
    UiCardComponent,
    UiSpinnerComponent,
    UiModalComponent,
  ],
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.css'],
})
export class RolesPageComponent {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  title = 'Roles';
  subtitle = 'Roles';
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ];
  data: Role[] = [];
  loading = false;
  error?: string;
  totalRoles = 0;
  datosListos = false;
  currentPage = 1;
  nuevo = { nombre: '', descripcion: '' };
  // legacy/modal state (use integrated ui-modal)
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  seleccionado: any = null;
  modalError = '';

  /**
   * @description Constructor de la clase RolesPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  constructor() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      const rows = Array.isArray(pre.roles) ? pre.roles : [];
      this.data = rows.map((r: any) => this.normalizeRole(r));
      this.totalRoles = Number(pre.total) || this.data.length;
      this.loading = false;
      this.datosListos = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } else {
      this.cargar();
    }
  }

  /**
   * @description Inicializa el ciclo de vida del componente y limpia el filtro persistido.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  ngOnInit() {
    try {
      localStorage.removeItem('table:roles:filterText');
    } catch {}
  }

  refrescar() {
    this.cargar();
  }

  /**
   * @description Carga la lista de roles desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargar() {
    this.loading = true;
    // Cargar primera página con límite por defecto (el backend usa items_per_page si no se indica limite)
    this.api.getPaginated('roles', { desde: 0 }).subscribe({
      next: (resp) => {
        const rows = resp.data || [];
        this.data = rows.map((r: any) => this.normalizeRole(r));
        this.totalRoles = Number(resp.total) || this.data.length;
        this.loading = false;
        this.datosListos = true;
      },
      error: (err) => {
        this.error = err?.error?.msg || 'No se pudo cargar roles';
        this.loading = false;
      },
    });
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    this.currentPage = evt.page;
    const desde = (evt.page - 1) * evt.pageSize;
    const limite = evt.pageSize;
    this.loading = true;
    this.datosListos = false;
    try {
      this.cdr.detectChanges();
    } catch {}
    const term = (evt.term || '').trim();
    const sortKey = (evt.sortKey || '').trim();
    const sortDir = (evt.sortDir || 'asc').toLowerCase() as 'asc' | 'desc';
    const applySort = (list: any[]) => {
      if (!sortKey) return list;
      const sorted = [...list].sort((a, b) => {
        const va = a?.[sortKey];
        const vb = b?.[sortKey];
        const na = va === null || va === undefined;
        const nb = vb === null || vb === undefined;
        if (na && nb) return 0;
        if (na) return 1;
        if (nb) return -1;
        const ta = typeof va;
        const tb = typeof vb;
        if (ta === 'number' && tb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
      return sorted;
    };
    if (term) {
      this.api.get<any>(`todo/coleccion/roles/${encodeURIComponent(term)}`).subscribe({
        next: (resp) => {
          const list = Array.isArray((resp as any)?.resultados)
            ? (resp as any).resultados
            : Array.isArray(resp)
            ? (resp as any)
            : [];
          const mapped = list.map((r: any) => this.normalizeRole(r));
          const ordered = applySort(mapped as any[]);
          this.totalRoles = ordered.length;
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: (err) => {
          this.error = err?.error?.msg || 'No se pudo filtrar roles';
          this.loading = false;
        },
      });
    } else {
      this.api.getPaginated('roles', { desde, limite, sortKey, sortDir }).subscribe({
        next: (resp) => {
          const rows = resp.data || [];
          const mapped = rows.map((r: any) => this.normalizeRole(r));
          const ordered = applySort(mapped as any[]);
          this.data = ordered;
          this.totalRoles = Number(resp.total) || ordered.length;
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: (err) => {
          this.error = err?.error?.msg || 'No se pudo cargar roles';
          this.loading = false;
        },
      });
    }
  }

  /**
   * @description Crea un nuevo rol utilizando los datos del formulario local.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  crear() {
    const body = { nombre: this.nuevo.nombre, descripcion: this.nuevo.descripcion };
    this.api.post('roles', body).subscribe({
      next: () => {
        this.nuevo = { nombre: '', descripcion: '' };
        this.cargar();
      },
      error: (err) => (this.error = err?.error?.msg || 'No se pudo crear el rol'),
    });
  }

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
            payload = resp?.rol ?? resp?.data ?? resp ?? payload;
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
    // legacy - keep for compatibility
    this.modalOpen = false;
    this.seleccionado = null;
    this.modalValues = {};
    this.modalFields = [];
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalError = '';
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
      this.modalTitle = 'Crear rol';
      this.modalEditingId = null;
      this.modalDeleteMode = false;
      this.modalFields = [
        { key: 'nombre', label: 'Nombre', type: 'text', value: '' },
        { key: 'descripcion', label: 'Descripción', type: 'textarea', value: '' },
      ];
      this.modalValues = {};
      for (const f of this.modalFields) this.modalValues[f.key] = f.value ?? '';
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (e) {
      console.debug('[RolesPage] openCreateModal error', e);
    }
  }

  onModalConfirm() {
    if (this.modalDeleteMode) {
      // delete flow
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
    const payload = { nombre, descripcion: this.modalValues?.descripcion ?? '' };
    if (id) {
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
  }

  // Normalized handlers for templates expecting onEdit/onRemove
  onEdit(e: any) {
    try {
      return (this as any).abrirEditar ? (this as any).abrirEditar(e) : undefined;
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

  private normalizeRole(r: any) {
    if (!r || typeof r !== 'object') return { id: '', nombre: '', descripcion: '' };
    const id = r.id_rol ?? r.id ?? r.ID ?? r.idRole ?? r.role_id ?? '';
    const nombre = r.nombre ?? r.nombre_rol ?? r.nombreRole ?? r.name ?? r.titulo ?? '';
    const descripcion =
      r.descripcion ?? r.descripcion_rol ?? r.desc ?? r.descripcionRol ?? undefined;
    return { id, nombre, descripcion };
  }
}
