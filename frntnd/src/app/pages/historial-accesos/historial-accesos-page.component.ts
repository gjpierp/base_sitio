import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-historial-accesos',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiButtonComponent,
  ],
  templateUrl: './historial-accesos-page.component.html',
  styleUrls: ['./historial-accesos-page.component.css'],
})
export class HistorialAccesosPageComponent implements OnInit {
  title = 'Historial de accesos';
  subtitle = 'Entradas y salidas de usuarios';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit() {
    this.load();
  }
  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>('historial_accesos') as any);
      this.data = Array.isArray(res) ? res : res?.data || [];
      this.datosListos = true;
    } catch (err) {
      const status = (err as any)?.status;
      if (status === 401) {
        this.error = 'No autorizado. Por favor, inicia sesión.';
      } else if ((err as any)?.msg) {
        this.error = (err as any).msg;
      } else {
        this.error = 'No se pudo cargar historial';
      }
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  get columns() {
    return [
      { key: 'usuario', label: 'Usuario' },
      { key: 'ip', label: 'IP' },
      { key: 'fecha', label: 'Fecha' },
    ];
  }

  onCreate() {
    this.router.navigate(['/historial-accesos/crear']);
  }
}
