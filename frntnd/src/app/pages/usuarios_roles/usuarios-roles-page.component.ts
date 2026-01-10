import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiButtonComponent,
  ],
  templateUrl: './usuarios-roles-page.component.html',
  styleUrls: ['./usuarios-roles-page.component.css'],
})
export class UsuariosRolesPageComponent implements OnInit {
  title = 'Usuarios - Roles';
  subtitle = 'Usuarios - Roles';
  data: any[] = [];
  loading = false;
  error?: string;
  total = 0;
  datosListos = false;
  currentPage = 1;
  pageSize = 10;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private notify = inject(NotificationService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.cargarDatosAsync();
  }

  get columns() {
    return [
      { key: 'id_usuario', label: 'ID Usuario' },
      { key: 'nombre_usuario', label: 'Usuario' },
      { key: 'id_rol', label: 'ID Rol' },
      { key: 'nombre_rol', label: 'Rol' },
    ];
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const res: any = await firstValueFrom(
        this.api.get<any>('usuarios_roles', { desde: offset, limite: this.pageSize })
      );
      // Manejo global de errores
      if (res?.error) {
        this.error = res.msg || 'Error al cargar usuarios_roles';
        this.data = [];
        this.datosListos = false;
        this.cdr.detectChanges();
        return;
      }
      const rows = Array.isArray(res?.usuarios_roles)
        ? res.usuarios_roles
        : Array.isArray(res)
        ? res
        : [];
      this.data = rows.map((r: any) => ({
        id_usuario: r.id_usuario,
        nombre_usuario: r.nombre_usuario ?? r.usuario ?? '',
        id_rol: r.id_rol,
        nombre_rol: r.nombre_rol ?? r.rol ?? '',
      }));
      this.total = res?.total || this.data.length;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = 'No se pudo cargar usuarios_roles';
      this.data = [];
      this.datosListos = false;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  onEdit(item: any) {
    try {
      const id_usuario = item?.id_usuario || item?.usuario_id || item?.idUsuario;
      const id_rol = item?.id_rol || item?.rol_id || item?.idRol;
      const qp: any = {};
      if (id_usuario) qp.id_usuario = id_usuario;
      if (id_rol) qp.id_rol = id_rol;
      this.router.navigate(['/usuarios-roles/crear'], { queryParams: qp });
      return;
    } catch (err) {}
    this.notify.warning('No se pudo iniciar la edición');
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar elemento?')) {
      this.notify.info('Eliminado (simulado)');
    }
  }

  onCreate() {
    try {
      this.router.navigate(['/usuarios-roles/crear']);
    } catch {}
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
