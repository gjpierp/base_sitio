import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-usuarios-roles',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
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
      const res: any = await firstValueFrom(this.api.get<any>('usuarios_roles'));
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
      this.total = this.data.length;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios_roles';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    this.currentPage = evt.page;
    try {
      this.cdr.detectChanges();
    } catch {}
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

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
