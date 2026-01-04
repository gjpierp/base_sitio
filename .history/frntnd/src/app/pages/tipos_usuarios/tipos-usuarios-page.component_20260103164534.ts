import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { setupList, onPageChangeGeneric, abrirEditarGeneric } from '../page-utils';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-tipos-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, UiEntityTableComponent, UiCardComponent, UiSpinnerComponent],
  templateUrl: './tipos-usuarios-page.component.html',
  styleUrls: ['./tipos-usuarios-page.component.css'],
})
export class TiposUsuariosPageComponent implements OnInit {
  title = 'Tipos de Usuario';
  subtitle = 'Tipos de Usuario';
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
    setupList(
      this,
      'tipos-usuarios',
      'tipos_usuarios',
      (r: any) => ({ id_tipo_usuario: r.id_tipo_usuario ?? r.id ?? r.ID, nombre: r.nombre ?? '', descripcion: r.descripcion ?? '' })
    );
  }

  get columns() {
    return [
      { key: 'id_tipo_usuario', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
    ];
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.getPaginated<any>('tipos-usuarios'));
      const rows = res?.data || [];
      this.data = rows.map((r: any) => ({
        id_tipo_usuario: r.id_tipo_usuario,
        nombre: r.nombre ?? '',
        descripcion: r.descripcion ?? '',
      }));
      this.total = Number(res?.total) || this.data.length;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar tipos de usuario';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
  }

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    onPageChangeGeneric(
      this,
      evt,
      'tipos-usuarios',
      (r: any) => ({ id_tipo_usuario: r.id_tipo_usuario ?? r.id ?? r.ID, nombre: r.nombre ?? '', descripcion: r.descripcion ?? '' })
    );
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  onEdit(item: any) {
    try {
      const ok = abrirEditarGeneric(this, item, '/tipos-usuarios/crear', ['id_tipo_usuario', 'id', 'ID']);
      if (ok) return;
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
