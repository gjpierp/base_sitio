import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { ApiService } from '../../services/api.service';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';

@Component({
  selector: 'page-crear-tipos-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiEntityFormComponent,
    UiCardComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './crear-tipos-usuarios-page.component.html',
  styleUrls: ['./crear-tipos-usuarios-page.component.css'],
})
export class CrearTiposUsuariosPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingId: any = null;

  loading = false;
  errorMsg = '';
  successMsg = '';

  nuevo: any = {
    nombre: '',
    descripcion: '',
    activo: 1,
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
  ];

  ngOnInit() {
    const pre = (history.state && (history.state as any)['pre']) || undefined;
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }

    const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
    if (snapshotId) this.loadTipoUsuario(String(snapshotId));

    this.route.queryParams.subscribe((qp) => {
      try {
        const id = qp['id'] || null;
        if (id) {
          if (String(id) !== String(this.editingId)) this.loadTipoUsuario(String(id));
        } else {
          this.editingId = null;
          this.nuevo = { nombre: '', descripcion: '', activo: 1 };
        }
      } catch {}
    });
  }

  private loadTipoUsuario(id: string) {
    if (!id) return;
    this.loading = true;
    this.api.get<any>(`tipos-usuarios/${id}`).subscribe({
      next: (res) => {
        const t = res?.tipo || res?.data || res || null;
        if (t) {
          this.nuevo = {
            nombre: t.nombre ?? '',
            descripcion: t.descripcion ?? '',
            activo: t.activo ?? 1,
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

  crear() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    const body = {
      nombre: this.nuevo.nombre,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
    };
    if (this.editingId) {
      this.api.put(`tipos-usuarios/${this.editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Registro actualizado correctamente';
          setTimeout(() => this.router.navigate(['/tipos-usuarios']), 800);
        },
        error: () => {
          this.errorMsg = 'No se pudo actualizar el registro';
        },
        complete: () => {
          this.loading = false;
        },
      });
      return;
    }

    this.api.post('tipos-usuarios', body).subscribe({
      next: () => {
        this.successMsg = 'Registro creado correctamente';
        this.nuevo = { nombre: '', descripcion: '', activo: 1 };
        setTimeout(() => this.router.navigate(['/tipos-usuarios']), 800);
      },
      error: () => {
        this.errorMsg = 'No se pudo crear el registro';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/tipos-usuarios']);
  }
}
