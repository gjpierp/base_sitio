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
  total = 0;

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
      this.total = this.data.length;
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

  onPageChange(evt: {
    page: number;
    pageSize: number;
    term?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const desde = (evt.page - 1) * evt.pageSize;
    const limite = evt.pageSize;
    const term = (evt.term || '').trim();
    const sortKey = (evt.sortKey || '').trim();
    const sortDir = (evt.sortDir || 'asc').toLowerCase() as 'asc' | 'desc';
    this.loading = true;
    this.datosListos = false;
    try {
      this.cdr.detectChanges();
    } catch {}
    if (term) {
      this.api.get<any>(`todo/coleccion/sitios/${encodeURIComponent(term)}`).subscribe({
        next: (resp) => {
          const list = Array.isArray((resp as any)?.resultados)
            ? (resp as any).resultados
            : Array.isArray(resp)
            ? resp
            : [];
          this.total = list.length;
          this.data = list.slice(desde, desde + limite);
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: () => {
          this.error = 'No se pudo filtrar sitios';
          this.loading = false;
          try {
            this.datosListos = false;
            this.cdr.detectChanges();
          } catch {}
        },
      });
    } else {
      this.api.getPaginated('sitios', { desde, limite, sortKey, sortDir }).subscribe({
        next: (res) => {
          this.data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          this.total = Number(res?.total) || this.data.length;
          this.loading = false;
          this.datosListos = true;
          try {
            this.cdr.detectChanges();
          } catch {}
        },
        error: () => {
          this.error = 'No se pudieron cargar sitios';
          this.loading = false;
          try {
            this.datosListos = false;
            this.cdr.detectChanges();
          } catch {}
        },
      });
    }
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
