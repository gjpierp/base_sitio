import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-roles-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './roles-permisos-page.component.html',
  styleUrls: ['./roles-permisos-page.component.css'],
})
export class RolesPermisosPageComponent implements OnInit {
  title = 'Roles - Permisos';
  subtitle = 'Roles - Permisos';
  data: any[] = [];
  loading = false;
  error?: string;
  total = 0;
  datosListos = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private notify = inject(NotificationService);

  constructor() {}

  ngOnInit() {
    this.cargarDatosAsync();
  }

  get columns() {
    return [
      { key: 'id_rol', label: 'ID Rol' },
      { key: 'nombre_rol', label: 'Rol' },
      { key: 'id_permiso', label: 'ID Permiso' },
      { key: 'nombre_permiso', label: 'Permiso' },
    ];
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('roles_permisos'));
      const rows = Array.isArray(res?.roles_permisos)
        ? res.roles_permisos
        : Array.isArray(res)
        ? res
        : [];
      this.data = rows.map((r: any) => ({
        id_rol: r.id_rol,
        nombre_rol: r.nombre_rol ?? r.rol ?? '',
        id_permiso: r.id_permiso,
        nombre_permiso: r.nombre_permiso ?? r.permiso ?? '',
      }));
      this.total = this.data.length;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar roles_permisos';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  onEdit(item: any) {
    try {
      const id_rol = item?.id_rol || item?.rol_id || item?.ID;
      const id_permiso = item?.id_permiso || item?.permiso_id || undefined;
      const qp: any = {};
      if (id_rol) qp.id_rol = id_rol;
      if (id_permiso) qp.id_permiso = id_permiso;
      this.router.navigate(['/roles-permisos/crear'], { queryParams: qp });
      return;
    } catch {}
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
