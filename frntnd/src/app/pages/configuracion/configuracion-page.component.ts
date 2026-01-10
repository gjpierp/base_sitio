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
import { ConfiguracionEntity } from '../../models/entities/configuracion.entity';
import { CONFIGURACION_SCHEMA } from '../../models/schema/configuracion.schema';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

@Component({
  selector: 'page-configuracion',
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
  templateUrl: './configuracion-page.component.html',
  styleUrls: ['./configuracion-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfiguracionPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Configuraciones';
  subtitle = 'Configuraciones del sistema';

  // Filtros de búsqueda
  filtroClave: string = '';
  filtroValor: string = '';
  filtroEstado: string = '';
  filtroUsuario: string = '';

  // Datos referenciales y de tabla
  estados: EstadoEntity[] = [];
  usuarios: any[] = [];
  data: ConfiguracionEntity[] = [];
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
  configuracionAEliminar: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  async ngOnInit() {
    await this.cargarDatosAsync();
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroClave) {
      const clave = this.filtroClave.toLowerCase();
      filtrados = filtrados.filter((c) => (c.clave || '').toLowerCase().includes(clave));
    }
    if (this.filtroValor) {
      const valor = this.filtroValor.toLowerCase();
      filtrados = filtrados.filter((c) => (c.valor || '').toLowerCase().includes(valor));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((c) => String(c.id_estado) === String(this.filtroEstado));
    }
    if (this.filtroUsuario) {
      filtrados = filtrados.filter((c) => String(c.id_usuario) === String(this.filtroUsuario));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroClave = '';
    this.filtroValor = '';
    this.filtroEstado = '';
    this.filtroUsuario = '';
  }

  limpiarFiltros() {
    this.filtroClave = '';
    this.filtroValor = '';
    this.filtroEstado = '';
    this.filtroUsuario = '';
    this.procesarDatos(this.data, this.data.length);
  }

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
          configuracionesRes: this.api.get<any>('configuraciones', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { configuracionesRes } = results;
        const rows = Array.isArray(configuracionesRes)
          ? configuracionesRes
          : Array.isArray(configuracionesRes?.configuraciones)
          ? configuracionesRes.configuraciones
          : [];
        this.procesarDatos(rows, configuracionesRes?.total);
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
          this.error = 'No se pudo cargar configuraciones';
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
    this.data = (Array.isArray(rows) ? rows : []).map((c: any) => {
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(c.id_estado))?.nombre || '';
      const nombre_usuario =
        this.usuarios.find((u) => String(u.id_usuario) === String(c.id_usuario))?.nombre || '';
      return {
        ...c,
        nombre_estado,
        nombre_usuario,
      };
    });
    this.formattedData = this.data.map((c) => ({ ...c }));
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

  async openCreateModal() {
    this.modalTitle = 'Crear configuración';
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
            value: String(e.id_estado ?? e.id ?? ''),
            label: e.nombre ?? e.title ?? String(e.id_estado ?? ''),
          }));
        const usuarioOptions = (Array.isArray(this.usuarios) ? this.usuarios : [])
          .filter((u) => u)
          .map((u: any) => ({
            value: String(u.id_usuario ?? u.id ?? ''),
            label: u.nombre ?? u.title ?? String(u.id_usuario ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions, usuarioOptions }, {}, false);
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

  async onEdit(configuracion: any) {
    try {
      await this.openEditModal(configuracion);
      return;
    } catch (err: any) {
      this.notify.warning(
        'No se pudo iniciar la edición de la configuración: ' + (err?.message || '')
      );
    }
  }

  openEditModal(configuracion: any) {
    this.modalTitle = 'Editar configuración';
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
      const cRow = configuracion ? { ...configuracion } : {};
      const id = cRow.id || cRow.id_configuracion || cRow.ID;
      if (!id) throw new Error('Configuración sin ID');
      let cDetail = cRow;
      try {
        const res: any = firstValueFrom(this.api.get(`configuraciones/${id}`));
        const payload = res?.data ?? res;
        if (payload) cDetail = { ...cDetail, ...payload };
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
        const usuarioOptions = (Array.isArray(this.usuarios) ? this.usuarios : [])
          .filter((u) => u)
          .map((u: any) => ({
            value: String(u.id_usuario ?? u.id ?? ''),
            label: u.nombre ?? u.title ?? String(u.id_usuario ?? ''),
          }));
        this.modalFields = this.buildFields({ estadoOptions, usuarioOptions }, cDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = cDetail.id_configuracion || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la configuración para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(configuracion: any) {
    try {
      this.modalFields = [];
      this.modalValues = { clave: configuracion?.clave ?? '' };
      this.modalTitle = 'Eliminar configuración';
      this.modalEditingId = Number(
        configuracion?.id || configuracion?.id_configuracion || configuracion?.ID
      );
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
      const success = await onModalConfirmGeneric(this, 'configuraciones');
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

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const usuarioOptions = opts.usuarioOptions ?? [];
    const schemaFields =
      CONFIGURACION_SCHEMA && Array.isArray(CONFIGURACION_SCHEMA) ? CONFIGURACION_SCHEMA : [];
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
        else if (key === 'id_usuario') base.options = usuarioOptions;
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
      const candidates: string[] = [];
      candidates.push(key);
      if (s.alias) candidates.push(s.alias);
      if (key.startsWith('id_')) {
        const baseKey = key.slice(3);
        candidates.push(baseKey, `${baseKey}_id`, `${baseKey}Id`);
        candidates.push(`${baseKey}_nombre`, `nombre_${baseKey}`, `${baseKey}_name`);
      }
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_configuracion', 'ID');
        } else if (key === 'clave') {
          candidates.push('key', 'clave_configuracion');
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
        val = val.id ?? val[key] ?? val.id_configuracion ?? val.id_estado ?? val;
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

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(CONFIGURACION_SCHEMA) ? CONFIGURACION_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
