import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'page-jerarquias',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiSpinnerComponent, UiEntityTableComponent],
  templateUrl: './jerarquias-page.component.html',
  styleUrls: ['./jerarquias-page.component.css'],
})
export class JerarquiasPageComponent implements OnInit {
  title = 'Jerarquías';
  subtitle = 'Jerarquías';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  totalJerarquias = 0;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      const rows = Array.isArray(pre.jerarquias) ? pre.jerarquias : [];
      this.data = rows.map((r: any) => ({
        id: r.id_jerarquia ?? r.id ?? '',
        nombre: r.nombre ?? '',
        descripcion: r.descripcion ?? '',
      }));
      this.totalJerarquias = Number(pre.total) || this.data.length || 0;
      this.datosListos = true;
      this.cdr.detectChanges();
    } else {
      this.cargarDatosAsync();
    }
  }

  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
    ];
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.getPaginated<any>('jerarquias', { desde: 0 }));
      const rows =
        res?.data || Array.isArray(res?.jerarquias)
          ? res.jerarquias
          : Array.isArray(res)
          ? res
          : [];
      this.data = rows.map((r: any) => ({
        id: r.id_jerarquia ?? r.id ?? '',
        nombre: r.nombre ?? '',
        descripcion: r.descripcion ?? '',
      }));
      this.totalJerarquias = Number(res?.total) || this.data.length || 0;
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar jerarquías';
      this.data = [];
      this.datosListos = false;
    }
    this.loading = false;
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
    const applySort = (list: any[]) => {
      if (!sortKey) return list;
      const sorted = [...list].sort((a, b) => {
        const va = a?.[sortKey];
        const vb = b?.[sortKey];
        const na = va === null || va === undefined;
        const nb = vb === null || vb === undefined;
        if (na && nb) return 0;
        if (na) return 1;
        if (nb) return -1;
        const ta = typeof va;
        const tb = typeof vb;
        if (ta === 'number' && tb === 'number') {
          return sortDir === 'asc'
            ? (va as number) - (vb as number)
            : (vb as number) - (va as number);
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
      return sorted;
    };
    this.loading = true;
    if (term) {
      this.api.get<any>(`todo/coleccion/jerarquias/${encodeURIComponent(term)}`).subscribe({
        next: (res) => {
          const list = Array.isArray((res as any)?.resultados)
            ? (res as any).resultados
            : Array.isArray(res)
            ? (res as any)
            : [];
          const mapped = list.map((r: any) => ({
            id: r.id_jerarquia ?? r.id ?? '',
            nombre: r.nombre ?? '',
            descripcion: r.descripcion ?? '',
          }));
          const ordered = applySort(mapped);
          this.totalJerarquias = ordered.length;
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo filtrar jerarquías';
          this.loading = false;
        },
      });
    } else {
      this.api.get<any>('jerarquias', { desde, limite, sortKey, sortDir }).subscribe({
        next: (res) => {
          const rows = Array.isArray(res?.jerarquias)
            ? res.jerarquias
            : Array.isArray(res)
            ? res
            : [];
          const mapped = rows.map((r: any) => ({
            id: r.id_jerarquia ?? r.id ?? '',
            nombre: r.nombre ?? '',
            descripcion: r.descripcion ?? '',
          }));
          const ordered = applySort(mapped);
          this.data = ordered;
          this.totalJerarquias = Number((res as any)?.total) || ordered.length;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar jerarquías';
          this.loading = false;
        },
      });
    }
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  onEdit(event: any) {
    try {
      const id = event?.id || event?.id_jerarquia || event?.ID;
      if (id) {
        this.router.navigate(['/jerarquias/crear'], { queryParams: { id } });
        return;
      }
    } catch {}
    console.log('Editar jerarquía:', event);
  }

  onRemove(event: any) {
    // Stub handler para eliminar una jerarquía desde la tabla
    // Implementar confirmación y llamada a API si se desea
    console.log('Eliminar jerarquía:', event);
  }
}
