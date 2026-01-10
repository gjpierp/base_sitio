import { Component, inject, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UiButtonComponent,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit {
  // 1. Propiedades
  title = 'Dashboard';
  subtitle = 'Resumen del sistema';

  // Datos
  stats = {
    usuarios: 0,
    apps: 0,
    config: 0
  };
  actividadReciente: any[] = [];
  formattedActivity: any[] = [];

  // Estado de carga
  loading = false;
  error?: string;
  datosListos = false;

  // Inyecciones
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  // 2. Ciclo de Vida
  ngOnInit(): void {
    const preloaded = this.route.snapshot.data['pre'];
    if (preloaded) {
      this.stats = preloaded.stats || { usuarios: 0, apps: 0, config: 0 };
      this.procesarActividad(preloaded.actividadReciente || []);
      this.datosListos = true;
    } else {
      this.cargarDatosAsync();
    }
  }

  // 3. Carga y Procesamiento
  async refrescar() {
    await this.cargarDatosAsync();
  }

  async cargarDatosAsync() {
    let pending = true;
    setTimeout(() => { if (pending) this.loading = true; });
    this.error = undefined;

    try {
      // Replicar lógica del resolver para refresco manual
      const reqs = {
        usuarios: this.api.getPaginated('usuarios', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
        apps: this.api.getPaginated('aplicaciones_sitio', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
        config: this.api.getPaginated('configuraciones', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
        auditoria: this.api.getPaginated('auditoria', { limit: 5, sort: 'fecha', order: 'desc' }).pipe(catchError(() => of({ data: [] })))
      };

      const res: any = await firstValueFrom(forkJoin(reqs));

      pending = false;
      this.ngZone.run(() => {
        this.stats = {
          usuarios: Number(res.usuarios?.total) || 0,
          apps: Number(res.apps?.total) || 0,
          config: Number(res.config?.total) || 0
        };
        const rows = res.auditoria?.data || res.auditoria?.auditoria || [];
        this.procesarActividad(rows);
        
        this.loading = false;
        this.datosListos = true;
        this.cdr.detectChanges();
      });
    } catch (err) {
      pending = false;
      this.ngZone.run(() => {
        this.error = (err as any)?.error?.msg || 'No se pudo cargar el dashboard';
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
  }

  private procesarActividad(rows: any[]) {
    this.actividadReciente = (Array.isArray(rows) ? rows : []).map((r: any) => ({
      ...r,
      id: r.id_auditoria ?? r.id,
      usuario_nombre: r.usuario?.nombre_usuario ?? r.nombre_usuario ?? r.usuario ?? 'Sistema',
      fecha_fmt: r.fecha ? new Date(r.fecha).toLocaleString() : '',
      accion: r.accion || 'Desconocido',
      entidad: r.entidad || '-'
    }));
    this.formattedActivity = [...this.actividadReciente];
  }

  // 4. Navegación
  irA(ruta: string) {
    this.router.navigate([ruta]);
  }

  // 5. Getters
  get activityColumns() {
    return [
      { key: 'fecha_fmt', label: 'Fecha' },
      { key: 'usuario_nombre', label: 'Usuario' },
      { key: 'accion', label: 'Acción' },
      { key: 'entidad', label: 'Entidad' }
    ];
  }

  // Métodos dummy para satisfacer la interfaz de ui-entity-table si se requiere
  onEdit(item: any) {}
  onRemove(item: any) {}
}