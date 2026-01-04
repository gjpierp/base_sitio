import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgIf, NgForOf, NgSwitch, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { ApiService } from '../../services/api.service';
import { setupList, onPageChangeGeneric, abrirEditarGeneric } from '../page-utils';
import Swal from 'sweetalert2';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'page-aplicaciones-sitio',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgSwitch,
    JsonPipe,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityTableComponent,
    UiModalComponent,
  ],
  templateUrl: './aplicaciones-sitio-page.component.html',
  styleUrls: ['./aplicaciones-sitio-page.component.css'],
})
export class AplicacionesSitioPageComponent implements OnInit {
  title = 'Aplicaciones Sitio';
  subtitle = 'Aplicaciones del sitio';
  data: any[] = [];
  loading = false;
  error?: string;
  datosListos = false;

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estado para modal integrado
  modalOpen = false;
  modalTitle = '';
  modalFields: any[] = [];
  modalValues: any = {};
  modalSaving = false;

  ngOnInit() {
    try {
      console.debug('[AplicacionesSitio] route snapshot pre:', this.route?.snapshot?.data?.['pre']);
    } catch {}

    setupList(this, 'aplicaciones_sitio', 'aplicaciones', (r: any) => ({
      id: r.id_aplicacion ?? r.id ?? r.ID,
      nombre: r.nombre ?? r.titulo ?? r.name,
      activo: r.activo ?? r.estado ?? true,
    }));
    // Fallback: si por alguna razón setupList no cargó datos (errores de ruta/API), intentar cargar explícitamente
    setTimeout(async () => {
      try {
        if (!this.datosListos && !this.loading) {
          try {
            console.debug('[AplicacionesSitio] fallback: datosListos=false, llamando a load()');
            await this.load();
          } catch (err) {
            console.error('[AplicacionesSitio] fallback load error:', err);
          }
        }
      } catch (e) {}
    }, 500);
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(
        this.api.getPaginated('aplicaciones_sitio', { desde: 0 }) as any
      );
      const rows = res?.data || [];
      this.data = rows.map((r: any) => ({
        id: r.id_aplicacion ?? r.id ?? r.ID,
        nombre: r.nombre ?? r.titulo ?? r.name,
        activo: r.activo ?? r.estado ?? true,
      }));
      this.total = Number(res?.total) || this.data.length || 0;
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudieron cargar aplicaciones';
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
    onPageChangeGeneric(this, evt, 'aplicaciones_sitio', (r: any) => ({
      id: r.id_aplicacion ?? r.id ?? r.ID,
      nombre: r.nombre ?? r.titulo ?? r.name,
      activo: r.activo ?? r.estado ?? true,
    }));
  }

  total = 0;

  get columns() {
    return [
      { key: 'nombre', label: 'Nombre' },
      { key: 'activo', label: 'Activo' },
    ];
  }

