import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { setupList, onPageChangeGeneric, abrirEditarGeneric } from '../page-utils';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'page-aplicaciones-sitio',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './aplicaciones-sitio-page.component.html',
  styleUrls: ['./aplicaciones-sitio-page.component.css'],
})
export class AplicacionesSitioPageComponent implements OnInit {
  title = 'Aplicaciones Sitio';
  subtitle = 'Aplicaciones del sitio';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    setupList(
      this,
      'aplicaciones_sitio',
      'aplicaciones',
      (r: any) => ({ id: r.id_aplicacion ?? r.id ?? r.ID, nombre: r.nombre ?? r.titulo ?? r.name, activo: r.activo ?? r.estado ?? true })
    );
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(
        this.api.getPaginated('aplicaciones_sitio', { desde: 0 }) as any
      );
      const rows = res?.data || [];
      this.data = rows.map((r: any) => ({
        id: r.id_aplicacion ?? r.id ?? r.ID,
        nombre: r.nombre ?? r.titulo ?? r.name,
        activo: r.activo ?? r.estado ?? true,
      }));
      this.total = Number(res?.total) || this.data.length || 0;
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudieron cargar aplicaciones';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
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
      'aplicaciones_sitio',
      (r: any) => ({ id: r.id_aplicacion ?? r.id ?? r.ID, nombre: r.nombre ?? r.titulo ?? r.name, activo: r.activo ?? r.estado ?? true })
    );
  }

  total = 0;

  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'activo', label: 'Activo' },
    ];
  }

  onEdit(item: any) {
    try {
      const ok = abrirEditarGeneric(this, item, '/aplicaciones-sitio/crear', ['id', 'id_aplicacion', 'ID']);
      if (ok) return;
    } catch {}
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar aplicación?')) {
      // Llamada a API para eliminar si se requiere
    }
  }
}
