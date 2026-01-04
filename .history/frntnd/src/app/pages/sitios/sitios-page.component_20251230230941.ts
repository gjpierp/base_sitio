import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-sitios',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './sitios-page.component.html',
  styleUrls: ['./sitios-page.component.css'],
})
export class SitiosPageComponent implements OnInit {
  title = 'Sitios';
  subtitle = 'Sitios registrados';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const pre = ((this.route.snapshot.data as any) || {})['pre'];
    if (pre) {
      const rows = Array.isArray(pre.sitios) ? pre.sitios : [];
      this.data = rows;
      this.datosListos = true;
      try {
        this.cdr.detectChanges();
      } catch {}
    } else {
      this.load();
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.getPaginated<any>('sitios') as any);
      this.data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudieron cargar sitios';
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
      { key: 'nombre', label: 'Nombre' },
      { key: 'dominio', label: 'Dominio' },
    ];
  }

  refrescar() {
    this.load();
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  onEdit(row: any) {
    try {
      const id = row?.id || row?.id_sitio || row?.ID;
      if (id) {
        this.router.navigate(['/sitios/crear'], { queryParams: { id } });
        return;
      }
    } catch {}
    // fallback
    console.log('Editar sitio', row);
  }
}
