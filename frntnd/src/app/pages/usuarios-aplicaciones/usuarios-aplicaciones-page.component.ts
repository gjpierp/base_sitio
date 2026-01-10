// Componente robusto adaptado de usuarios-page.component.ts para usuarios-aplicaciones
// Se debe ajustar la lógica de entidades, filtros y columnas según el dominio de usuarios-aplicaciones
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
import { USUARIO_APLICACION_SCHEMA } from '../../models/schema/usuario-aplicacion.schema';

@Component({
  selector: 'page-usuarios-aplicaciones',
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
  templateUrl: './usuarios-aplicaciones-page.component.html',
  styleUrls: ['./usuarios-aplicaciones-page.component.css'],
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
export class UsuariosAplicacionesPageComponent implements OnInit {
  title = 'Usuarios-Aplicaciones';
  subtitle = 'Usuarios-Aplicaciones';
  filtroNombre: string = '';
  filtroCorreo: string = '';
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
  usuarioAplicacionAEliminar: any = null;
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
      this.procesarDatos(preloaded.usuariosAplicaciones || [], preloaded.total || 0);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((u) =>
        (u.nombre_usuario_aplicacion || '').toLowerCase().includes(nombre)
      );
    }
    if (this.filtroCorreo) {
      const correo = this.filtroCorreo.toLowerCase();
      filtrados = filtrados.filter((u) =>
        (u.correo_electronico || '').toLowerCase().includes(correo)
      );
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((u) => String(u.id_estado) === String(this.filtroEstado));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroCorreo = '';
    this.filtroEstado = '';
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCorreo = '';
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
      const usuariosAplicacionesRes = await firstValueFrom(
        this.api.get<any>('usuarios_aplicaciones', { desde: offset, limite: this.pageSize })
      );
      pending = false;
      this.ngZone.run(() => {
        if (usuariosAplicacionesRes?.error) {
          this.error = usuariosAplicacionesRes.msg || 'Error al cargar usuarios-aplicaciones';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(usuariosAplicacionesRes)
          ? usuariosAplicacionesRes
          : Array.isArray(usuariosAplicacionesRes?.usuarios_aplicaciones)
          ? usuariosAplicacionesRes.usuarios_aplicaciones
          : [];
        this.procesarDatos(rows, usuariosAplicacionesRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar usuarios-aplicaciones';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((u: any) => ({ ...u }));
    this.formattedData = this.data;
    this.total = Number(total) || this.data.length || 0;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  onPageChange(evt: { page: number; pageSize: number }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    this.cargarDatosAsync();
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
    this.modalTitle = 'Crear usuario-aplicación';
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
      this.modalFields = this.buildFields({}, {}, false);
      this.modalValues = {};
      for (const f of this.modalFields) {
        this.modalValues[f.key] = f.value ?? '';
      }
      this.modalLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.modalOpen = false;
      this.cdr.detectChanges();
    }
  }

  async onEdit(item: any) {
    try {
      await this.openEditModal(item);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición: ' + (err?.message || ''));
    }
  }

  openEditModal(item: any) {
    this.modalTitle = 'Editar usuario-aplicación';
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
      const uRow = item ? { ...item } : {};
      const id = uRow.id || uRow.id_usuario_aplicacion || uRow.ID;
      if (!id) throw new Error('Sin ID');
      let uDetail = uRow;
      try {
        const res: any = firstValueFrom(this.api.get(`usuarios_aplicaciones/${id}`));
        const payload = res?.data ?? res;
        if (payload) uDetail = { ...uDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      this.modalFields = this.buildFields({}, uDetail, true);
      const values: any = {};
      this.modalFields.forEach((f) => (values[f.key] = f.value));
      this.modalValues = values;
      this.modalEditingId = uDetail.id_usuario_aplicacion || id;
      this.modalLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el usuario-aplicación para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(item: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: item?.nombre_usuario_aplicacion ?? '' };
      this.modalTitle = 'Eliminar usuario-aplicación';
      this.modalEditingId = Number(item?.id || item?.id_usuario_aplicacion || item?.ID);
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
      const success = await onModalConfirmGeneric(this, 'usuarios_aplicaciones');
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
    // Aquí deberías adaptar el schema y los campos según usuarios-aplicaciones
    // Por defecto, se usa un campo nombre_usuario_aplicacion como ejemplo
    return [
      {
        key: 'nombre_usuario_aplicacion',
        label: 'Nombre Usuario Aplicación',
        type: 'text',
        readonly: false,
        value: defaults['nombre_usuario_aplicacion'] || '',
        hidden: false,
      },
      // Agrega más campos según el schema real
    ];
  }

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(USUARIO_APLICACION_SCHEMA) ? USUARIO_APLICACION_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
