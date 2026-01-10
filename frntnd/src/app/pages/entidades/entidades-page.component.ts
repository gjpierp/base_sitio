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
import { EntidadEntity } from '../../models/entities/entidad.entity';
import { ENTIDAD_SCHEMA } from '../../models/schema/entidad.schema';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

@Component({
  selector: 'page-entidades',
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
  templateUrl: './entidades-page.component.html',
  styleUrls: ['./entidades-page.component.css'],
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
export class EntidadesPageComponent implements OnInit {
  title = 'Entidades';
  subtitle = 'Entidades';
  atributos: any[] = [];
  filtroNombre: string = '';
  filtroEstado: string = '';
  estados: EstadoEntity[] = [];
  data: EntidadEntity[] = [];
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
  entidadAEliminar: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {}

  async ngOnInit() {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.estados = preloaded.estados || [];
      let entidadesFiltradas = preloaded.entidades || [];
      this.procesarDatos(entidadesFiltradas, preloaded.total || entidadesFiltradas.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((e) =>
        (e.alias_nombre || e.nombre_tabla || '').toLowerCase().includes(nombre)
      );
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((e) => String(e.id_estado) === String(this.filtroEstado));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
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
          entidadesRes: this.api.get<any>('entidades', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { entidadesRes } = results;
        // Manejo global de errores
        if (entidadesRes?.error) {
          this.error = entidadesRes.msg || 'Error al cargar entidades';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(entidadesRes)
          ? entidadesRes
          : Array.isArray(entidadesRes?.entidades)
          ? entidadesRes.entidades
          : [];
        this.procesarDatos(rows, entidadesRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar entidades';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((e: any) => {
      const nombre_estado =
        this.estados.find((es) => String(es.id_estado) === String(e.id_estado))?.nombre || '';
      return {
        ...e,
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
      camposLista = (Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [])
        .filter((f: any) => f.verEnLista && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposCrear = (Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [])
        .filter((f: any) => f.verEnCrear && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposEditar = (Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [])
        .filter((f: any) => f.verEnEditar && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposDetalle = (Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [])
        .filter((f: any) => f.verEnDetalle && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
    }
    this.camposLista = camposLista;
    this.camposCrear = camposCrear;
    this.camposEditar = camposEditar;
    this.camposDetalle = camposDetalle;
    if (this.data && this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      this.formattedData = this.data.map((e: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = e[k];
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

  cambiarEstilo(evt: Event): void {
    const sel = (evt.target as HTMLSelectElement)?.value || 'base';
    const theme = sel === 'modern' ? 'modern' : 'base';
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      this.notify.warning('No se pudo cambiar el tema');
    }
  }

  async openCreateModal() {
    this.modalTitle = 'Crear entidad';
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
            value: String(e.id_estado),
            label: e.nombre ?? String(e.id_estado),
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

  async onEdit(entidad: any) {
    try {
      await this.openEditModal(entidad);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición de la entidad: ' + (err?.message || ''));
    }
  }

  openEditModal(entidad: any) {
    this.modalTitle = 'Editar entidad';
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
      const eRow = entidad ? { ...entidad } : {};
      const id = eRow.id || eRow.id_entidad || eRow.ID;
      if (!id) throw new Error('Entidad sin ID');
      let eDetail = eRow;
      try {
        const res: any = firstValueFrom(this.api.get(`entidades/${id}`));
        const payload = res?.data ?? res;
        if (payload) eDetail = { ...eDetail, ...payload };
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
            value: String(e.id_estado),
            label: e.nombre ?? String(e.id_estado),
          }));
        this.modalFields = this.buildFields({ estadoOptions }, eDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = eDetail.id_entidad || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la entidad para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(entidad: any) {
    try {
      this.modalFields = [];
      this.modalValues = { alias_nombre: entidad?.alias_nombre ?? '' };
      this.modalTitle = 'Eliminar entidad';
      this.modalEditingId = Number(entidad?.id || entidad?.id_entidad || entidad?.ID);
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
      const success = await onModalConfirmGeneric(this, 'entidades');
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

  openNewEntidad(): void {}

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = ENTIDAD_SCHEMA && Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [];
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
      if (!key.startsWith('id_')) {
        if (key === 'id') {
          candidates.push('id_entidad', 'ID');
        } else if (key === 'alias_nombre' || key === 'nombre_tabla') {
          candidates.push('name', 'nombre');
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
        val = val.id ?? val[key] ?? val.id_entidad ?? val.id_estado ?? val;
      }
      if (typeof val === 'undefined') {
        if (key === 'alias_nombre' || key === 'nombre_tabla') val = defaults.nombre ?? '';
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

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(ENTIDAD_SCHEMA) ? ENTIDAD_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
