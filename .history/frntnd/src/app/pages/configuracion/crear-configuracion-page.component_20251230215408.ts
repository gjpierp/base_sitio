import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiEntityFormComponent } from "../../components/ui-templates/ui-entity-form/ui-entity-form.component";

@Component({
  selector: 'page-crear-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiSpinnerComponent, UiEntityFormComponent],
  templateUrl: './crear-configuracion-page.component.html',
  styleUrls: ['./crear-configuracion-page.component.css'],
})
export class CrearConfiguracionPageComponent implements OnInit {
  title = 'Crear / Editar Configuración';
  loading = false;
  error?: string;
  datosListos = false;

  modelo: any = {
    clave: '',
    valor: '',
    descripcion: '',
    activo: true,
  };

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
      const res: any = await this.api.get<any>(`configuraciones/${id}`).toPromise();
      const row = res?.data ?? res?.configuracion ?? res;
      if (row) {
        this.modelo.clave = row.clave ?? row.key ?? '';
        this.modelo.valor = row.valor ?? row.value ?? '';
        this.modelo.descripcion = row.descripcion ?? row.desc ?? '';
        this.modelo.activo = row.activo ?? row.enabled ?? true;
      }
      this.datosListos = true;
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'No se pudo cargar la configuración';
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
  }

  async guardar() {
    this.loading = true;
    this.error = undefined;
    try {
      const id = this.route.snapshot.queryParams['id'];
      if (id) {
        await this.api.put(`configuraciones/${id}`, this.modelo).toPromise();
        this.notify.info('Configuración actualizada');
      } else {
        await this.api.post('configuraciones', this.modelo).toPromise();
        this.notify.info('Configuración creada');
      }
      this.router.navigate(['/configuracion']);
    } catch (err) {
      this.error = (err as any)?.error?.msg || 'Error al guardar configuración';
    }
    this.loading = false;
  }

  cancelar() {
    this.router.navigate(['/configuracion']);
  }
}
