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
  selector: 'page-crear-themes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiSpinnerComponent, UiEntityFormComponent],
  templateUrl: './crear-themes-admin-page.component.html',
  styleUrls: ['./crear-themes-admin-page.component.css'],
})
export class CrearThemesAdminPageComponent implements OnInit {
  title = 'Crear / Editar Tema Admin';
  loading = false;
  error?: string;
  datosListos = false;

  modelo: any = {
    nombre: '',
    primaryColor: '#0b5fff',
    secondaryColor: '#f0f0f0',
    description: '',
  };

  successMsg = '';
  errorMsg = '';

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'primaryColor', label: 'Color primario', type: 'text' },
    { key: 'secondaryColor', label: 'Color secundario', type: 'text' },
    { key: 'description', label: 'Descripción', type: 'text' },
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
      const res: any = await this.api.get<any>(`themes-admin/${id}`).toPromise();
      const row = res?.data ?? res?.theme ?? res;
      if (row) {
        this.modelo.nombre = row.nombre ?? row.name ?? '';
        this.modelo.primaryColor =
          row.primaryColor ?? row.primary_color ?? this.modelo.primaryColor;
        this.modelo.secondaryColor =
          row.secondaryColor ?? row.secondary_color ?? this.modelo.secondaryColor;
        this.modelo.description = row.descripcion ?? row.description ?? '';
      }
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar el tema';
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
        await this.api.put(`themes-admin/${id}`, this.modelo).toPromise();
        this.notify.info('Tema actualizado');
      } else {
        await this.api.post('themes-admin', this.modelo).toPromise();
        this.notify.info('Tema creado');
      }
      this.router.navigate(['/themes-admin']);
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'Error al guardar tema';
    }
    this.loading = false;
  }

  cancelar() {
    this.router.navigate(['/themes-admin']);
  }
}
