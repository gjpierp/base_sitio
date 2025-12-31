import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-usuarios-jerarquias',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, FormsModule, UiEntityTableComponent],
  templateUrl: './usuarios-jerarquias-page.component.html',
  styleUrls: ['./usuarios-jerarquias-page.component.css'],
})
export class UsuariosJerarquiasPageComponent implements OnInit {
  title = 'Usuarios - Jerarquías';
  subtitle = 'Usuarios - Jerarquías';
  data: any[] = [];
  loading = false;
  error?: string;
  total = 0;
  datosListos = false;

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
      { key: 'id_jerarquia', label: 'ID Jerarquía' },
      { key: 'nombre_jerarquia', label: 'Jerarquía' },
    ];
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('usuarios_jerarquias'));
      const rows = Array.isArray(res?.usuarios_jerarquias)
        ? res.usuarios_jerarquias
        : Array.isArray(res)
        ? res
        : [];
      this.data = rows.map((r: any) => ({
        id_usuario: r.id_usuario,
        nombre_usuario: r.nombre_usuario ?? r.usuario ?? '',
        id_jerarquia: r.id_jerarquia,
        nombre_jerarquia: r.nombre_jerarquia ?? r.jerarquia ?? '',
      }));
      this.total = this.data.length;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar usuarios_jerarquias';
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
      const id_usuario = item?.id_usuario || item?.usuario_id || item?.idUsuario;
      const id_jerarquia = item?.id_jerarquia || item?.jerarquia_id || item?.idJerarquia;
      const qp: any = {};
      if (id_usuario) qp.id_usuario = id_usuario;
      if (id_jerarquia) qp.id_jerarquia = id_jerarquia;
      this.router.navigate(['/usuarios-jerarquias/crear'], { queryParams: qp });
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
