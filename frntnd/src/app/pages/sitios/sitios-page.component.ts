import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { onPageChangeGeneric, onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';
import { SITIO_SCHEMA } from '../../models/sitio';

@Component({
  selector: 'page-sitios',
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
  templateUrl: './sitios-page.component.html',
  styleUrls: ['./sitios-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SitiosPageComponent implements OnInit {
  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroDominio: string = '';
  filtroEstado: string = '';

  title = 'Sitios';
  subtitle = 'Sitios registrados';
  data: any[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  total = 0;
  sitioAEliminar: any = null;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;
  currentPage = 1;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {}

  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.procesarDatosSitios(preloaded.sitios || [], preloaded.total || 0);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((s) => (s.nombre || '').toLowerCase().includes(nombre));
    }
    if (this.filtroDominio) {
      const dominio = this.filtroDominio.toLowerCase();
      filtrados = filtrados.filter((s) => (s.dominio || '').toLowerCase().includes(dominio));
    }
    if (this.filtroEstado) {
      const estado = this.filtroEstado.toLowerCase();
      filtrados = filtrados.filter((s) => (s.nombre_estado || '').toLowerCase().includes(estado));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroDominio = '';
    this.filtroEstado = '';
    this.formattedData = this.data;
    this.total = this.data.length;
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
      const res: any = await firstValueFrom(this.api.get<any>('sitios', { desde: 0 }));
      pending = false;
      this.ngZone.run(() => {
        const rows = res?.sitios || res?.data || [];
        this.procesarDatosSitios(rows, res?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar sitios';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  async load() {
    this.currentPage = 1;
    await this.cargarDatosAsync();
    try {
      this.total = this.formattedData.length;
    } catch {}
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    try {
      this.currentPage = Number(evt.page) || 1;
    } catch {}
    onPageChangeGeneric(this, evt, 'sitios', (r: any) => ({
      id: r.id_sitio ?? r.id ?? r.ID ?? '',
      nombre: r.nombre ?? r.nombre_sitio ?? '',
      dominio: r.dominio ?? r.url ?? r.host ?? '',
    }));
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  async openCreateModal() {
    this.modalTitle = 'Crear sitio';
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
      this.ngZone.run(() => {
        this.modalFields = this.buildSitioFields({}, {}, false);
        this.modalValues = {};
        for (const f of this.modalFields) {
          this.modalValues[f.key] = f.value ?? '';
        }
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.cdr.detectChanges();
    }
  }

  async onEdit(sitio: any) {
    try {
      await this.openEditModal(sitio);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición del sitio: ' + (err?.message || ''));
    }
  }

  async openEditModal(sitio: any) {
    this.modalTitle = 'Editar sitio';
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
      const sRow = sitio ? { ...sitio } : {};
      const id = sRow.id || sRow.id_sitio || sRow.ID;
      if (!id) throw new Error('Sitio sin ID');
      let sDetail = sRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`sitios/${id}`));
        const payload = res?.data ?? res;
        if (payload) sDetail = { ...sDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      this.ngZone.run(() => {
        this.modalFields = this.buildSitioFields({}, sDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = sDetail.id_sitio || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el sitio para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(sitio: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: sitio?.nombre ?? '' };
      this.modalTitle = 'Eliminar sitio';
      this.modalEditingId = sitio?.id || sitio?.id_sitio || sitio?.ID || null;
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
      const success = await onModalConfirmGeneric(this, 'sitios');
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

  async refrescar(): Promise<void> {
    await this.cargarDatosAsync();
  }

  procesarDatosSitios(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((s: any) => ({
      ...s,
      nombre: s['nombre'] || '',
      dominio: s['dominio'] || '',
      codigo: s['codigo'] || '',
      descripcion: s['descripcion'] || '',
      id_estado: s['id_estado'] ?? 1,
    }));
    this.formattedData = this.data.map((s) => ({ ...s }));
    this.total = Number(total) || this.data.length || 0;
  }

  buildSitioFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const schemaFields =
      SITIO_SCHEMA && Array.isArray(SITIO_SCHEMA.fields) ? SITIO_SCHEMA.fields : [];
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
      if (base.type === 'select' && key === 'id_estado') {
        base.options = [
          { value: '1', label: 'Activo' },
          { value: '0', label: 'Inactivo' },
        ];
      }
      let val: any = undefined;
      if (defaults && typeof defaults === 'object') {
        val = defaults[key];
      }
      if (typeof val === 'undefined') {
        val = s.value ?? '';
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
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'dominio', label: 'Dominio' },
      { key: 'codigo', label: 'Código' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'nombre_estado', label: 'Estado' },
    ];
  }
}