  onEdit(item: any) {
    (async () => {
      try {
        try {
          console.debug('[AplicacionesSitio] onEdit called', item);
        } catch {}
        // resolver id posible
        let id: any = null;
        for (const k of ['id', 'id_aplicacion', 'ID']) {
          if (item?.[k] != null) {
            id = item[k];
            break;
          }
        }
        if (id === null || id === undefined) id = item?.id ?? null;

        if (id === null || id === undefined) {
          try {
            const ok = abrirEditarGeneric(this, item, '/aplicaciones-sitio/crear', [
              'id',
              'id_aplicacion',
              'ID',
            ]);
            if (ok) return;
          } catch {}
          return;
        }

        // Cargar detalle completo desde API
        let row: any = null;
        try {
          const resp: any = await firstValueFrom(
            this.api.get<any>(`aplicaciones_sitio/${id}`) as any
          );
          row = resp?.aplicacion ?? resp?.data ?? resp;
        } catch {
          row = null;
        }

        // Cargar opciones de sitios para select
        let sitioOptions: { value: string | number; label: string }[] = [];
        try {
          const sresp: any = await firstValueFrom(
            this.api.getPaginated('sitios', { desde: 0 }) as any
          );
          const srows = sresp?.data || sresp?.sitios || sresp || [];
          sitioOptions = (Array.isArray(srows) ? srows : []).map((s: any) => ({
            value: String(s.id_sitio ?? s.id ?? ''),
            label: s.nombre ?? s.titulo ?? String(s.id_sitio ?? s.id ?? ''),
          }));
        } catch {}

        // Construir fields para swalForm
        const formFields: any[] = [];
        const valOr = (k: string, alt?: any) => (row && row[k] != null ? row[k] : alt ?? '');
        formFields.push({
          key: 'nombre',
          label: 'Nombre',
          type: 'text',
          value: valOr('nombre', ''),
        });
        formFields.push({ key: 'clave', label: 'Clave', type: 'text', value: valOr('clave', '') });
        formFields.push({ key: 'ruta', label: 'Ruta', type: 'text', value: valOr('ruta', '') });
        formFields.push({
          key: 'descripcion',
          label: 'Descripción',
          type: 'text',
          value: valOr('descripcion', ''),
        });
        formFields.push({
          key: 'sitio_id',
          label: 'Sitio',
          type: 'select',
          options: sitioOptions,
          value: String(valOr('sitio_id', valOr('id_sitio', ''))),
        });
        formFields.push({
          key: 'activo',
          label: 'Activo',
          type: 'select',
          options: [
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ],
          value: String(valOr('activo', true)),
        });

        // Abrir modal integrado con los campos construidos
        this.modalTitle = 'Editar aplicación';
        this.modalFields = formFields;
        // inicializar valores por defecto en modalValues
        this.modalValues = {};
        for (const f of formFields) {
          this.modalValues[f.key] = f.value ?? '';
        }
        this.modalOpen = true;
        try {
          this.cdr.detectChanges();
        } catch {}
        return;
      } catch (err) {
        try {
          console.error(err);
        } catch {}
      }
    })();
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar aplicación?')) {
      // Llamada a API para eliminar si se requiere
    }
  }

  // Abrir modal para crear nueva aplicación
  async openCreateModal() {
    try {
      // Abrir modal inmediatamente con campos básicos (sitio options vacías)
      const formFields: any[] = [];
      formFields.push({ key: 'nombre', label: 'Nombre', type: 'text', value: '' });
      formFields.push({ key: 'clave', label: 'Clave', type: 'text', value: '' });
      formFields.push({ key: 'ruta', label: 'Ruta', type: 'text', value: '' });
      formFields.push({ key: 'descripcion', label: 'Descripción', type: 'text', value: '' });
      formFields.push({
        key: 'sitio_id',
        label: 'Sitio',
        type: 'select',
        options: [],
        value: '',
      });
      formFields.push({
        key: 'activo',
        label: 'Activo',
        type: 'select',
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
        value: 'true',
      });

      this.modalTitle = 'Crear aplicación';
      this.modalFields = formFields;
      this.modalValues = {};
      for (const f of formFields) this.modalValues[f.key] = f.value ?? '';
      this.modalOpen = true;
      try {
        this.cdr.detectChanges();
      } catch {}

      // Cargar opciones de sitios en background y actualizar campos
      try {
        const sresp: any = await firstValueFrom(
          this.api.getPaginated('sitios', { desde: 0 }) as any
        );
        const srows = sresp?.data || sresp?.sitios || sresp || [];
        const sitioOptions = (Array.isArray(srows) ? srows : []).map((s: any) => ({
          value: String(s.id_sitio ?? s.id ?? ''),
          label: s.nombre ?? s.titulo ?? String(s.id_sitio ?? s.id ?? ''),
        }));
        const f = this.modalFields.find((x: any) => x.key === 'sitio_id');
        if (f) f.options = sitioOptions;
        try {
          this.cdr.detectChanges();
        } catch {}
      } catch (err) {
        // ignore
      }
    } catch (err) {
      try {
        console.error(err);
      } catch {}
    }
  }

  // Handler cuando se confirma el modal
  async onModalConfirm() {
    if (!this.modalFields || this.modalFields.length === 0) return;
    if (this.modalSaving) return;
    this.modalSaving = true;
    try {
      // construir payload desde modalValues
      const result = this.modalValues;
      const payload: any = {};
      payload.nombre = result.nombre ?? '';
      if (result.clave !== undefined) payload.clave = result.clave;
      payload.ruta = result.ruta ?? '';
      payload.descripcion = result.descripcion ?? '';
      try {
        payload.sitio_id =
          result.sitio_id !== undefined && result.sitio_id !== null && result.sitio_id !== ''
            ? Number(result.sitio_id)
            : null;
        if (Number.isNaN(payload.sitio_id)) payload.sitio_id = null;
      } catch {
        payload.sitio_id = null;
      }
      try {
        if (typeof result.activo === 'string')
          payload.activo = result.activo === 'true' || result.activo === '1';
        else payload.activo = !!result.activo;
      } catch {
        payload.activo = true;
      }

      // Determinar id destino a partir de modalFields (si tenía un campo id en valores)
      const id = result.id ?? result.id_aplicacion ?? null;
      if (id === null || id === undefined) {
        // crear nuevo
        await firstValueFrom(this.api.post('aplicaciones_sitio', payload) as any);
        await Swal.fire('Guardado', 'Aplicación creada', 'success');
      } else {
        await firstValueFrom(this.api.put(`aplicaciones_sitio/${id}`, payload) as any);
        await Swal.fire('Guardado', 'Aplicación actualizada', 'success');
      }

      this.modalOpen = false;
      try {
        await this.load();
      } catch {}
    } catch (err) {
      console.error('Error saving aplicación, payload:', { payload: this.modalValues, err });
      const serverMsg = (err as any)?.error?.msg || (err as any)?.message || JSON.stringify(err);
      await Swal.fire('Error', serverMsg || 'No se pudo guardar', 'error');
    } finally {
      this.modalSaving = false;
    }
  }

  onModalClosed() {
    this.modalOpen = false;
    this.modalFields = [];
    this.modalValues = {};
  }
}
