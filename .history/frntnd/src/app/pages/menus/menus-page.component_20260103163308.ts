import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
/**
 * Componente para la gestión y listado de menús en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
@Component({
  selector: 'page-menus',
  standalone: true,
  imports: [CommonModule, UiEntityTableComponent, UiCardComponent, UiSpinnerComponent],
  templateUrl: './menus-page.component.html',
  styleUrls: ['./menus-page.component.css'],
})
export class MenusPageComponent {
  // --- VARIABLES PRINCIPALES ---
  title = 'Menus';
  subtitle = 'Menus';
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'url', label: 'URL' },
    { key: 'icono', label: 'Ícono' },
  ];
  data: Record<string, any>[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalMenus = 0;
  nuevo = { nombre: '', ruta: '', icono: '' };
  // Estado de modales
  editOpen = false;
  deleteOpen = false;
  seleccionado: any = null;
  editNombre = '';
  editRuta = '';
  editIcono = '';
  modalError = '';

  /**
   * @description Constructor de la clase MenusPageComponent.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  constructor() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      const rows = Array.isArray(pre.menus) ? pre.menus : [];
      this.data = rows.map((r: any) => ({
        id: r.id_menu ?? r.id ?? '',
        nombre: r['nombre'] ?? '',
        url: r['url'] ?? r['ruta'] ?? '',
        icono: r['icono'] ?? '',
      }));
      this.totalMenus = Number(pre.total) || this.data.length;
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
      localStorage.removeItem('table:menus:filterText');
    } catch {}
    // Data load occurs in constructor when no pre-resolver data exists
  }

  /**
   * @description Carga la lista de menús desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargar() {
    this.loading = true;
    this.api.getPaginated('menus', { desde: 0 }).subscribe({
      next: (res) => {
        const rows = res.data || [];
        this.data = rows.map((r: any) => ({
          id: r.id_menu ?? r.id ?? '',
          nombre: r['nombre'] ?? '',
          url: r['url'] ?? r['ruta'] ?? '',
          icono: r['icono'] ?? '',
        }));
        this.totalMenus = Number(res.total) || this.data.length;
        this.loading = false;
        this.datosListos = true;
      },
      error: (err) => {
        this.error = err?.error?.msg || 'Error al cargar menús';
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
      this.api.get<any>(`todo/coleccion/menus/${encodeURIComponent(term)}`).subscribe({
        next: (resp) => {
          const list = Array.isArray((resp as any)?.resultados)
            ? (resp as any).resultados
            : Array.isArray(resp)
            ? (resp as any)
            : [];
          const mapped = list.map((r: any) => ({
            id: r.id_menu ?? r.id ?? '',
            nombre: r['nombre'] ?? '',
            url: r['url'] ?? r['ruta'] ?? '',
            icono: r['icono'] ?? '',
          }));
          const ordered = applySort(mapped);
          this.totalMenus = ordered.length;
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: (err) => {
          this.error = err?.error?.msg || 'No se pudo filtrar menús';
          this.loading = false;
        },
      });
    } else {
      this.api.getPaginated('menus', { desde, limite, sortKey, sortDir }).subscribe({
        next: (res) => {
          const rows = res.data || [];
          const mapped = rows.map((r: any) => ({
            id: r.id_menu ?? r.id ?? '',
            nombre: r['nombre'] ?? '',
            url: r['url'] ?? r['ruta'] ?? '',
            icono: r['icono'] ?? '',
          }));
          const ordered = applySort(mapped);
          this.data = ordered;
          this.totalMenus = Number(res.total) || ordered.length;
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: (err) => {
          this.error = err?.error?.msg || 'Error al cargar menús';
          this.loading = false;
        },
      });
    }
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  refrescar() {
    this.cargar();
  }

  /**
   * @description Crea un nuevo menú utilizando los datos del formulario local.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  crear() {
    const body = { nombre: this.nuevo.nombre, ruta: this.nuevo.ruta, icono: this.nuevo.icono };
    this.api.post('menus', body).subscribe({
      next: () => {
        this.nuevo = { nombre: '', ruta: '', icono: '' };
        this.seleccionado = null;
        this.editNombre = '';
        this.editRuta = '';
        this.editIcono = '';
        this.modalError = '';
        this.cargar();
      },
      error: () => (this.error = 'No se pudo crear el menú'),
    });
  }

  /**
   * @description Abre el modal de edición para un menú específico.
   * @param row Datos del menú a editar.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  abrirEditar(row: any) {
    try {
      const id = row?.id ?? row?.id_menu ?? null;
      console.log('[MenusPage] abrirEditar called', { id, row });
      if (id) {
        this.router
          .navigate(['/menus/crear'], { queryParams: { id } })
          .then((ok) => console.log('[MenusPage] navigate result', ok))
          .catch((err) => console.error('[MenusPage] navigate error', err));
        return;
      }
    } catch (err) {}
    this.seleccionado = row;
    this.editNombre = row['nombre'];
    this.editRuta = row['ruta'];
    this.editIcono = row['icono'];
    this.editOpen = true;
    this.modalError = '';
  }

  /**
   * @description Guarda los cambios realizados en la edición de un menú.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  guardarEdicion() {
    const id = this.seleccionado?.id;
    if (!id) return this.cerrarEditar();
    const nombre = (this.editNombre || '').trim();
    if (!nombre) {
      this.modalError = 'El nombre es requerido';
      return;
    }
    this.api.put(`menus/${id}`, { nombre, ruta: this.editRuta, icono: this.editIcono }).subscribe({
      next: () => {
        this.cerrarEditar();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo editar el menú'),
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
    this.editNombre = '';
    this.editRuta = '';
    this.editIcono = '';
    this.modalError = '';
  }

  /**
   * @description Abre el modal de confirmación para eliminar un menú.
   * @param row Menú seleccionado para eliminar.
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
   * @description Elimina el menú seleccionado tras confirmación del usuario.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  eliminarSeleccionado() {
    const id = this.seleccionado?.id;
    if (!id) return this.cerrarEliminar();
    this.api.delete(`menus/${id}`).subscribe({
      next: () => {
        this.cerrarEliminar();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo eliminar el menú'),
    });
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
