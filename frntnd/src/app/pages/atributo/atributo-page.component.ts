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

import { AtributoEntity } from '../../models/entities/atributo.entity';
import { ATRIBUTO_SCHEMA } from '../../models/schema/atributo.schema';
import { EntidadEntity } from '../../models/entities/entidad.entity';
import { EstadoEntity } from '../../models/entities/estado.entity';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';

@Component({
  selector: 'page-atributo',
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
  templateUrl: './atributo-page.component.html',
  styleUrls: ['./atributo-page.component.css'],
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

/**
 * Componente para la gestión y listado de atributos en el sistema.
 * Basado en la lógica robusta de UsuariosPageComponent.
 */
export class AtributoPageComponent implements OnInit {
  title = 'Atributos';
  subtitle = 'Atributos';
  atributos: any[] = [];
  filtroNombreColumna: string = '';
  filtroEntidad: string = '';
  filtroEstado: string = '';
  entidades: EntidadEntity[] = [];
  estados: EstadoEntity[] = [];
  data: AtributoEntity[] = [];
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
  atributoAEliminar: any = null;
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
      this.entidades = preloaded.entidades || [];
      this.estados = preloaded.estados || [];
      let atributosFiltrados = preloaded.atributos || [];
      this.procesarDatos(atributosFiltrados, preloaded.total || atributosFiltrados.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombreColumna) {
      const nombre = this.filtroNombreColumna.toLowerCase();
      filtrados = filtrados.filter((a) => (a.nombre_columna || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEntidad) {
      filtrados = filtrados.filter((a) => String(a.id_entidad) === String(this.filtroEntidad));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((a) => String(a.id_estado) === String(this.filtroEstado));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombreColumna = '';
    this.filtroEntidad = '';
    this.filtroEstado = '';
  }

  limpiarFiltros() {
    this.filtroNombreColumna = '';
    this.filtroEntidad = '';
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
          entidades: this.api.get<any>('entidades'),
          estados: this.api.get<any>('estados'),
          atributosRes: this.api.get<any>('atributos', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { entidades, estados, atributosRes } = results;
        this.entidades = Array.isArray(entidades)
          ? entidades
          : (typeof entidades === 'object' &&
            entidades !== null &&
            Array.isArray((entidades as any)['entidades'])
              ? (entidades as any)['entidades']
              : Array.isArray((entidades as any)['data'])
              ? (entidades as any)['data']
              : []) || [];
        this.estados = Array.isArray(estados)
          ? estados
          : (typeof estados === 'object' &&
            estados !== null &&
            Array.isArray((estados as any)['estados'])
              ? (estados as any)['estados']
              : Array.isArray((estados as any)['data'])
              ? (estados as any)['data']
              : []) || [];
        const rows = Array.isArray(atributosRes)
          ? atributosRes
          : Array.isArray(atributosRes?.atributos)
          ? atributosRes.atributos
          : [];
        this.procesarDatos(rows, atributosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar atributos';
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
      const nombre_entidad =
        this.entidades.find((e) => String(e.id_entidad) === String(a.id_entidad))?.alias_nombre ||
        '';
      const nombre_estado =
        this.estados.find((e) => String(e.id_estado) === String(a.id_estado))?.nombre || '';
      return {
        ...a,
        nombre_entidad,
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
      camposLista = (Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [])
        .filter((f: any) => f.verEnLista && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposCrear = (Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [])
        .filter((f: any) => f.verEnCrear && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposEditar = (Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [])
        .filter((f: any) => f.verEnEditar && !f.hidden)
        .sort((a: any, b: any) => (a.orden ?? 999) - (b.orden ?? 999))
        .map((f: any) => f.key);
      camposDetalle = (Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [])
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
      this.formattedData = this.data.map((a: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = a[k];
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
    this.modalTitle = 'Crear atributo';
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
        const entidadOptions = (Array.isArray(this.entidades) ? this.entidades : [])
          .filter((e) => e)
          .map((e: any) => ({
            value: String(e.id_entidad),
            label: e.alias_nombre ?? e.nombre_tabla ?? String(e.id_entidad),
          }));
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value: String(e.id_estado),
            label: e.nombre ?? String(e.id_estado),
          }));
        this.modalFields = this.buildFields({ entidadOptions, estadoOptions }, {}, false);
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

  async onEdit(atributo: any) {
    try {
      await this.openEditModal(atributo);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición del atributo: ' + (err?.message || ''));
    }
  }

  openEditModal(atributo: any) {
    this.modalTitle = 'Editar atributo';
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
      const aRow = atributo ? { ...atributo } : {};
      const id = aRow.id || aRow.id_atributo || aRow.ID;
      if (!id) throw new Error('Atributo sin ID');
      let aDetail = aRow;
      try {
        const res: any = firstValueFrom(this.api.get(`atributos/${id}`));
        const payload = res?.data ?? res;
        if (payload) aDetail = { ...aDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos || !this.entidades?.length) {
        this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const entidadOptions = (Array.isArray(this.entidades) ? this.entidades : [])
          .filter((e) => e)
          .map((e: any) => ({
            value: String(e.id_entidad),
            label: e.alias_nombre ?? e.nombre_tabla ?? String(e.id_entidad),
          }));
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value: String(e.id_estado),
            label: e.nombre ?? String(e.id_estado),
          }));
        this.modalFields = this.buildFields({ entidadOptions, estadoOptions }, aDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = aDetail.id_atributo || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el atributo para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(atributo: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre_columna: atributo?.nombre_columna ?? '' };
      this.modalTitle = 'Eliminar atributo';
      this.modalEditingId = Number(atributo?.id || atributo?.id_atributo || atributo?.ID);
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
      const success = await onModalConfirmGeneric(this, 'atributos');
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

  openNewAtributo(): void {}

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const entidadOptions = opts.entidadOptions ?? [];
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields = ATRIBUTO_SCHEMA && Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [];
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
        if (key === 'id_entidad') base.options = entidadOptions;
        else if (key === 'id_estado') base.options = estadoOptions;
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
          candidates.push('id_atributo', 'ID');
        } else if (key === 'nombre_columna') {
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
        val = val.id ?? val[key] ?? val.id_atributo ?? val.id_entidad ?? val.id_estado ?? val;
      }
      if (typeof val === 'undefined') {
        if (key === 'nombre_columna') val = defaults.nombre ?? '';
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
    return (Array.isArray(ATRIBUTO_SCHEMA) ? ATRIBUTO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
