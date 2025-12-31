import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-historial-contrasenas',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './historial-contrasenas-page.component.html',
  styleUrls: ['./historial-contrasenas-page.component.css'],
})
export class HistorialContrasenasPageComponent implements OnInit {
  title = 'Historial de contraseñas';
  subtitle = 'Cambios de contraseñas';
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
      const res: any = await this.api.get<any>('historial_contrasenas').toPromise();
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
      { key: 'fecha', label: 'Fecha' },
      { key: 'detalle', label: 'Detalle' },
    ];
  }
}
