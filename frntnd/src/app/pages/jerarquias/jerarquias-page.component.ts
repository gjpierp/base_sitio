import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { JerarquiaEntity } from '../../models/entities/jerarquia.entity';
import { JERARQUIA_SCHEMA } from '../../models/schema/jerarquia.schema';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

/**
 * Componente para la gestión y listado de jerarquías en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 09-01-2026 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de jerarquías.
 */
@Component({
  selector: 'page-jerarquias',
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
  templateUrl: './jerarquias-page.component.html',
  styleUrls: ['./jerarquias-page.component.css'],
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
export class JerarquiasPageComponent implements OnInit {
  title = 'Jerarquías';
  subtitle = 'Jerarquías';
  filtroNombre: string = '';
  filtroEstado: string = '';
  estados: EstadoEntity[] = [];
  data: JerarquiaEntity[] = [];
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
  jerarquiaAEliminar: any = null;
  page: number = 1;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private ngZone = inject(NgZone);

  /**
   * @description Constructor de la clase JerarquiasPageComponent.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  constructor() {}

  /**
   * @description Método de inicialización del componente.
   * Carga los datos precargados por el Resolver o los obtiene de forma asíncrona.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      let jerarquiasFiltradas = preloaded.jerarquias || [];
      this.procesarDatos(jerarquiasFiltradas, preloaded.total || jerarquiasFiltradas.length);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
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
          estados: this.api.get<any>('estados'),
          jerarquiasRes: this.api.get<any>('jerarquias', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        // Manejo global de errores
        const { estados, jerarquiasRes } = results;
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
        if (jerarquiasRes?.error) {
          this.error = jerarquiasRes.msg || 'Error al cargar jerarquías';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(jerarquiasRes)
          ? jerarquiasRes
          : jerarquiasRes?.jerarquias || jerarquiasRes?.data || [];
        this.procesarDatos(rows, jerarquiasRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar jerarquías';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * @description Procesa los datos crudos de jerarquías para la tabla.
   * Centraliza la lógica para usarla tanto en carga inicial como en refresco.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((j: any) => ({
      ...j,
      nombre: j['nombre'] || '',
      nombre_estado: j['nombre_estado'] || '',
    }));
    this.formattedData = this.data.map((j) => ({
      ...j,
      nombre: j['nombre'] || '',
      nombre_estado: j['nombre_estado'] || '',
    }));
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /**
   * @description Recarga la lista de jerarquías (alias de load).
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  reload(evt?: any) {
    this.load();
  }

  /**
   * @description Inicia el flujo de eliminación para una jerarquía (abre modal).
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  delete(jerarquia: any) {
    this.modalTitle = 'Eliminar jerarquía';
    this.modalDeleteMode = true;
    this.modalOpen = true;
    this.modalValues = { ...jerarquia };
    this.jerarquiaAEliminar = jerarquia;
    this.cdr.detectChanges();
  }

  /**
   * @description Abre el modal de creación o edición según corresponda.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async openModal(jerarquia?: any) {
    if (jerarquia) {
      await this.openEditModal(jerarquia);
    } else {
      await this.openCreateModal();
    }
  }

  /**
   * @description Aplica los filtros de búsqueda sobre la lista de jerarquías y limpia los campos de filtro.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((j) => (j.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((j) => String(j.id_estado) === String(this.filtroEstado));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  /**
   * @description Limpia los campos de filtro y restaura la lista completa de jerarquías.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.formattedData = this.data;
    this.total = this.data.length;
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
   * @description Refresca los datos de la tabla de jerarquías.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  /**
   * @description Maneja cambios de paginación, búsqueda y orden en la tabla.
   * @author Gerardo Paiva
   * @date 09-01-2026
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
   * @description Maneja el cambio de tamaño de página, actualizando la paginación.
   * @author Gerardo Paiva
   * @date 09-01-2026
   * @param size El nuevo tamaño de página seleccionado.
   */
  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
  }

  /**
   * @description Notifica que la tabla está lista para renderizar y dispara detección de cambios.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  /**
   * @description Abre el modal de creación de jerarquía y carga opciones en background.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async openCreateModal() {
    this.modalTitle = 'Crear jerarquía';
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
   * @description Inicia el flujo de edición para una jerarquía (abre modal).
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async onEdit(jerarquia: any) {
    try {
      await this.openEditModal(jerarquia);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición de la jerarquía: ' + (err?.message || ''));
    }
  }

  /**
   * @description Abrir modal de edición y precargar campos/valores.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  openEditModal(jerarquia: any) {
    this.modalTitle = 'Editar jerarquía';
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
      const jRow = jerarquia ? { ...jerarquia } : {};
      const id = jRow.id || jRow.id_jerarquia || jRow.ID;
      if (!id) throw new Error('Jerarquía sin ID');
      let jDetail = jRow;
      try {
        const res: any = firstValueFrom(this.api.get(`jerarquias/${id}`));
        const payload = res?.data ?? res;
        if (payload) jDetail = { ...jDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos) {
        this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const mapOpts = (arr: any[], idKey: string, labelKey: string) =>
          (Array.isArray(arr) ? arr : [])
            .filter((x) => x)
            .map((x) => ({
              value: String(x[idKey] ?? x.id ?? ''),
              label: x[labelKey] ?? x.nombre ?? x.title ?? String(x[idKey] ?? ''),
            }));
        const estadoOptions = mapOpts(this.estados, 'id_estado', 'nombre');
        this.modalFields = this.buildFields({ estadoOptions }, jDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = jDetail.id_jerarquia || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la jerarquía para edición');
      this.cdr.detectChanges();
    }
  }

  /**
   * @description Muestra confirmación para eliminar una jerarquía (abre modal de confirmación).
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  onRemove(jerarquia: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: jerarquia?.nombre ?? '' };
      this.modalTitle = 'Eliminar jerarquía';
      this.modalEditingId = Number(jerarquia?.id || jerarquia?.id_jerarquia || jerarquia?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  /**
   * @description Confirma la acción del modal (crear/editar/borrar)
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'jerarquias');
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
   * @description Se ejecuta al cerrar el modal; limpia estado y delega al helper genérico.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  onModalClosed(): void {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  /**
   * @description Método legacy para compatibilidad; no realiza acción (no-op).
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  openNewJerarquia(): void {}

  /**
   * @description Construye el array de campos del modal basándose en el modelo `jerarquía`.
   * Permite inyectar opciones (estados) y valores por defecto.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = Array.isArray(JERARQUIA_SCHEMA) ? JERARQUIA_SCHEMA : [];
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
      }
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        candidates.push(baseKey, `${baseKey}_id`, `${baseKey}Id`);
        candidates.push(`${baseKey}_nombre`, `nombre_${baseKey}`, `${baseKey}_name`);
      }
      if (key.endsWith('_jerarquia')) {
        const baseKey = key.replace(/_jerarquia$/, '');
        candidates.push(baseKey, 'nombre', 'name');
      }
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_jerarquia', 'ID');
        } else if (key === 'nombre') {
          candidates.push('name', 'nombre_jerarquia');
        }
      }
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
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        val = val.id ?? val[key] ?? val.id_jerarquia ?? val.id_estado ?? val;
      }
      if (typeof val === 'undefined') {
        if (key === 'nombre') val = defaults.nombre ?? '';
        else val = '';
      }
      let strVal = val == null ? '' : String(val);
      if (base.type === 'select' && Array.isArray(base.options) && strVal !== '') {
        const matchValue = base.options.find((o: any) => String(o.value) === strVal);
        if (!matchValue) {
          const matchLabel = base.options.find(
            (o: any) => o.label && String(o.label).toLowerCase() === strVal.toLowerCase()
          );
          if (matchLabel) {
            strVal = String(matchLabel.value);
          }
        }
      }
      base.value = strVal;
      return base;
    });
    return fields;
  }

  /**
   * @description Devuelve las columnas visibles en la tabla de jerarquías.
   * @author Gerardo Paiva
   * @date 09-01-2026
   */
  get columns(): { key: string; label: string }[] {
    return (Array.isArray(JERARQUIA_SCHEMA) ? JERARQUIA_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
