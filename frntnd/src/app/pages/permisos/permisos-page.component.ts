import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';
import { PERMISO_SCHEMA } from '../../models/schema/permiso.schema';

/**
 * Componente para la gestión y listado de permisos en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 09-01-2026 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de permisos.
 */
@Component({
  selector: 'page-permisos',
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
  templateUrl: './permisos-page.component.html',
  styleUrls: ['./permisos-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
    `
      :host ::ng-deep th:last-child,
      :host ::ng-deep td:last-child {
        text-align: center !important;
      }
      :host ::ng-deep td:last-child > div {
        justify-content: center !important;
      }
    `,
  ],
})
export class PermisosPageComponent implements OnInit {
  title = 'Permisos';
  subtitle = 'Permisos';
  atributos: any[] = [];
  filtroNombre: string = '';
  filtroEstado: string = '';
  estadoActivoId: string = '';
  estados: any[] = [];
  data: any[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  camposLista: string[] = [];
  camposCrear: string[] = [];
  camposEditar: string[] = [];
  camposDetalle: string[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  permisoAEliminar: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  /**
   * @description Método de inicialización del componente.
   * Carga los datos precargados por el Resolver o los obtiene de forma asíncrona.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async ngOnInit() {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      // Inicializar filtro de estado activo si existe
      const estadoActivo = this.estados.find((e) => e.nombre?.toLowerCase() === 'activo');
      if (estadoActivo) {
        this.estadoActivoId = String(estadoActivo.id_estado);
        this.filtroEstado = this.estadoActivoId;
        preloaded.permisos = (preloaded.permisos || []).filter(
          (p: any) => String(p.id_estado) === String(this.estadoActivoId)
        );
      }
      let permisosFiltrados = preloaded.permisos || [];
      this.procesarDatos(permisosFiltrados, preloaded.total || permisosFiltrados.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  /**
   * @description Aplica los filtros de búsqueda sobre la lista de permisos y luego limpia los campos de filtro.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  aplicarFiltros() {
    // Lógica extensible para futuros filtros
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((p) => (p.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((p) => String(p.id_estado) === String(this.filtroEstado));
    }
    // Aquí se pueden agregar más filtros fácilmente
    this.procesarDatos(filtrados, filtrados.length);
    // Limpiar todos los filtros (igual que usuarios-page)
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  /**
   * @description Limpia los campos de filtro y restaura la lista completa de permisos.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.procesarDatos(this.data, this.data.length);
  }

  /**
   * @description Carga inicial (alias) usado por otras páginas para refrescar la lista.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  /**
   * Refresca los datos de la tabla de permisos.
   */
  async refrescar(): Promise<void> {
    // Refresca la página actual con los filtros activos
    await this.cargarDatosAsync();
  }

  /**
   * @description Carga todos los datos requeridos de forma asíncrona y en orden.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async cargarDatosAsync() {
    let pending = true;
    setTimeout(() => {
      if (pending) {
        this.loading = true;
      }
    });
    this.error = undefined;
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const results = await firstValueFrom(
        forkJoin({
          permisosRes: this.api.get<any>('permisos', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { permisosRes } = results;
        // Manejo global de errores
        if (permisosRes?.error) {
          this.error = permisosRes.msg || 'Error al cargar permisos';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(permisosRes)
          ? permisosRes
          : Array.isArray(permisosRes?.permisos)
          ? permisosRes.permisos
          : [];
        this.procesarDatos(rows, permisosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar permisos';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * @description Procesa los datos crudos de permisos para la tabla.
   * Centraliza la lógica para usarla tanto en carga inicial como en refresco.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  private procesarDatos(rows: any[], total: number) {
    // Mapear los nombres de las FK para mostrar en la tabla
    this.data = (Array.isArray(rows) ? rows : []).map((p: any) => {
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(p.id_estado))?.nombre || '';
      return {
        ...p,
        nombre_estado,
      };
    });
    let camposLista: string[] = [];
    let camposCrear: string[] = [];
    let camposEditar: string[] = [];
    let camposDetalle: string[] = [];
    if (this.atributos && this.atributos.length > 0) {
      camposLista = this.atributos
        .filter((a: any) => a.ver_en_lista !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposCrear = this.atributos
        .filter((a: any) => a.ver_en_crear !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposEditar = this.atributos
        .filter((a: any) => a.ver_en_editar !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
      camposDetalle = this.atributos
        .filter((a: any) => a.ver_en_detalle !== false && !a.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((a: any) => a.key || a.nombre || a.campo);
    } else {
      camposLista = (Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [])
        .filter((f: any) => f.ver_en_lista && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposCrear = (Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [])
        .filter((f: any) => f.ver_en_crear && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposEditar = (Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [])
        .filter((f: any) => f.ver_en_editar && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposDetalle = (Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [])
        .filter((f: any) => f.ver_en_detalle && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
    }
    this.camposLista = camposLista;
    this.camposCrear = camposCrear;
    this.camposEditar = camposEditar;
    this.camposDetalle = camposDetalle;
    if (this.data && this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      this.formattedData = this.data.map((p: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = p[k];
        }
        return obj;
      });
    } else {
      this.formattedData = [];
    }
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    // Lógica robusta y extensible igual a usuarios-page
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    this.cargarDatosAsync();
  }

  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
    this.cargarDatosAsync();
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  async openCreateModal() {
    this.modalTitle = 'Crear permiso';
    this.modalFields = [];
    this.modalValues = {};
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalLoading = true;
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      if (!this.datosListos) {
        await this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value:
              e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
                ? String(e.id_estado)
                : e.id != null && e.id !== '' && !isNaN(Number(e.id))
                ? String(e.id)
                : '',
            label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions }, {}, false);
        this.modalValues = {};
        for (const f of this.modalFields) {
          if (f.type === 'select') {
            this.modalValues[f.key] = f.value != null && f.value !== '' ? f.value : null;
          } else {
            this.modalValues[f.key] = f.value ?? '';
          }
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.cdr.detectChanges();
    }
  }

  async onEdit(permiso: any) {
    try {
      await this.openEditModal(permiso);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición del permiso: ' + (err?.message || ''));
    }
  }

  async openEditModal(permiso: any) {
    this.modalTitle = 'Editar permiso';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalEditingId = null;
    this.modalLoading = true;
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();
    try {
      const pRow = permiso ? { ...permiso } : {};
      const id = pRow.id || pRow.id_permiso || pRow.ID;
      if (!id) throw new Error('Permiso sin ID');
      let pDetail = pRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`permisos/${id}`));
        const payload = res?.data ?? res;
        if (payload) pDetail = { ...pDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos) {
        await this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value:
              e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
                ? String(e.id_estado)
                : e.id != null && e.id !== '' && !isNaN(Number(e.id))
                ? String(e.id)
                : '',
            label: e.nombre ?? e.title ?? String(e.id_estado ?? e.id ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions }, pDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => {
          if (pDetail && pDetail[f.key] !== undefined && pDetail[f.key] !== null) {
            values[f.key] = String(pDetail[f.key]);
          } else {
            values[f.key] = f.value ?? '';
          }
        });
        this.modalValues = values;
        this.modalEditingId = pDetail.id_permiso || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el permiso para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(permiso: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: permiso?.nombre ?? '' };
      this.modalTitle = 'Eliminar permiso';
      this.modalEditingId = Number(permiso?.id || permiso?.id_permiso || permiso?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'permisos');
      this.modalOpen = false;
      this.modalDeleteMode = false;
      this.modalEditingId = null;
      this.cdr.detectChanges();
      if (!success) return;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.cargarDatosAsync();
      this.cdr.detectChanges();
    } catch (e) {
      this.notify.warning('Error al confirmar el modal');
    }
  }

  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  openNewPermiso(): void {}

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = PERMISO_SCHEMA && Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        verEnCrear: !!s.verEnCrear,
        verEnEditar: !!s.verEnEditar,
        verEnLista: !!s.verEnLista,
        hidden: isEdit ? !s.verEnEditar : !s.verEnCrear,
        // robustez: valor por defecto y opciones
        value:
          defaults && typeof defaults === 'object' && defaults[key] != null
            ? String(defaults[key])
            : '',
      };
      if (base.type === 'select') {
        if (key === 'id_estado') base.options = estadoOptions;
        else if (
          key === 'activo' ||
          key === 'habilitado' ||
          key === 'visible' ||
          key === 'borrado'
        ) {
          base.options = [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ];
        }
      }
      return base;
    });
    return fields;
  }
  /**
   * Devuelve las columnas visibles en la tabla de permisos.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(PERMISO_SCHEMA) ? PERMISO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
