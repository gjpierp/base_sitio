import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';

@Component({
  selector: 'page-crear-rol',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiEntityFormComponent,
    UiSpinnerComponent,
    UiCardComponent,
  ],
  templateUrl: './crear-rol-page.component.html',
  styleUrls: ['./crear-rol-page.component.css'],
})
export class CrearRolPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingId: any = null;
  nuevo: any = { nombre: '', descripcion: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';
  datosListos = false;

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
  ];

  isValid() {
    const nombre = (this.nuevo.nombre || '').trim();
    return nombre.length >= 3;
  }

  ngOnInit() {
    const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
    console.debug('[CrearRol] ngOnInit snapshot query id:', snapshotId);
    if (snapshotId) this.loadRole(String(snapshotId));

    this.route.queryParams.subscribe((qp) => {
      console.debug('[CrearRol] queryParams change:', qp);
      try {
        const id = qp['id'] || null;
        if (id) {
          if (String(id) !== String(this.editingId)) this.loadRole(String(id));
        } else {
          this.editingId = null;
          this.nuevo = { nombre: '', descripcion: '' };
        }
      } catch (err) {
        console.error('[CrearRol] error handling queryParams', err);
      }
    });
  }

  private loadRole(id: string) {
    if (!id) return;
    this.loading = true;
    this.api.get<any>(`roles/${id}`).subscribe({
      next: (res) => {
        console.debug('[CrearRol] carga rol response:', res);
        const r = res?.rol || res?.data || res || null;
        if (r) {
          this.nuevo = {
            nombre: r.nombre ?? r.nombre_rol ?? '',
            descripcion: r.descripcion ?? r.desc ?? '',
          };
          this.editingId = id;
          try {
            this.cdr.detectChanges();
          } catch (err) {
            console.error('[CrearRol] cdr.detectChanges error', err);
          }
        } else {
          console.warn('[CrearRol] rol no encontrado en respuesta', res);
        }
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  crear() {
    const nombre = (this.nuevo.nombre || '').trim();
    if (!nombre) {
      this.errorMsg = 'El nombre es requerido (mínimo 3 caracteres)';
      return;
    }
    this.loading = true;
    this.loading = true;
    if (this.editingId) {
      this.api.put(`roles/${this.editingId}`, this.nuevo).subscribe({
        next: () => {
          this.successMsg = 'Registro actualizado correctamente';
          setTimeout(() => this.router.navigate(['/roles']), 600);
        },
        error: (err) => (this.errorMsg = err?.error?.msg || 'No se pudo actualizar el rol'),
        complete: () => (this.loading = false),
      });
      return;
    }
    this.api.post('roles', this.nuevo).subscribe({
      next: () => {
        this.successMsg = 'Registro creado correctamente';
        setTimeout(() => this.router.navigate(['/roles']), 600);
      },
      error: (err) => (this.errorMsg = err?.error?.msg || 'No se pudo crear el rol'),
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/roles']);
  }
}
