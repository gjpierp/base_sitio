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
import { APLICACION_SITIO_SCHEMA } from '../../models/schema/aplicacion-sitio.schema';
import { AplicacionSitioEntity } from '../../models/entities/aplicacion-sitio.entity';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { SitioEntity } from '../../models/entities/sitio.entity';
import { EntidadEntity } from '../../models/entities/entidad.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

/**
 * Componente para la gestión y listado de aplicaciones de sitio en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de aplicaciones de sitio.
 */
@Component({
  selector: 'page-aplicaciones-sitio',
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
  templateUrl: './aplicaciones-sitio-page.component.html',
  styleUrls: ['./aplicaciones-sitio-page.component.css'],
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
export class AplicacionesSitioPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Aplicaciones de Sitio';
  subtitle = 'Aplicaciones de Sitio';

  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroEstado: string = '';
  filtroSitio: string = '';
  filtroEntidad: string = '';
  estadoActivoId: string = '';

  // Datos referenciales y de tabla
  estados: EstadoEntity[] = [];
  sitios: SitioEntity[] = [];
  entidades: EntidadEntity[] = [];
  data: AplicacionSitioEntity[] = [];
  formattedData: any[] = [];

  // Estado de carga
  loading = false;
  error?: string;
  datosListos = false;

  // Paginación
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;

  // Modal
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  aplicacionAEliminar: any = null;

  // Inyecciones
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {}

  // 2. Ciclo de Vida
  async ngOnInit() {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      const estadoActivo = this.estados.find((e) => e.nombre?.toLowerCase() === 'activo');
      let aplicacionesFiltradas = preloaded.aplicacionesSitio || [];
      if (estadoActivo) {
        this.estadoActivoId = String(estadoActivo.id_estado);
        this.filtroEstado = this.estadoActivoId;
        aplicacionesFiltradas = aplicacionesFiltradas.filter(
          (a: any) => String(a.id_estado) === String(this.estadoActivoId)
        );
      }
      await this.cargarReferenciales();
      this.procesarDatos(aplicacionesFiltradas, preloaded.total || aplicacionesFiltradas.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  private async cargarReferenciales() {
    // Cargar sitios y entidades para selects robustos
    try {
      const [sitios, entidades] = await Promise.all([
        firstValueFrom(this.api.get<any>('sitios')),
        firstValueFrom(this.api.get<any>('entidades')),
      ]);
      this.sitios = Array.isArray(sitios) ? sitios : sitios?.data || sitios?.sitios || [];
      this.entidades = Array.isArray(entidades)
        ? entidades
        : entidades?.data || entidades?.entidades || [];
    } catch {
      this.sitios = [];
      this.entidades = [];
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((a) => (a.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((a) => String(a.id_estado) === String(this.filtroEstado));
    }
    if (this.filtroSitio) {
      filtrados = filtrados.filter((a) => String(a.id_sitio) === String(this.filtroSitio));
    }
    if (this.filtroEntidad) {
      filtrados = filtrados.filter((a) => String(a.id_entidad) === String(this.filtroEntidad));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroSitio = '';
    this.filtroEntidad = '';
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroSitio = '';
    this.filtroEntidad = '';
    this.procesarDatos(this.data, this.data.length);
  }

  // 4. Carga y Procesamiento de Datos
  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
  }

  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

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
          aplicacionesRes: this.api.get<any>('aplicaciones_sitio', {
            desde: offset,
            limite: this.pageSize,
          }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { estados, aplicacionesRes } = results;
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
        const rows = Array.isArray(aplicacionesRes)
          ? aplicacionesRes
          : aplicacionesRes?.aplicaciones ||
            aplicacionesRes?.aplicacionesSitio ||
            aplicacionesRes?.data ||
            [];
        this.procesarDatos(rows, aplicacionesRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        // Manejo robusto de errores de red y autenticación
        const status = (err as any)?.status;
        if (status === 401) {
          this.error = 'No autorizado. Por favor, inicia sesión.';
        } else if ((err as any)?.msg) {
          this.error = (err as any).msg;
        } else {
          this.error = 'No se pudo cargar aplicaciones.';
        }
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((a: any) => {
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(a.id_estado))?.nombre || '';
      const nombre_sitio =
        this.sitios.find((s) => String(s.id_sitio) === String(a.id_sitio))?.nombre || '';
      const nombre_entidad =
        this.entidades.find((en) => String(en.id_entidad) === String(a.id_entidad))?.alias_nombre ||
        '';
      return {
        ...a,
        nombre_estado,
        nombre_sitio,
        nombre_entidad,
      };
    });
    // Normalizar campos de la tabla según el esquema
    const schema = Array.isArray(APLICACION_SITIO_SCHEMA) ? APLICACION_SITIO_SCHEMA : [];
    let camposLista: string[] = [];
    let camposCrear: string[] = [];
    let camposEditar: string[] = [];
    let camposDetalle: string[] = [];
    if (schema.length > 0) {
      camposLista = schema
        .filter((f: any) => f.verEnLista && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposCrear = schema
        .filter((f: any) => f.verEnCrear && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposEditar = schema
        .filter((f: any) => f.verEnEditar && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposDetalle = schema
        .filter((f: any) => f.verEnDetalle && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
    }
    this.formattedData = this.data.map((a) => ({ ...a }));
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // 5. Eventos de Tabla
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

  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  // 6. Gestión del Modal (Apertura)
  async openCreateModal() {
    this.modalTitle = 'Crear aplicación de sitio';
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

  async onEdit(aplicacion: any) {
    try {
      await this.openEditModal(aplicacion);
      return;
    } catch (err: any) {
      this.notify.warning(
        'No se pudo iniciar la edición de la aplicación: ' + (err?.message || '')
      );
    }
  }

  openEditModal(aplicacion: any) {
    this.modalTitle = 'Editar aplicación de sitio';
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
      const aRow = aplicacion ? { ...aplicacion } : {};
      const id = aRow.id || aRow.id_aplicacion || aRow.ID;
      if (!id) throw new Error('Aplicación sin ID');
      let aDetail = aRow;
      try {
        const res: any = firstValueFrom(this.api.get(`aplicaciones_sitio/${id}`));
        const payload = res?.data ?? res;
        if (payload) aDetail = { ...aDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos) {
        this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? e.title ?? String(e.id_estado ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions }, aDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = aDetail.id_aplicacion || id;
        if (typeof this.modalEditingId === 'string' && this.modalEditingId.includes('@')) {
          this.modalEditingId = aDetail.id_aplicacion || null;
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la aplicación para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(aplicacion: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: aplicacion?.nombre ?? '' };
      this.modalTitle = 'Eliminar aplicación de sitio';
      this.modalEditingId = Number(aplicacion?.id || aplicacion?.id_aplicacion || aplicacion?.ID);
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  // 7. Gestión del Modal (Cierre y Confirmación)
  async onModalConfirm(): Promise<void> {
    try {
      const success = await onModalConfirmGeneric(this, 'aplicaciones_sitio');
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

  openNewAplicacion(): void {}

  // 8. Helpers Privados
  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions =
      opts.estadoOptions ??
      (this.estados || []).map((e: any) => ({ value: String(e.id_estado), label: e.nombre }));
    const sitioOptions = (this.sitios || []).map((s: any) => ({
      value: String(s.id_sitio),
      label: s.nombre,
    }));
    const entidadOptions = (this.entidades || []).map((en: any) => ({
      value: String(en.id_entidad),
      label: en.alias_nombre,
    }));
    const schemaFields =
      APLICACION_SITIO_SCHEMA && Array.isArray(APLICACION_SITIO_SCHEMA)
        ? APLICACION_SITIO_SCHEMA
        : [];
    const fields: any[] = schemaFields.map((s: any) => {
      const key = s.key;
      const base: any = {
        key,
        label: s.label ?? key,
        type: s.type ?? 'text',
        readonly: !!s.readonly || (isEdit && !!s.readonlyOnEdit),
        hiddenOnCreate: !!s.hiddenOnCreate,
        hiddenOnEdit: !!s.hiddenOnEdit,
        hidden: !!s.hidden || (isEdit ? !!s.hiddenOnEdit : !!s.hiddenOnCreate),
      };
      if (base.type === 'select') {
        if (key === 'id_estado') {
          base.options = estadoOptions;
        } else if (key === 'id_sitio') {
          base.options = sitioOptions;
        } else if (key === 'id_entidad') {
          base.options = entidadOptions;
        } else if (
          key === 'activo' ||
          key === 'habilitado' ||
          key === 'visible' ||
          key === 'borrado'
        ) {
          base.options = [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ];
        } else if (s.options && Array.isArray(s.options)) {
          base.options = s.options;
        }
      }
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        candidates.push(baseKey, `${baseKey}_id`, `${baseKey}Id`);
        candidates.push(`${baseKey}_nombre`, `nombre_${baseKey}`, `${baseKey}_name`);
      }
      if (key.endsWith('_aplicacion')) {
        const baseKey = key.replace(/_aplicacion$/, '');
        candidates.push(baseKey, 'nombre', 'name');
      }
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_aplicacion', 'ID');
        } else if (key === 'nombre') {
          candidates.push('name', 'nombre_aplicacion');
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
        val = val.id ?? val[key] ?? val.id_aplicacion ?? val.id_estado ?? val;
      }
      if (typeof val === 'undefined') {
        val = '';
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

  // 9. Getters
  get columns(): { key: string; label: string }[] {
    return (APLICACION_SITIO_SCHEMA as any[])
      .filter((f) => (f.verEnLista !== false && !f.hidden) || f.showInTable)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
