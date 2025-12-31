import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';

@Component({
  selector: 'page-crear-jerarquias',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityFormComponent,
  ],
  templateUrl: './crear-jerarquias-page.component.html',
  styleUrls: ['./crear-jerarquias-page.component.css'],
})
export class CrearJerarquiasPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMsg = '';
  successMsg = '';

  nuevo: any = {
    nombre: '',
    descripcion: '',
    activo: 1,
    orden: 0,
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'orden', label: 'Orden', type: 'number' },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
  ];

  ngOnInit() {
    const pre = this.route.snapshot && (this.route.snapshot.data as any)['pre'];
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }
    const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
    if (snapshotId) this.loadJerarquia(String(snapshotId));

    this.route.queryParams.subscribe((qp) => {
      try {
        const id = qp['id'] || null;
        if (id) {
          if (String(id) !== String((this as any).editingId)) this.loadJerarquia(String(id));
        } else {
          (this as any).editingId = null;
          this.nuevo = { nombre: '', descripcion: '', activo: 1, orden: 0 };
        }
      } catch {}
    });
  }

  private loadJerarquia(id: string) {
    if (!id) return;
    this.loading = true;
    this.api.get<any>(`jerarquias/${id}`).subscribe({
      next: (res) => {
        const j = res?.jerarquia || res?.data || res || null;
        if (j) {
          this.nuevo = {
            nombre: j.nombre ?? '',
            descripcion: j.descripcion ?? '',
            activo: j.activo ?? 1,
            orden: j.orden ?? 0,
          };
          (this as any).editingId = id;
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
      orden: Number(this.nuevo.orden) || 0,
    };

    const editingId = (this as any).editingId;
    if (editingId) {
      this.api.put(`jerarquias/${editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Jerarquía actualizada correctamente';
          setTimeout(() => this.router.navigate(['/jerarquias']), 600);
        },
        error: (err) => {
          this.errorMsg = (err && err.msg) || 'No se pudo actualizar la jerarquía';
        },
        complete: () => (this.loading = false),
      });
      return;
    }

    this.api.post('jerarquias', body).subscribe({
      next: () => {
        this.successMsg = 'Jerarquía creada correctamente';
        this.nuevo = { nombre: '', descripcion: '', activo: 1, orden: 0 };
        setTimeout(() => this.router.navigate(['/jerarquias']), 600);
      },
      error: (err) => {
        this.errorMsg = (err && err.msg) || 'No se pudo crear la jerarquía';
      },
      complete: () => (this.loading = false),
    });
  }

  crearJerarquia(payload?: any) {
    // Permite recibir el modelo desde el ui-entity-form o usar el estado local
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (payload) {
      this.nuevo = { ...this.nuevo, ...payload };
    }

    const body = {
      nombre: this.nuevo.nombre,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
      orden: Number(this.nuevo.orden) || 0,
    };

    this.api.post('jerarquias', body).subscribe({
      next: () => {
        this.successMsg = 'Jerarquía creada correctamente';
        this.nuevo = { nombre: '', descripcion: '', activo: 1, orden: 0 };
        setTimeout(() => this.router.navigate(['/jerarquias']), 600);
      },
      error: (err) => {
        this.errorMsg = (err && err.msg) || 'No se pudo crear la jerarquía';
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/jerarquias']);
  }
}
