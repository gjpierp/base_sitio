import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import {
  setupList,
  onPageChangeGeneric,
  abrirEditarGeneric,
  abrirEditarModalGeneric,
} from '../page-utils';

@Component({
  selector: 'page-sitios',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiButtonComponent,
  ],
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
  currentPage = 1;

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
      setupList(this, 'sitios', 'sitios', (r: any) => ({
        id: r.id_sitio ?? r.id ?? r.ID,
        nombre: r.nombre ?? r.nombre_sitio ?? '',
        dominio: r.dominio ?? r.url ?? r.host ?? '',
      }));
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
    this.currentPage = evt.page;
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
    onPageChangeGeneric(this, evt, 'sitios', (r: any) => ({
      id: r.id_sitio ?? r.id ?? r.ID,
      nombre: r.nombre ?? r.nombre_sitio ?? '',
      dominio: r.dominio ?? r.url ?? r.host ?? '',
    }));
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
    (async () => {
      try {
        await abrirEditarModalGeneric(
          this,
          row,
          'sitios',
          [
            { key: 'nombre', label: 'Nombre', type: 'text' },
            { key: 'dominio', label: 'Dominio', type: 'text' },
          ],
          ['id', 'id_sitio', 'ID']
        );
      } catch (err) {
        try {
          console.error(err);
        } catch {}
      }
    })();
  }
  async onCreate() {
    // Abrir modal para crear nuevo sitio, similar a openCreateModal de aplicaciones-sitio
    try {
      await abrirEditarModalGeneric(
        this,
        {},
        'sitios',
        [
          { key: 'nombre', label: 'Nombre', type: 'text', value: '' },
          { key: 'dominio', label: 'Dominio', type: 'text', value: '' },
        ],
        ['id', 'id_sitio', 'ID']
      );
    } catch (err) {
      try {
        console.error(err);
      } catch {}
    }
  }
}
