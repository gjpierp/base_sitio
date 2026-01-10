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
import { MENU_PERMISO_SCHEMA } from '../../models/schema/menu-permiso.schema';

@Component({
  selector: 'page-menus-permisos',
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
  templateUrl: './menus-permisos-page.component.html',
  styleUrls: ['./menus-permisos-page.component.css'],
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
export class MenusPermisosPageComponent implements OnInit {
  title = 'Menús-Permisos';
  subtitle = 'Gestión de Menús y Permisos';
  filtroNombre: string = '';
  filtroEstado: string = '';
  filtroRol: string = '';
  estados: any[] = [];
  roles: any[] = [];
  data: any[] = [];
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
  menuPermisoAEliminar: any = null;
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
      this.roles = preloaded.roles || [];
      let menusPermisosFiltrados = Array.isArray(preloaded.menusPermisos)
        ? preloaded.menusPermisos
        : [];
      const total =
        typeof preloaded.total === 'number' ? preloaded.total : menusPermisosFiltrados.length;
      this.procesarDatos(menusPermisosFiltrados, total);
      this.datosListos = true;
      this.cdr.detectChanges();
    } else {
      await this.cargarDatosAsync();
    }
  }

  aplicarFiltros() {
    let filtrados = this.data;
    if (this.filtroNombre) {
      const nombre = this.filtroNombre.toLowerCase();
      filtrados = filtrados.filter((m) => (m.nombre_menu || '').toLowerCase().includes(nombre));
    }
    if (this.filtroEstado) {
      filtrados = filtrados.filter((m) => String(m.id_estado) === String(this.filtroEstado));
    }
    if (this.filtroRol) {
      filtrados = filtrados.filter((m) => m.id_rol && String(m.id_rol) === String(this.filtroRol));
    }
    this.procesarDatos(filtrados, filtrados.length);
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroRol = '';
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroRol = '';
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
          estados: this.api.get<any>('estados'),
          roles: this.api.get<any>('roles', { desde: offset, limite: this.pageSize }),
          menusPermisosRes: this.api.get<any>('menus-permisos', {
            desde: offset,
            limite: this.pageSize,
          }),
        })
      );
      pending = false;
      this.ngZone.run(() => {
        const { estados, roles, menusPermisosRes } = results;
        // Manejo global de errores
        if (estados?.error) {
          this.error = estados.msg || 'Error al cargar estados';
          this.estados = [];
        } else {
          this.estados = Array.isArray(estados)
            ? estados
            : (typeof estados === 'object' &&
              estados !== null &&
              Array.isArray((estados as any)['estados'])
                ? (estados as any)['estados']
                : Array.isArray((estados as any)['data'])
                ? (estados as any)['data']
                : []) || [];
        }
        if (roles?.error) {
          this.error = roles.msg || 'Error al cargar roles';
          this.roles = [];
        } else {
          this.roles = Array.isArray(roles)
            ? roles
            : (typeof roles === 'object' && roles !== null && Array.isArray((roles as any)['roles'])
                ? (roles as any)['roles']
                : Array.isArray((roles as any)['data'])
                ? (roles as any)['data']
                : []) || [];
        }
        if (menusPermisosRes?.error) {
          this.error = menusPermisosRes.msg || 'Error al cargar menús-permisos';
          this.data = [];
          this.formattedData = [];
          this.loading = false;
          this.datosListos = false;
          this.cdr.detectChanges();
          return;
        }
        let rows: any[] = [];
        if (Array.isArray(menusPermisosRes?.menusPermisos)) {
          rows = menusPermisosRes.menusPermisos;
        } else if (Array.isArray(menusPermisosRes)) {
          rows = menusPermisosRes;
        } else if (Array.isArray(menusPermisosRes?.data)) {
          rows = menusPermisosRes.data;
        } else if (Array.isArray(menusPermisosRes?.items)) {
          rows = menusPermisosRes.items;
        }
        const total = Number(menusPermisosRes?.total) || rows.length || 0;
        this.procesarDatos(rows, total);
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = 'No se pudo cargar la lista de menús-permisos';
        this.data = [];
        this.formattedData = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarDatos(rows: any[], total: number) {
    this.data = (Array.isArray(rows) ? rows : []).map((m: any, idx: number) => {
      return {
        ...m,
        id: m.id_menu_permiso || m.id || idx + 1,
        nombre_menu: typeof m.nombre_menu === 'string' ? m.nombre_menu : m.nombre_menu ?? '',
        nombre_permiso:
          typeof m.nombre_permiso === 'string' ? m.nombre_permiso : m.nombre_permiso ?? '',
        nombre_estado:
          typeof m.nombre_estado === 'string' ? m.nombre_estado : m.nombre_estado ?? '',
      };
    });
    let camposLista: string[] = ['nombre_menu', 'nombre_permiso', 'nombre_estado'];
    let camposCrear: string[] = ['id_menu', 'id_permiso', 'id_estado'];
    let camposEditar: string[] = ['id_menu', 'id_permiso', 'id_estado'];
    let camposDetalle: string[] = ['nombre_menu', 'nombre_permiso', 'nombre_estado'];
    this.camposLista = camposLista;
    this.camposCrear = camposCrear;
    this.camposEditar = camposEditar;
    this.camposDetalle = camposDetalle;
    if (this.data && this.data.length > 0) {
      const keys = Object.keys(this.data[0]);
      this.formattedData = this.data.map((m: any) => {
        const obj: any = {};
        for (const k of keys) {
          obj[k] = m[k];
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

  openNewUser(): void {}

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
    this.modalTitle = 'Crear menú-permiso';
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
        const rolOptions = (Array.isArray(this.roles) ? this.roles : [])
          .filter((r) => r)
          .map((r: any) => ({
            value:
              r.id_rol != null && r.id_rol !== '' && !isNaN(Number(r.id_rol))
                ? String(r.id_rol)
                : '',
            label: r.nombre ?? String(r.id_rol ?? ''),
          }));
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value:
              e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
                ? String(e.id_estado)
                : '',
            label: e.nombre ?? String(e.id_estado ?? ''),
          }));
        this.modalFields = this.buildFields({ rolOptions, estadoOptions }, {}, false);
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

  async onEdit(menuPermiso: any) {
    try {
      await this.openEditModal(menuPermiso);
      return;
    } catch (err: any) {
      this.notify.warning(
        'No se pudo iniciar la edición del menú-permiso: ' + (err?.message || '')
      );
    }
  }

  async openEditModal(menuPermiso: any) {
    this.modalTitle = 'Editar menú-permiso';
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
      const mRow = menuPermiso ? { ...menuPermiso } : {};
      const id = mRow.id || mRow.id_menu_permiso || mRow.ID;
      if (!id) throw new Error('Menú-permiso sin ID');
      let mDetail = mRow;
      try {
        const res: any = await firstValueFrom(this.api.get(`menus-permisos/${id}`));
        const payload = res?.data ?? res;
        if (payload) mDetail = { ...mDetail, ...payload };
      } catch (e) {
        console.warn('Usando datos de fila por error en detalle:', e);
      }
      if (!this.datosListos || !this.roles?.length) {
        await this.cargarDatosAsync();
      }
      this.ngZone.run(() => {
        const rolOptions = (Array.isArray(this.roles) ? this.roles : [])
          .filter((r) => r)
          .map((r: any) => ({
            value:
              r.id_rol != null && r.id_rol !== '' && !isNaN(Number(r.id_rol))
                ? String(r.id_rol)
                : '',
            label: r.nombre ?? String(r.id_rol ?? ''),
          }));
        const estadoOptions = (Array.isArray(this.estados) ? this.estados : [])
          .filter((e) => e)
          .map((e: any) => ({
            value:
              e.id_estado != null && e.id_estado !== '' && !isNaN(Number(e.id_estado))
                ? String(e.id_estado)
                : '',
            label: e.nombre ?? String(e.id_estado ?? ''),
          }));
        this.modalFields = this.buildFields({ rolOptions, estadoOptions }, mDetail, true);
        const values: any = {};
        this.modalFields.forEach((f) => (values[f.key] = f.value));
        this.modalValues = values;
        this.modalEditingId = mDetail.id_menu_permiso || id;
        this.modalLoading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.modalOpen = false;
      this.notify.warning('No se pudo cargar el menú-permiso para edición');
      this.cdr.detectChanges();
    }
  }

  onRemove(menuPermiso: any) {
    try {
      this.modalFields = [];
      this.modalValues = { nombre: menuPermiso?.nombre_menu ?? '' };
      this.modalTitle = 'Eliminar menú-permiso';
      this.modalEditingId = Number(
        menuPermiso?.id || menuPermiso?.id_menu_permiso || menuPermiso?.ID
      );
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
      const success = await onModalConfirmGeneric(this, 'menus-permisos');
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

  private buildFields(opts: any = {}, defaults: any = {}, isEdit: boolean = false) {
    const rolOptions = opts.rolOptions ?? [];
    const estadoOptions = opts.estadoOptions ?? [];
    const schemaFields =
      MENU_PERMISO_SCHEMA && Array.isArray(MENU_PERMISO_SCHEMA) ? MENU_PERMISO_SCHEMA : [];
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
        options: s.options || [],
      };
      let val: any = defaults[key];
      if (typeof val === 'undefined') val = '';
      base.value = val == null ? '' : String(val);
      return base;
    });
    return fields;
  }

  get columns(): { key: string; label: string }[] {
    return (Array.isArray(MENU_PERMISO_SCHEMA) ? MENU_PERMISO_SCHEMA : [])
      .filter((f) => f.verEnLista && !f.hidden)
      .map((f) => ({ key: f.key, label: f.label ?? f.key }));
  }
}
