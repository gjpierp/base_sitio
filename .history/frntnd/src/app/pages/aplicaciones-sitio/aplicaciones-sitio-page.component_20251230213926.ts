import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
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
    const pre = (this.route.snapshot.data || {})['pre'];
    if (pre && Array.isArray(pre.aplicaciones)) {
      this.data = pre.aplicaciones;
      this.total = Number(pre.total) || this.data.length || 0;
      this.datosListos = true;
    } else {
      this.load();
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await this.api
        .getPaginated('aplicaciones_sitio', { desde: 0, limite: 10 })
        .toPromise();
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

  total = 0;

  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'activo', label: 'Activo' },
    ];
  }

  onEdit(item: any) {
    try {
      const id = item?.id || item?.id_aplicacion;
      if (id) this.router.navigate(['/aplicaciones/crear'], { queryParams: { id } });
    } catch {}
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar aplicación?')) {
      // Llamada a API para eliminar si se requiere
    }
  }
}
