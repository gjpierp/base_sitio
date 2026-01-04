import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-auditoria',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './auditoria-page.component.html',
  styleUrls: ['./auditoria-page.component.css'],
})
export class AuditoriaPageComponent implements OnInit {
  title = 'Auditoría';
  subtitle = 'Registro de acciones del sistema';
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
      const res: any = await firstValueFrom(this.api.get<any>('auditoria') as any);
      this.data = Array.isArray(res) ? res : res?.data || [];
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar auditoría';
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
      { key: 'accion', label: 'Acción' },
      { key: 'fecha', label: 'Fecha' },
    ];
  }
}
