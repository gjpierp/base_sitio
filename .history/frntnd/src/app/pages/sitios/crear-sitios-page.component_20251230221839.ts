import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
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
  selector: 'page-crear-sitios',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiSpinnerComponent, UiEntityFormComponent],
  templateUrl: './crear-sitios-page.component.html',
  styleUrls: ['./crear-sitios-page.component.css'],
})
export class CrearSitiosPageComponent implements OnInit {
  title = 'Crear / Editar Sitio';
  loading = false;
  error?: string;
  datosListos = false;

  modelo: any = {
    nombre: '',
    dominio: '',
    descripcion: '',
  };

  successMsg = '';
  errorMsg = '';

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'dominio', label: 'Dominio', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
  ];

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const id = this.route.snapshot.queryParams['id'];
    if (id) {
      this.cargarPorId(id);
    } else {
      this.datosListos = true;
    }
  }

  async cargarPorId(id: string) {
    this.loading = true;
    try {
      const res: any = await this.api.get<any>(`sitios/${id}`).toPromise();
      const row = res?.data ?? res?.sitio ?? res;
      if (row) {
        this.modelo.nombre = row.nombre ?? row.nombre_sitio ?? '';
        this.modelo.dominio = row.dominio ?? row.url ?? row.host ?? '';
        this.modelo.descripcion = row.descripcion ?? row.desc ?? '';
      }
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar el sitio';
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  async guardar(_evt?: any) {
    this.loading = true;
    this.error = undefined;
    try {
      const id = this.route.snapshot.queryParams['id'];
      if (id) {
        await this.api.put(`sitios/${id}`, this.modelo).toPromise();
        this.notify.info('Sitio actualizado');
      } else {
        await this.api.post('sitios', this.modelo).toPromise();
        this.notify.info('Sitio creado');
      }
      this.router.navigate(['/sitios']);
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'Error al guardar sitio';
      this.errorMsg = this.error || '';
    }
    this.loading = false;
  }

  cancelar() {
    this.router.navigate(['/sitios']);
  }
}
