// Componente robusto basado en usuarios-page.component.ts para usuarios-roles
import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

@Component({
  selector: 'page-usuarios-roles',
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
  templateUrl: './usuarios-roles-page.component.html',
  styleUrls: ['./usuarios-roles-page.component.css'],
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
export class UsuariosRolesPageComponent implements OnInit {
  title = 'Usuarios - Roles';
  subtitle = 'Gestión de asignación de roles a usuarios';
  filtroUsuario: string = '';
  filtroRol: string = '';
  filtroEstado: string = '';
  estados: any[] = [];
  roles: any[] = [];
  usuarios: any[] = [];
  data: any[] = [];
  formattedData: any[] = [];
  loading = false;
  error?: string;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalPages = 1;
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalLoading = false;
  modalDeleteMode = false;
  modalEditingId: any = null;
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {}

  async ngOnInit() {
    await this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.loading = true;
    try {
      const [estadosResRaw, rolesResRaw, usuariosResRaw, usuariosRolesResRaw] =
        await firstValueFrom(
          forkJoin([
            this.api.get('estados'),
            this.api.get('roles'),
            this.api.get('usuarios'),
            this.api.get('usuarios_roles', { desde: 0, limite: this.pageSize }),
          ])
        );
      const estadosRes = estadosResRaw as any;
      const rolesRes = rolesResRaw as any;
      const usuariosRes = usuariosResRaw as any;
      const usuariosRolesRes = usuariosRolesResRaw as any;
      this.estados = estadosRes.estados || estadosRes || [];
      this.roles = rolesRes.roles || rolesRes || [];
      this.usuarios = usuariosRes.usuarios || usuariosRes || [];
      this.data = usuariosRolesRes.usuarios_roles || usuariosRolesRes || [];
      this.formattedData = this.data;
      this.total = usuariosRolesRes.total || this.data.length || 0;
      this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
      this.error = '';
    } catch (err: any) {
      this.error = err?.message || 'Error al cargar los datos iniciales';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(
        this.api.get('usuarios_roles', {
          desde: (this.currentPage - 1) * this.pageSize,
          limite: this.pageSize,
          usuario: this.filtroUsuario,
          rol: this.filtroRol,
          estado: this.filtroEstado,
        })
      );
      this.data = res.usuarios_roles || res || [];
      this.formattedData = this.data;
      this.total = res.total || this.data.length || 0;
      this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
      this.error = '';
    } catch (err: any) {
      this.error = err?.message || 'Error al cargar los datos';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  aplicarFiltros() {
    this.currentPage = 1;
    this.cargarDatosAsync();
  }

  limpiarFiltros() {
    this.filtroUsuario = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.cargarDatosAsync();
  }

  onPageChange(evt: { page: number; pageSize: number }) {
    this.currentPage = Number(evt.page) || 1;
    this.pageSize = Number(evt.pageSize) || this.pageSize;
    this.cargarDatosAsync();
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.currentPage = 1;
    this.cargarDatosAsync();
  }

  openCreateModal() {
    this.modalTitle = 'Asignar nuevo rol a usuario';
    this.modalFields = [
      {
        key: 'usuario',
        label: 'Usuario',
        type: 'select',
        options: this.usuarios.map((u) => ({ value: u.id_usuario, label: u.nombre })),
        required: true,
      },
      {
        key: 'rol',
        label: 'Rol',
        type: 'select',
        options: this.roles.map((r) => ({ value: r.id_rol, label: r.nombre })),
        required: true,
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        options: this.estados.map((e) => ({ value: e.id_estado, label: e.nombre })),
        required: true,
      },
    ];
    this.modalValues = {};
    this.modalOpen = true;
    this.modalDeleteMode = false;
    this.cdr.detectChanges();
  }

  onEdit(row: any) {
    this.modalTitle = 'Editar asignación de rol';
    this.modalFields = [
      {
        key: 'usuario',
        label: 'Usuario',
        type: 'select',
        options: this.usuarios.map((u) => ({ value: u.id_usuario, label: u.nombre })),
        required: true,
        readonly: true,
      },
      {
        key: 'rol',
        label: 'Rol',
        type: 'select',
        options: this.roles.map((r) => ({ value: r.id_rol, label: r.nombre })),
        required: true,
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        options: this.estados.map((e) => ({ value: e.id_estado, label: e.nombre })),
        required: true,
      },
    ];
    this.modalValues = { ...row };
    this.modalOpen = true;
    this.modalDeleteMode = false;
    this.cdr.detectChanges();
  }

  onRemove(row: any) {
    this.modalTitle = 'Eliminar asignación de rol';
    this.modalFields = [];
    this.modalValues = { ...row };
    this.modalOpen = true;
    this.modalDeleteMode = true;
    this.cdr.detectChanges();
  }

  async onModalConfirm() {
    this.modalLoading = true;
    try {
      if (this.modalDeleteMode) {
        await firstValueFrom(this.api.delete(`usuarios_roles/${this.modalValues.id_usuario_rol}`));
      } else if (this.modalValues.id_usuario_rol) {
        await firstValueFrom(
          this.api.put(`usuarios_roles/${this.modalValues.id_usuario_rol}`, this.modalValues)
        );
      } else {
        await firstValueFrom(this.api.post('usuarios_roles', this.modalValues));
      }
      this.modalOpen = false;
      this.cargarDatosAsync();
    } catch (err: any) {
      this.error = err?.message || 'Error al guardar los cambios';
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  onModalClosed() {
    this.modalOpen = false;
    this.modalDeleteMode = false;
    this.modalFields = [];
    this.modalValues = {};
    this.cdr.detectChanges();
  }

  get columns() {
    return [
      { key: 'id_usuario_rol', label: 'ID', width: 60 },
      { key: 'usuario', label: 'Usuario', width: 180 },
      { key: 'rol', label: 'Rol', width: 180 },
      { key: 'estado', label: 'Estado', width: 100 },
      { key: 'acciones', label: 'Acciones', width: 120, actions: true },
    ];
  }
}
