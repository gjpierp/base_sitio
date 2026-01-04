import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import {
  UiEntityFormComponent,
  FieldDef,
} from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';

@Component({
  selector: 'page-crear-aplicaciones-sitio',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiSpinnerComponent, UiEntityFormComponent],
  templateUrl: './crear-aplicaciones-sitios-page.component.html',
  styleUrls: ['./crear-aplicaciones-sitios-page.component.css'],
})
export class CrearAplicacionesSitioPageComponent implements OnInit {
  title = 'Crear / Editar Aplicación (Sitio)';
  loading = false;
  error?: string;
  // messages expected by `ui-entity-form`
  successMsg = '';
  errorMsg = '';
  datosListos = false;

  modelo: any = {
    nombre: '',
    ruta: '',
    descripcion: '',
    activo: true,
    sitio_id: '',
  };

  // formulario dinámico para `UiEntityFormComponent`
  fields: FieldDef[] = [
    { key: 'clave', label: 'Clave', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'ruta', label: 'Ruta', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    {
      key: 'activo',
      label: 'Activo',
      type: 'select',
      // usar strings para asegurar que el select y el modelo coincidan en tipo
      options: [
        { label: 'Sí', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    { key: 'sitio_id', label: 'Sitio', type: 'select', options: [] },
  ];

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const id = this.route.snapshot.queryParams['id'];
    this.loadSitios();
    if (id) this.cargarPorId(id);
    else this.datosListos = true;
  }

  async loadSitios() {
    try {
      const resp: any = await firstValueFrom(
        this.api.getPaginated<any>('sitios', { desde: 0 }) as any
      );
      const sitios = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp?.sitios)
        ? resp.sitios
        : Array.isArray(resp)
        ? resp
        : [];
      const opts = sitios.map((s: any) => ({
        label: s.nombre ?? s.title ?? `#${s.id_sitio ?? s.id}`,
        value: String(s.id_sitio ?? s.id),
      }));
      const f = this.fields.find((x) => x.key === 'sitio_id');
      if (f) f.options = opts;
    } catch (err) {
      // ignorar fallos de carga de opciones; el select quedará vacío
    }
  }

  async cargarPorId(id: string) {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>(`aplicaciones_sitio/${id}`) as any);
      const row = res?.data ?? res?.aplicacion ?? res;
      if (row) {
        // Mapeos directos conocidos
        this.modelo.nombre = row.nombre ?? row.titulo ?? '';
        this.modelo.ruta = row.ruta ?? row.url ?? '';
        this.modelo.descripcion = row.descripcion ?? row.desc ?? '';
        this.modelo.activo = row.activo ?? row.enabled ?? true;
        this.modelo.sitio_id = row.sitio_id ?? row.id_sitio ?? '';
        this.modelo.clave = row.clave ?? row.key ?? this.modelo.clave ?? '';

        // Asignar dinámicamente cualquier otra propiedad retornada por el API
        // (no sobrescribir campos ya mapeados a menos que estén vacíos)
        for (const k of Object.keys(row || {})) {
          if (
            k === 'id_sitio' ||
            k === 'sitio_id' ||
            k === 'nombre' ||
            k === 'ruta' ||
            k === 'url' ||
            k === 'descripcion' ||
            k === 'activo' ||
            k === 'clave' ||
            k === 'titulo' ||
            k === 'desc'
          )
            continue;
          try {
            if (this.modelo[k] === undefined || this.modelo[k] === null || this.modelo[k] === '') {
              this.modelo[k] = row[k];
            }
          } catch {}
        }
        // Asegurar tipos para selects: usar string para sitio_id y activo
        try {
          this.modelo.sitio_id =
            (row.sitio_id ?? row.id_sitio ?? this.modelo.sitio_id ?? '') !== null
              ? String(row.sitio_id ?? row.id_sitio ?? this.modelo.sitio_id ?? '')
              : '';
        } catch {}
        try {
          this.modelo.activo =
            row.activo !== undefined ? String(row.activo) : String(this.modelo.activo);
        } catch {}
      }
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar la aplicación';
      this.errorMsg = this.error || '';
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  async guardar(_evt?: any) {
    this.loading = true;
    this.error = undefined;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      const id = this.route.snapshot.queryParams['id'];
      // Normalizar tipos: sitio_id -> number, activo -> boolean
      const payload: any = { ...(this.modelo || {}) };
      try {
        if (
          payload.sitio_id !== undefined &&
          payload.sitio_id !== null &&
          payload.sitio_id !== ''
        ) {
          payload.sitio_id = Number(payload.sitio_id);
          if (Number.isNaN(payload.sitio_id)) payload.sitio_id = null;
        }
      } catch {}
      try {
        if (payload.activo !== undefined && payload.activo !== null) {
          if (typeof payload.activo === 'string')
            payload.activo = payload.activo === 'true' || payload.activo === '1';
          else payload.activo = !!payload.activo;
        }
      } catch {}

      if (id) {
        await firstValueFrom(this.api.put(`aplicaciones_sitio/${id}`, payload) as any);
        this.notify.info('Aplicación actualizada');
        this.successMsg = 'Aplicación actualizada';
      } else {
        await firstValueFrom(this.api.post('aplicaciones_sitio', payload) as any);
        this.notify.info('Aplicación creada');
        this.successMsg = 'Aplicación creada';
      }
      this.router.navigate(['/aplicaciones-sitio']);
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'Error al guardar aplicación';
      this.errorMsg = this.error || '';
    }
    this.loading = false;
  }

  cancelar() {
    this.router.navigate(['/aplicaciones-sitio']);
  }
}
