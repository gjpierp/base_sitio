import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { NotificationService } from '../../services/notification.service';
import { onModalConfirmGeneric, onModalClosedGeneric } from '../page-utils';
import { ESTADO_SCHEMA } from '../../models/schema/estado.schema';

@Component({
  selector: 'page-estados',
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
  templateUrl: './estados-page.component.html',
  styleUrls: ['./estados-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadosPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Estados';
  subtitle = 'Catálogo de estados del sistema';

  // Filtros
  filtroNombre: string = '';

  // Datos
  data: any[] = [];
  formattedData: any[] = [];

  // Estado de carga
  loading = false;
  error?: string;
  datosListos = false;

  // Paginación
  total = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  sortKey = 'nombre';
  sortDir = 'asc';

  // Modal
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;
  modalLoading = false;
  modalEditingId: any = null;
  modalDeleteMode = false;

  // Inyecciones
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private notify = inject(NotificationService);

  // 2. Ciclo de Vida
  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      const estados = preloaded.estados || [];
      this.procesarDatos(estados, preloaded.total || estados.length);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  // 3. Lógica de Filtros
  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const term = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((r) => (r.nombre || '').toLowerCase().includes(term));
    }
    this.formattedData = filtrados;
    this.total = filtrados.length;
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.formattedData = this.data;
    this.total = this.data.length;
  }

  // 4. Carga y Procesamiento
  async load() {
    await this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    let pending = true;
    setTimeout(() => {
      if (pending) this.loading = true;
    });
    this.error = undefined;

    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const results = await firstValueFrom(
        forkJoin({
          estadosRes: this.api.get<any>('estados', { desde: offset, limite: this.pageSize }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const estadosRes = results?.estadosRes;
        // Manejo global de errores
        if (estadosRes?.error) {
          this.error = estadosRes.msg || 'Error al cargar estados';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = estadosRes?.estados || estadosRes?.data || estadosRes?.items || [];
        const total = estadosRes?.total ?? rows.length;
        this.procesarDatos(rows, total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar estados';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((r: any) => ({
      ...r,
      id: r.id_estado ?? r.id,
      nombre: r.nombre ?? '',
      descripcion: r.descripcion ?? '',
    }));
    this.formattedData = [...this.data];
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // 5. Eventos de Tabla
  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: string;
  }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || 20;
    this.sortKey = evt.sortKey || 'nombre';
    this.sortDir = evt.sortDir || 'asc';
    this.cargarDatosAsync();
  }

  // 6. Modal (Crear/Editar)
  async openCreateModal() {
    this.modalTitle = 'Crear estado';
    this.modalFields = this.buildFields({});
    this.modalValues = {};
    this.modalEditingId = null;
    this.modalDeleteMode = false;
    this.modalLoading = false;

    // Reinicio forzado
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  async onEdit(item: any) {
    this.modalTitle = 'Editar estado';
    this.modalFields = [];
    this.modalValues = {};
    this.modalDeleteMode = false;
    this.modalEditingId = null;
    this.modalLoading = true;

    // Reinicio forzado
    this.modalOpen = false;
    this.cdr.detectChanges();
    this.modalOpen = true;
    this.cdr.detectChanges();

    try {
      const id = item.id || item.id_estado;
      let detail = item;
      try {
        const res: any = await firstValueFrom(this.api.get(`estados/${id}`));
        if (res) detail = { ...detail, ...res };
      } catch {}

      this.ngZone.run(() => {
        this.modalFields = this.buildFields(detail);
        this.modalValues = { ...detail };
        this.modalEditingId = id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el estado');
    }
  }

  onRemove(item: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: item?.nombre ?? '' };
      this.modalTitle = 'Eliminar estado';
      this.modalEditingId = item?.id || item?.id_estado;
      this.modalDeleteMode = true;
      this.modalLoading = false;
      this.modalOpen = true;
      setTimeout(() => this.cdr.detectChanges(), 0);
    } catch (err) {
      this.notify.warning('No se pudo iniciar la eliminación');
    }
  }

  async onModalConfirm() {
    try {
      const success = await onModalConfirmGeneric(this, 'estados');
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

  onModalClosed() {
    try {
      onModalClosedGeneric(this);
    } catch (e) {
      this.notify.warning('Error al cerrar el modal');
    }
  }

  private buildFields(defaults: any = {}) {
    const valOr = (k: string) => defaults[k] ?? '';
    return [
      { key: 'nombre', label: 'Nombre', type: 'text', value: valOr('nombre') },
      { key: 'descripcion', label: 'Descripción', type: 'textarea', value: valOr('descripcion') },
    ];
  }

  // 7. Getters

  get columns(): { key: string; label: string }[] {
    return (ESTADO_SCHEMA as any[])
      .filter((f) => f.showInTable !== false && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
