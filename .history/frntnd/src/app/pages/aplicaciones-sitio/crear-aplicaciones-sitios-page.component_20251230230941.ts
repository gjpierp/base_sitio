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
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'ruta', label: 'Ruta', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    {
      key: 'activo',
      label: 'Activo',
      type: 'select',
      options: [
        { label: 'Sí', value: true },
        { label: 'No', value: false },
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
    if (id) this.cargarPorId(id);
    else this.datosListos = true;
  }

  async cargarPorId(id: string) {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.api.get<any>(`aplicaciones-sitio/${id}`) as any);
      const row = res?.data ?? res?.aplicacion ?? res;
      if (row) {
        this.modelo.nombre = row.nombre ?? row.titulo ?? '';
        this.modelo.ruta = row.ruta ?? row.url ?? '';
        this.modelo.descripcion = row.descripcion ?? row.desc ?? '';
        this.modelo.activo = row.activo ?? row.enabled ?? true;
        this.modelo.sitio_id = row.sitio_id ?? row.id_sitio ?? '';
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
      if (id) {
        await firstValueFrom(this.api.put(`aplicaciones-sitio/${id}`, this.modelo) as any);
        this.notify.info('Aplicación actualizada');
        this.successMsg = 'Aplicación actualizada';
      } else {
        await firstValueFrom(this.api.post('aplicaciones-sitio', this.modelo) as any);
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
