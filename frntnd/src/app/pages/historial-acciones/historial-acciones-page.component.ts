import { Component, inject, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-historial-acciones',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './historial-acciones-page.component.html',
  styleUrls: ['./historial-acciones-page.component.css'],
})
export class HistorialAccionesPageComponent implements OnInit {
  title = 'Historial de acciones';
  subtitle = 'Acciones registradas en el sistema';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  currentPage = 1;
  pageSize = 10;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    try {
      const offset = (this.currentPage - 1) * this.pageSize;
      const results = await firstValueFrom(
        forkJoin({
          historialAccionesRes: this.api.get<any>('historial_acciones', {
            desde: offset,
            limite: this.pageSize,
          }),
        })
      );
      this.data = Array.isArray(results.historialAccionesRes)
        ? results.historialAccionesRes
        : results.historialAccionesRes?.data || [];
      this.datosListos = true;
      this.currentPage = 1;
    } catch (err) {
      this.ngZone.run(() => {
        // Manejo robusto de errores de red y autenticación
        const status = (err as any)?.status;
        if (status === 401) {
          this.error = 'No autorizado. Por favor, inicia sesión.';
        } else if ((err as any)?.msg) {
          this.error = (err as any).msg;
        } else {
          this.error = 'No se pudo cargar historial de acciones';
        }
        this.data = [];
        this.loading = false;
        this.datosListos = false;
        this.cdr.detectChanges();
      });
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  get columns() {
    return [
      { key: 'usuario', label: 'Usuario' },
      { key: 'accion', label: 'Acción' },
      { key: 'fecha', label: 'Fecha' },
    ];
  }
}
