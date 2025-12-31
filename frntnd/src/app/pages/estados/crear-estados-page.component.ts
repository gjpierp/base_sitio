import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'page-crear-estados',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityFormComponent,
  ],
  templateUrl: './crear-estados-page.component.html',
  styleUrls: ['./crear-estados-page.component.css'],
})
export class CrearEstadosPageComponent implements OnInit {
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
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
  ];

  ngOnInit() {
    const pre = (history.state && (history.state as any)['pre']) || undefined;
    // Also check route resolver (if used)
    try {
      const routePre = (window as any).__ngPreData?.pre;
      if (
        routePre &&
        routePre.estados &&
        Array.isArray(routePre.estados) &&
        routePre.estados.length
      ) {
        // don't override; keep defaults
      }
    } catch {}
    // If caller passed a prefill in history state, use it
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }
    // Soporta edición: snapshot + suscripción
    const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
    if (snapshotId) this.loadEstado(String(snapshotId));

    this.route.queryParams.subscribe((qp) => {
      try {
        const id = qp['id'] || null;
        if (id) {
          if (String(id) !== String((this as any).editingId)) this.loadEstado(String(id));
        } else {
          (this as any).editingId = null;
          this.nuevo = { nombre: '', descripcion: '', activo: 1 };
        }
      } catch {}
    });
  }

  private loadEstado(id: string) {
    if (!id) return;
    this.loading = true;
    this.api.get<any>(`estados/${id}`).subscribe({
      next: (res) => {
        const e = res?.estado || res?.data || res || null;
        if (e) {
          this.nuevo = {
            nombre: e.nombre ?? '',
            descripcion: e.descripcion ?? '',
            activo: e.activo ?? 1,
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

  crearEstado(payload?: any) {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    if (payload) this.nuevo = { ...this.nuevo, ...payload };
    const body = {
      nombre: this.nuevo.nombre,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
    };
    const editingId = (this as any).editingId;
    if (editingId) {
      this.api.put(`estados/${editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Estado actualizado correctamente';
          setTimeout(() => this.router.navigate(['/estados']), 600);
        },
        error: () => {
          this.errorMsg = 'No se pudo actualizar el estado';
        },
        complete: () => {
          this.loading = false;
        },
      });
      return;
    }

    this.api.post('estados', body).subscribe({
      next: () => {
        this.successMsg = 'Estado creado correctamente';
        // limpiar formulario
        this.nuevo = { nombre: '', descripcion: '', activo: 1 };
        setTimeout(() => this.router.navigate(['/estados']), 800);
      },
      error: () => {
        this.errorMsg = 'No se pudo crear el estado';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  cancelar() {
    this.router.navigate(['/estados']);
  }
}
