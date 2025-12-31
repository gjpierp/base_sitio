/**
 * Componente para la gestión y listado de permisos en el sistema.
 * Fecha  Autor Versión Descripción
 * 28-12-2025 Gerardo Paiva 1.0.0 Listado, edición y eliminación de permisos.
 */
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { Permission } from '../../models/permission';

@Component({
  selector: 'page-permisos',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './permisos-page.component.html',
  styleUrls: ['./permisos-page.component.css'],
})
export class PermisosPageComponent {
  // --- VARIABLES PRINCIPALES ---
  title = 'Permisos';
  subtitle = 'Permisos';
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'codigo', label: 'Código' },
    { key: 'descripcion', label: 'Descripción' },
  ];
  data: Permission[] = [];
  loading = false;
  error?: string;
  totalPermisos = 0;
  datosListos = false;
  nuevo = { codigo: '', descripcion: '' };
  // Estado de modales
  editOpen = false;
  deleteOpen = false;
  seleccionado: any = null;
  editCodigo = '';
  editDescripcion = '';
  modalError = '';

  /**
   * @description Constructor de la clase PermisosPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  constructor() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      const rows = Array.isArray(pre.permisos) ? pre.permisos : [];
      this.data = rows.map((r: any) => this.normalizePermiso(r));
      this.totalPermisos = Number(pre.total) || this.data.length;
      this.loading = false;
      this.datosListos = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } else {
      this.cargar();
    }
  }

  refrescar() {
    this.cargar();
  }

  /**
   * @description Inicializa el ciclo de vida del componente y limpia el filtro persistido.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  ngOnInit() {
    try {
      localStorage.removeItem('table:permisos:filterText');
    } catch {}
  }

  /**
   * @description Carga la lista de permisos desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargar() {
    this.loading = true;
    // Cargar primera página con límite por defecto
    this.api.getPaginated('permisos', { desde: 0, limite: 10 }).subscribe({
      next: (resp) => {
        const rows = resp.data || [];
        this.data = rows.map((r: any) => this.normalizePermiso(r));
        this.totalPermisos = Number(resp.total) || this.data.length;
        this.loading = false;
        this.datosListos = true;
      },
      error: () => {
        this.error = 'No se pudo cargar permisos';
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
    const desde = (evt.page - 1) * evt.pageSize;
    const limite = evt.pageSize;
    this.loading = true;
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
      this.api.get<any>(`todo/coleccion/permisos/${encodeURIComponent(term)}`).subscribe({
        next: (resp) => {
          const list = Array.isArray((resp as any)?.resultados)
            ? (resp as any).resultados
            : Array.isArray(resp)
            ? (resp as any)
            : [];
          const mapped = list.map((r: any) => this.normalizePermiso(r));
          const ordered = applySort(mapped);
          this.totalPermisos = ordered.length;
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
          this.datosListos = true;
        },
        error: () => {
          this.error = 'No se pudo filtrar permisos';
          this.loading = false;
        },
      });
    } else {
      this.api.getPaginated('permisos', { desde, limite, sortKey, sortDir }).subscribe({
        next: (resp) => {
          const rows = resp.data || [];
          const mapped = rows.map((r: any) => ({
            id: r.id_permiso ?? r.id ?? '',
            codigo: r.codigo ?? r.nombre ?? '',
            descripcion: r.descripcion ?? undefined,
          }));
          const ordered = applySort(mapped);
          this.data = ordered;
          this.totalPermisos = Number(resp.total) || ordered.length;
          this.loading = false;
          this.datosListos = true;
        },
        error: () => {
          this.error = 'No se pudo cargar permisos';
          this.loading = false;
        },
      });
    }
  }

  /**
   * @description Crea un nuevo permiso utilizando los datos del formulario local.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  crear() {
    const body = { codigo: this.nuevo.codigo, descripcion: this.nuevo.descripcion };
    this.api.post('permisos', body).subscribe({
      next: () => {
        this.nuevo = { codigo: '', descripcion: '' };
        this.cargar();
      },
      error: () => (this.error = 'No se pudo crear el permiso'),
    });
  }

  /**
   * @description Abre el modal de edición para un permiso específico.
   * @param row Datos del permiso a editar.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  abrirEditar(row: any) {
    try {
      const id = row?.id ?? row?.id_permiso ?? null;
      if (id) {
        this.router.navigate(['/permisos/crear'], { queryParams: { id } });
        return;
      }
    } catch (err) {}
    this.seleccionado = row;
    this.editCodigo = row?.codigo ?? row?.nombre ?? '';
    this.editDescripcion = row?.descripcion ?? '';
    this.editOpen = true;
  }

  /**
   * @description Guarda los cambios realizados en la edición de un permiso.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  guardarEdicion() {
    const id = this.seleccionado?.id;
    if (!id) return this.cerrarEditar();
    const codigo = (this.editCodigo || '').trim();
    if (!codigo) {
      this.modalError = 'El código es requerido';
      return;
    }
    this.api.put(`permisos/${id}`, { codigo, descripcion: this.editDescripcion }).subscribe({
      next: () => {
        this.cerrarEditar();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo editar el permiso'),
    });
  }

  /**
   * @description Cierra el modal de edición y limpia los datos temporales.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cerrarEditar() {
    this.editOpen = false;
    this.seleccionado = null;
    this.editCodigo = '';
    this.editDescripcion = '';
    this.modalError = '';
  }

  /**
   * @description Abre el modal de confirmación para eliminar un permiso.
   * @param row Permiso seleccionado para eliminar.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  confirmarEliminar(row: any) {
    this.seleccionado = row;
    this.deleteOpen = true;
  }

  /**
   * @description Cierra el modal de eliminación y limpia la selección.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cerrarEliminar() {
    this.deleteOpen = false;
    this.seleccionado = null;
  }

  /**
   * @description Elimina el permiso seleccionado tras confirmación del usuario.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  eliminarSeleccionado() {
    const id = this.seleccionado?.id;
    if (!id) return this.cerrarEliminar();
    this.api.delete(`permisos/${id}`).subscribe({
      next: () => {
        this.cerrarEliminar();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo eliminar el permiso'),
    });
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  private normalizePermiso(r: any) {
    if (!r || typeof r !== 'object') return { id: '', codigo: '', descripcion: '' };
    const id = r.id_permiso ?? r.id ?? r.ID ?? r.permiso_id ?? '';
    const codigo = r.codigo ?? r.codigo_permiso ?? r.cod ?? r.nombre ?? r.nombre_permiso ?? '';
    const descripcion = r.descripcion ?? r.desc ?? r.descripcion_permiso ?? undefined;
    return { id, codigo, descripcion };
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
}
