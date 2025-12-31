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
  selector: 'page-crear-permiso',
  standalone: true,
  imports: [CommonModule, RouterModule, UiEntityFormComponent, UiSpinnerComponent, UiCardComponent],
  templateUrl: './crear-permiso-page.component.html',
  styleUrls: ['../usuarios/crear-usuario-page.component.css'],
})
export class CrearPermisoPageComponent {
  ngOnInit() {
    try {
      const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
      if (snapshotId) this.loadPermiso(String(snapshotId));
      this.route.queryParams.subscribe((qp) => {
        try {
          const id = qp['id'] || null;
          if (id) {
            if (String(id) !== String(this.editingId)) this.loadPermiso(String(id));
          } else {
            this.editingId = null;
            this.nuevo = { codigo: '', descripcion: '' };
          }
        } catch {}
      });
    } catch {}
  }
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingId: any = null;
  nuevo: any = { codigo: '', descripcion: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  fields: FieldDef[] = [
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
  ];

  isValid() {
    const codigo = (this.nuevo.codigo || '').trim();
    return codigo.length >= 3;
  }

  crear() {
    const codigo = (this.nuevo.codigo || '').trim();
    if (!codigo) {
      this.errorMsg = 'El código es requerido (mínimo 3 caracteres)';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    if (this.editingId) {
      // Backend espera `{ nombre, descripcion }` for crear/actualizar in adm_permisos
      const body = { nombre: codigo, descripcion: this.nuevo.descripcion };
      this.api.put(`permisos/${this.editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Registro actualizado correctamente';
          setTimeout(() => this.router.navigate(['/permisos']), 600);
        },
        error: (err) => (this.errorMsg = err?.error?.msg || 'No se pudo actualizar el permiso'),
        complete: () => (this.loading = false),
      });
      return;
    }
    const body = { nombre: codigo, descripcion: this.nuevo.descripcion };
    this.api.post('permisos', body).subscribe({
      next: () => {
        this.successMsg = 'Registro creado correctamente';
        setTimeout(() => this.router.navigate(['/permisos']), 600);
      },
      error: (err) => (this.errorMsg = err?.error?.msg || 'No se pudo crear el permiso'),
      complete: () => (this.loading = false),
    });
  }

  private loadPermiso(id: string) {
    if (!id) return;
    this.loading = true;
    this.api.get<any>(`permisos/${id}`).subscribe({
      next: (res) => {
        const p = res?.permiso || res?.data || res || null;
        if (p) {
          this.nuevo = {
            codigo: p.codigo ?? p.nombre ?? p.nombre_permiso ?? '',
            descripcion: p.descripcion ?? p.desc ?? '',
          };
          this.editingId = id;
          try {
            this.cdr.detectChanges();
          } catch {}
        }
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/permisos']);
  }
}
