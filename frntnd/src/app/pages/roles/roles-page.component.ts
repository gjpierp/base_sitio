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
import { ROLE_SCHEMA } from '../../models/schema/role.schema';

/**
 * Componente para la gestión y listado de roles en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 09-01-2026 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de roles.
 */
@Component({
  selector: 'page-roles',
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
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.css'],
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
export class RolesPageComponent implements OnInit {
  title = 'Roles';
  subtitle = 'Roles';
  filtroNombre: string = '';
  filtroEstado: string = '';
  estados: any[] = [];
  data: any[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
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
  rolAEliminar: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  /**
   * Inicialización del componente. Carga datos precargados o los obtiene asíncronamente.
   */
  async ngOnInit() {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      let rolesFiltrados = preloaded.roles || [];
      this.procesarDatos(rolesFiltrados, preloaded.total || rolesFiltrados.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  /**
   * Aplica los filtros de búsqueda sobre la lista de roles y limpia los campos de filtro.
   */
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((r) => (r.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((r) => String(r.id_estado) === String(this.filtroEstado));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  /**
   * Limpia los campos de filtro y restaura la lista completa de roles.
   */
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.procesarDatos(this.data, this.data.length);
  }

  /**
   * Carga inicial (alias) usado por otras páginas para refrescar la lista.
   */
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  /**
   * Refresca los datos de la tabla de roles.
   */
  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  /**
   * Carga todos los datos requeridos de forma asíncrona y en orden.
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
          estados: this.api.get<any>('estados'),
          rolesRes: this.api.get<any>('roles', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { estados, rolesRes } = results;
        // Manejo global de errores
        if (estados?.error) {
          this.error = estados.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = Array.isArray(estados)
            ? estados
            : (typeof estados === 'object' &&
              estados !== null &&
              Array.isArray((estados as any)['estados'])
                ? (estados as any)['estados']
                : Array.isArray((estados as any)['data'])
                ? (estados as any)['data']
                : []) || [];
        }
        if (rolesRes?.error) {
          this.error = rolesRes.msg || 'Error al cargar roles';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(rolesRes)
          ? rolesRes
          : Array.isArray(rolesRes?.roles)
          ? rolesRes.roles
          : [];
        this.procesarDatos(rows, rolesRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar roles';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Procesa los datos crudos de roles para la tabla, mapeando nombres de FK.
   */
  private procesarDatos(rows: any[], total: number) {
    // Mapear los nombres de las FK para mostrar en la tabla
    this.data = (Array.isArray(rows) ? rows : []).map((r: any) => {
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(r.id_estado))?.nombre || '';
      return {
        ...r,
        nombre_estado,
      };
    });
    if (this.data && this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      this.formattedData = this.data.map((r: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = r[k];
        }
        return obj;
      });
    } else {
      this.formattedData = [];
    }
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /**
   * Maneja cambios de paginación, búsqueda y orden en la tabla.
   */
  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    if (typeof this.cargarDatosAsync === 'function') {
      this.cargarDatosAsync();
    } else if (typeof this.load === 'function') {
      this.load();
    } else if (typeof this.refrescar === 'function') {
      this.refrescar();
    }
  }

  /**
   * Maneja el cambio de tamaño de página, actualizando la paginación.
   */
  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
  }

  /**
   * Notifica que la tabla está lista para renderizar y dispara detección de cambios.
   */
  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  /**
   * Abre el modal de creación de rol y carga opciones en background.
   */
  async openCreateModal() {
    this.modalTitle = 'Crear rol';
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

  /**
   * Inicia el flujo de edición para un rol (abre modal).
   */
  async onEdit(rol: any) {
    try {
      await this.openEditModal(rol);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición del rol: ' + (err?.message || ''));
    }
  }

  /**
   * Abrir modal de edición y precargar campos/valores.
   */
  async openEditModal(rol: any) {
    this.modalTitle = 'Editar rol';
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
      const rRow = rol ? { ...rol } : {};
      const id = rRow.id || rRow.id_rol || rRow.ID;
      if (!id) throw new Error('Rol sin ID');
      let rDetail = rRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`roles/${id}`));
        const payload = res?.data ?? res;
        if (payload) rDetail = { ...rDetail, ...payload };
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
        this.modalFields = this.buildFields({ estadoOptions }, rDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = rDetail.id_rol || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el rol para edición');
      this.cdr.detectChanges();
    }
  }

  /**
   * Muestra confirmación para eliminar un rol (abre modal de confirmación).
   */
  onRemove(rol: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: rol?.nombre ?? '' };
      this.modalTitle = 'Eliminar rol';
      this.modalEditingId = Number(rol?.id || rol?.id_rol || rol?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  /**
   * Confirma la acción del modal (crear/editar/borrar)
   */
  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'roles');
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

  /**
   * Se ejecuta al cerrar el modal; limpia estado y delega al helper genérico.
   */
  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  /**
   * Método legacy para compatibilidad; no realiza acción (no-op).
   */
  openNewRol(): void {}

  /**
   * Construye el array de campos del modal basándose en el modelo `rol`.
   * Permite inyectar opciones (estados) y valores por defecto.
   */
  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = ROLE_SCHEMA && Array.isArray(ROLE_SCHEMA) ? ROLE_SCHEMA : [];
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
      let val: any = undefined;
      if (defaults && typeof defaults === 'object') {
        val = defaults[key];
      }
      base.value = val == null ? '' : String(val);
      return base;
    });
    return fields;
  }

  /**
   * Devuelve las columnas visibles en la tabla de roles.
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(ROLE_SCHEMA) ? ROLE_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
