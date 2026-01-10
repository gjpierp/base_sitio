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
import { SITIO_SCHEMA } from '../../models/schema/sitio.schema';
import { EstadoEntity } from '../../models/entities/estado.entity';

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
export class SitiosPageComponent implements OnInit {
  // Filtros de búsqueda
  filtroNombre: string = '';
  filtroCodigo: string = '';
  filtroEstado: string = '';

  title = 'Sitios';
  subtitle = 'Sitios registrados en el sistema';
  estados: EstadoEntity[] = [];
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
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;

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
      this.estados = preloaded.estados || [];
      this.procesarDatos(preloaded.sitios || [], preloaded.total || 0);
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
    if (this.filtroCodigo) {
      const codigo = this.filtroCodigo.toLowerCase();
      filtrados = filtrados.filter((s) => (s.codigo || '').toLowerCase().includes(codigo));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((s) => String(s.id_estado) === String(this.filtroEstado));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCodigo = '';
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
      const offset = (this.currentPage - 1) * this.pageSize;
      const [sitiosRes, estadosRes] = await firstValueFrom(
        forkJoin([
          this.api.get<any>('sitios', { desde: offset, limite: this.pageSize }),
          this.api.get<any>('estados'),
        ])
      );
      pending = false;
      this.ngZone.run(() => {
        // Manejo global de errores
        if (sitiosRes?.error) {
          this.error = sitiosRes.msg || 'Error al cargar sitios';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        if (estadosRes?.error) {
          this.error = estadosRes.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = estadosRes?.estados || estadosRes?.data || [];
        }
        const rows = Array.isArray(sitiosRes)
          ? sitiosRes
          : sitiosRes?.sitios || sitiosRes?.data || [];
        this.procesarDatos(rows, sitiosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar sitios';
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
    this.load();
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
    this.modalError = '';

    // Reinicio forzado
    this.modalOpen = false;
    this.cdr.detectChanges();
    try {
      this.ngZone.run(() => {
        this.modalFields = this.buildFields({}, {}, false);
        this.modalValues = {};
        for (const f of this.modalFields) {
          this.modalValues[f.key] = f.value ?? '';
        }
        this.modalLoading = false;
        this.modalOpen = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalError = 'Error al preparar el formulario de creación';
      this.modalLoading = false;
      this.modalOpen = true;
      this.cdr.detectChanges();
    }
  }

  async onEdit(sitio: any) {
    console.log('[onEdit] sitio:', sitio);
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
    this.modalError = '';

    // Reinicio forzado
    this.modalOpen = false;
    this.cdr.detectChanges();
    try {
      const sRow = sitio ? { ...sitio } : {};
      const id = sRow.id || sRow.id_sitio || sRow.ID;
      if (!id) {
        this.modalError = 'No se encontró un identificador válido para el sitio.';
        this.modalLoading = false;
        this.modalOpen = true;
        this.cdr.detectChanges();
        return;
      }
      let sDetail = sRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`sitios/${id}`));
        const payload = res?.data ?? res;
        if (payload) sDetail = { ...sDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      this.ngZone.run(() => {
        this.modalFields = this.buildFields({}, sDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = sDetail.id_sitio || id;
        this.modalLoading = false;
        this.modalOpen = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalError = 'No se pudo cargar el sitio para edición';
      this.modalLoading = false;
      this.modalOpen = true;
      this.cdr.detectChanges();
    }
  }
  modalError: string = '';

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

  procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((s: any) => {
      const id = s['id_sitio'] ?? s['id'] ?? s['ID'] ?? '';
      return {
        ...s,
        id, // Asegura que cada fila tenga un campo 'id' para la tabla y eventos
        nombre: s['nombre'] || '',
        codigo: s['codigo'] || '',
        descripcion: s['descripcion'] || '',
        id_estado: s['id_estado'] ?? 1,
      };
    });
    this.formattedData = this.data.map((s) => ({ ...s }));
    this.total = Number(total) || this.data.length || 0;
  }

  buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const schemaFields = SITIO_SCHEMA && Array.isArray(SITIO_SCHEMA) ? SITIO_SCHEMA : [];
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
        base.options = this.estados.map((e) => ({ value: String(e.id_estado), label: e.nombre }));
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
      { key: 'codigo', label: 'Código' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'id_estado', label: 'Estado' },
    ];
  }
}
