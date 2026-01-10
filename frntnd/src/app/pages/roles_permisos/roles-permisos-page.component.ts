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
import { ROLE_PERMISO_SCHEMA } from '../../models/schema/role-permiso.schema';

@Component({
  selector: 'page-roles-permisos',
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
  templateUrl: './roles-permisos-page.component.html',
  styleUrls: ['./roles-permisos-page.component.css'],
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
export class RolesPermisosPageComponent implements OnInit {
  title = 'Roles-Permisos';
  subtitle = 'Relación de Roles y Permisos';
  filtroRol: string = '';
  filtroPermiso: string = '';
  roles: any[] = [];
  permisos: any[] = [];
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
  rolPermisoAEliminar: any = null;
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
      this.roles = preloaded.roles || [];
      this.permisos = preloaded.permisos || [];
      let rolesPermisosFiltrados = preloaded.rolesPermisos || [];
      this.procesarDatos(rolesPermisosFiltrados, preloaded.total || rolesPermisosFiltrados.length);
      this.datosListos = true;
    } else {
      await this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroRol) {
      filtrados = filtrados.filter((rp) => String(rp.id_rol) === String(this.filtroRol));
    }
    if (this.filtroPermiso) {
      filtrados = filtrados.filter((rp) => String(rp.id_permiso) === String(this.filtroPermiso));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroRol = '';
    this.filtroPermiso = '';
  }

  limpiarFiltros() {
    this.filtroRol = '';
    this.filtroPermiso = '';
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
          roles: this.api.get<any>('roles'),
          permisos: this.api.get<any>('permisos'),
          rolesPermisosRes: this.api.get<any>('roles-permisos', {
            desde: offset,
            limite: this.pageSize,
          }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { roles, permisos, rolesPermisosRes } = results;
        if (roles?.error) {
          this.error = roles.msg || 'Error al cargar roles';
          this.roles = [];
        } else {
          this.roles = Array.isArray(roles) ? roles : roles?.roles || roles?.data || [];
        }
        if (permisos?.error) {
          this.error = permisos.msg || 'Error al cargar permisos';
          this.permisos = [];
        } else {
          this.permisos = Array.isArray(permisos)
            ? permisos
            : permisos?.permisos || permisos?.data || [];
        }
        if (rolesPermisosRes?.error) {
          this.error = rolesPermisosRes.msg || 'Error al cargar roles-permisos';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        const rows = Array.isArray(rolesPermisosRes)
          ? rolesPermisosRes
          : Array.isArray(rolesPermisosRes?.roles_permisos)
          ? rolesPermisosRes.roles_permisos
          : Array.isArray(rolesPermisosRes?.data)
          ? rolesPermisosRes.data
          : [];
        this.procesarDatos(rows, rolesPermisosRes?.total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar roles-permisos';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((rp: any) => {
      const nombre_rol =
        this.roles.find((r) => String(r.id_rol) === String(rp.id_rol))?.nombre || '';
      const nombre_permiso =
        this.permisos.find((p) => String(p.id_permiso) === String(rp.id_permiso))?.nombre || '';
      return {
        ...rp,
        nombre_rol,
        nombre_permiso,
      };
    });
    this.formattedData = this.data.map((rp) => ({ ...rp }));
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
    this.modalTitle = 'Crear relación rol-permiso';
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
        const rolOptions = (Array.isArray(this.roles) ? this.roles : []).map((r: any) => ({
          value: String(r.id_rol),
          label: r.nombre ?? String(r.id_rol),
        }));
        const permisoOptions = (Array.isArray(this.permisos) ? this.permisos : []).map(
          (p: any) => ({
            value: String(p.id_permiso),
            label: p.nombre ?? String(p.id_permiso),
          })
        );
        this.modalFields = [
          { key: 'id_rol', label: 'Rol', type: 'select', options: rolOptions, value: '' },
          {
            key: 'id_permiso',
            label: 'Permiso',
            type: 'select',
            options: permisoOptions,
            value: '',
          },
        ];
        this.modalValues = { id_rol: '', id_permiso: '' };
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.cdr.detectChanges();
    }
  }

  async onEdit(rolPermiso: any) {
    try {
      await this.openEditModal(rolPermiso);
      return;
    } catch (err: any) {
      this.notify.warning('No se pudo iniciar la edición: ' + (err?.message || ''));
    }
  }

  openEditModal(rolPermiso: any) {
    this.modalTitle = 'Editar relación rol-permiso';
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
      const rpRow = rolPermiso ? { ...rolPermiso } : {};
      const id = rpRow.id || rpRow.id_rol_permiso || rpRow.ID;
      if (!id) throw new Error('Relación sin ID');
      let rpDetail = rpRow;
      try {
        const res: any = firstValueFrom(this.api.get(`roles-permisos/${id}`));
        const payload = res?.data ?? res;
        if (payload) rpDetail = { ...rpDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos || !this.roles?.length) {
        this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const rolOptions = (Array.isArray(this.roles) ? this.roles : []).map((r: any) => ({
          value: String(r.id_rol),
          label: r.nombre ?? String(r.id_rol),
        }));
        const permisoOptions = (Array.isArray(this.permisos) ? this.permisos : []).map(
          (p: any) => ({
            value: String(p.id_permiso),
            label: p.nombre ?? String(p.id_permiso),
          })
        );
        this.modalFields = [
          {
            key: 'id_rol',
            label: 'Rol',
            type: 'select',
            options: rolOptions,
            value: rpDetail.id_rol,
          },
          {
            key: 'id_permiso',
            label: 'Permiso',
            type: 'select',
            options: permisoOptions,
            value: rpDetail.id_permiso,
          },
        ];
        this.modalValues = { id_rol: rpDetail.id_rol, id_permiso: rpDetail.id_permiso };
        this.modalEditingId = rpDetail.id_rol_permiso || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar la relación para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(rolPermiso: any) {
    try {
      this.modalFields = [];
      this.modalValues = { id_rol: rolPermiso?.id_rol, id_permiso: rolPermiso?.id_permiso };
      this.modalTitle = 'Eliminar relación rol-permiso';
      this.modalEditingId = Number(rolPermiso?.id || rolPermiso?.id_rol_permiso || rolPermiso?.ID);
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
      const success = await onModalConfirmGeneric(this, 'roles-permisos');
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

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(ROLE_PERMISO_SCHEMA) ? ROLE_PERMISO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
