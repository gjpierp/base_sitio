import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-historial-accesos',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
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
      this.error = (err as any)?.error?.msg || 'No se pudo cargar historial';
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
}
