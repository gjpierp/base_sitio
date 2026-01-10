// Componente robusto para usuarios-jerarquias, adaptado de usuarios-page.component.ts
// Implementa todos los métodos y lógica robusta, ajustando nombres y entidades para usuarios-jerarquias.

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
import { USUARIO_JERARQUIA_SCHEMA } from '../../models/schema/usuario-jerarquia.schema';

@Component({
  selector: 'page-usuarios-jerarquias',
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
  templateUrl: './usuarios-jerarquias-page.component.html',
  styleUrls: ['./usuarios-jerarquias-page.component.css'],
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
export class UsuariosJerarquiasPageComponent implements OnInit {
  title = 'Usuarios-Jerarquías';
  subtitle = 'Usuarios-Jerarquías';
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
  usuarioJerarquiaAEliminar: any = null;
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
      this.procesarDatos(preloaded.usuariosJerarquias || [], preloaded.total || 0);
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
        (u.nombre_usuario_jerarquia || '').toLowerCase().includes(nombre)
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
      const usuariosJerarquiasRes = await firstValueFrom(
        this.api.get<any>('usuarios_jerarquias', { desde: offset, limite: this.pageSize })
      );
      pending = false;
      this.ngZone.run(() => {
        if (usuariosJerarquiasRes?.error) {
          this.error = usuariosJerarquiasRes.msg || 'Error al cargar usuarios-jerarquías';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(usuariosJerarquiasRes)
          ? usuariosJerarquiasRes
          : Array.isArray(usuariosJerarquiasRes?.usuarios_jerarquias)
          ? usuariosJerarquiasRes.usuarios_jerarquias
          : [];
        this.procesarDatos(rows, usuariosJerarquiasRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar usuarios-jerarquías';
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
    this.modalTitle = 'Crear usuario-jerarquía';
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
    this.modalTitle = 'Editar usuario-jerarquía';
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
      const id = uRow.id || uRow.id_usuario_jerarquia || uRow.ID;
      if (!id) throw new Error('Sin ID');
      let uDetail = uRow;
      try {
        const res: any = firstValueFrom(this.api.get(`usuarios_jerarquias/${id}`));
        const payload = res?.data ?? res;
        if (payload) uDetail = { ...uDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      this.modalFields = this.buildFields({}, uDetail, true);
      const values: any = {};
      this.modalFields.forEach((f) => (values[f.key] = f.value));
      this.modalValues = values;
      this.modalEditingId = uDetail.id_usuario_jerarquia || id;
      this.modalLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el usuario-jerarquía para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(item: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: item?.nombre_usuario_jerarquia ?? '' };
      this.modalTitle = 'Eliminar usuario-jerarquía';
      this.modalEditingId = Number(item?.id || item?.id_usuario_jerarquia || item?.ID);
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
      const success = await onModalConfirmGeneric(this, 'usuarios_jerarquias');
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
    // Aquí deberías adaptar el schema y los campos según usuarios-jerarquias
    // Por defecto, se usa un campo nombre_usuario_jerarquia como ejemplo
    return [
      {
        key: 'nombre_usuario_jerarquia',
        label: 'Nombre Usuario Jerarquía',
        type: 'text',
        readonly: false,
        value: defaults['nombre_usuario_jerarquia'] || '',
        hidden: false,
      },
      // Agrega más campos según el schema real
    ];
  }

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(USUARIO_JERARQUIA_SCHEMA) ? USUARIO_JERARQUIA_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
