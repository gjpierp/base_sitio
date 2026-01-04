import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toPromise } from '../../utils/promise-utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ApiService } from '../../services/api.service';
import { Estado } from '../../models/estado';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'page-estados',
  standalone: true,
  imports: [CommonModule, FormsModule, UiEntityTableComponent, UiSpinnerComponent, UiCardComponent],
  templateUrl: './estados-page.component.html',
  styleUrls: ['./estados-page.component.css'],
})
export class EstadosPageComponent implements OnInit {
  title = 'Estados';
  subtitle = 'Estados';
  data: Estado[] = [];
  loading = false;
  error?: string;
  datosListos = false;
  total = 0;

  estadoAEliminar: any = null;
  estadoAEditar: any = null;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(NotificationService);

  constructor() {}

  ngOnInit() {
    const pre = this.route.snapshot.data?.['pre'];
    if (pre) {
      const rows = Array.isArray(pre.estados) ? pre.estados : [];
      this.data = rows.map((r: any) => ({
        id_estado: Number(r.id_estado ?? r.id ?? r.ID ?? 0),
        nombre: r.nombre ?? r.nombre_estado ?? r.name ?? '',
        descripcion: r.descripcion ?? r.descripcion_estado ?? r.desc ?? '',
      }));
      this.total = Number(pre.total) || this.data.length || 0;
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

  get dataFormateada() {
    return this.data.map((e) => ({
      ...e,
    }));
  }

  async cargarDatosAsync() {
    this.loading = true;
    try {
      const res: any = await toPromise(this.api.getPaginated<any>('estados', { desde: 0 }));
      const toArray = (v: any): any[] => {
        if (Array.isArray(v)) return v;
        if (v && typeof v === 'object') {
          if (Array.isArray(v.data)) return v.data;
          if (Array.isArray(v.items)) return v.items;
          if (Array.isArray(v.rows)) return v.rows;
          try {
            const values = Object.values(v);
            if (Array.isArray(values)) return values as any[];
          } catch {}
        }
        return [];
      };
      let rows: any[] = [];
      const candidates = [res?.data, res?.estados, res?.items, res?.rows, res];
      for (const c of candidates) {
        const arr = toArray(c);
        if (arr.length) {
          rows = arr;
          break;
        }
      }
      this.data = rows.map((r: any) => ({
        id_estado: Number(r.id_estado ?? r.id ?? r.ID ?? 0),
        nombre: r.nombre ?? r.nombre_estado ?? r.name ?? '',
        descripcion: r.descripcion ?? r.descripcion_estado ?? r.desc ?? '',
      }));
      this.total = Number(res?.total) || rows.length || 0;
      this.datosListos = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar estados';
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
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
      return sorted;
    };
    this.loading = true;
    if (term) {
      this.api.get<any>(`todo/coleccion/estados/${encodeURIComponent(term)}`).subscribe({
        next: (res) => {
          const list = Array.isArray((res as any)?.resultados)
            ? (res as any).resultados
            : Array.isArray((res as any)?.estados)
            ? (res as any).estados
            : Array.isArray(res)
            ? (res as any)
            : [];
          const mapped = list.map((r: any) => ({
            id_estado: Number(r.id_estado ?? r.id ?? r.ID ?? 0),
            nombre: r.nombre ?? r.name ?? '',
            descripcion: r.descripcion ?? r.desc ?? '',
          }));
          const ordered = applySort(mapped);
          this.total = ordered.length;
          this.data = ordered.slice(desde, desde + limite);
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo filtrar estados';
          this.loading = false;
        },
      });
    } else {
      this.api.get<any>('estados', { desde, limite, sortKey, sortDir }).subscribe({
        next: (res) => {
          const rows = Array.isArray(res?.estados) ? res.estados : Array.isArray(res) ? res : [];
          const mapped = rows.map((r: any) => ({
            id_estado: Number(r.id_estado ?? r.id ?? r.ID ?? 0),
            nombre: r.nombre ?? r.name ?? '',
            descripcion: r.descripcion ?? r.desc ?? '',
          }));
          const ordered = applySort(mapped);
          this.data = ordered;
          this.total = Number((res as any)?.total) || ordered.length;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar estados';
          this.loading = false;
        },
      });
    }
  }

  refrescar() {
    this.cargarDatosAsync();
  }

  onEditEstado(e: any) {
    this.estadoAEditar = e;
    try {
      const id = e?.id_estado || e?.id || e?.ID;
      if (id) {
        this.router.navigate(['/estados/crear'], { queryParams: { id } });
        return;
      }
    } catch {}
    this.notify.warning('No se pudo iniciar la edición');
  }

  onRemoveEstado(e: any) {
    this.estadoAEliminar = e;
    if (confirm('¿Seguro que deseas eliminar este estado?')) {
      alert('Estado eliminado: ' + JSON.stringify(e));
    }
  }

  // Generic handlers for consistency across pages (normalize API)
  onEdit(e: any) {
    try {
      return (this as any).onEditEstado ? (this as any).onEditEstado(e) : undefined;
    } catch (err) {
      // swallow to avoid breaking templates
    }
  }

  onRemove(e: any) {
    try {
      return (this as any).onRemoveEstado ? (this as any).onRemoveEstado(e) : undefined;
    } catch (err) {
      // swallow
    }
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
