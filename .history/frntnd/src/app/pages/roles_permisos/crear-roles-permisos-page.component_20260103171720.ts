import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';

@Component({
  selector: 'page-crear-roles-permisos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiEntityFormComponent,
    UiCardComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './crear-roles-permisos-page.component.html',
  styleUrls: ['./crear-roles-permisos-page.component.css'],
})
export class CrearRolesPermisosPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingKey: string | null = null;

  loading = false;
  errorMsg = '';
  successMsg = '';
  datosListos = false;

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
    // Cargar maestros (roles y permisos) si aplica
    (async () => {
      try {
        await Promise.all([this.cargarRolesAsync(), this.cargarPermisosAsync()]);
      } catch {}
    })();

    try {
      const sr = this.route.snapshot.queryParams['id_rol'] || null;
      const sp = this.route.snapshot.queryParams['id_permiso'] || null;
      if (sr || sp) {
        if (sr && sp) this.loadRolesPermisos(String(sr), String(sp));
        else {
          this.nuevo = {
            ...this.nuevo,
            id_rol: sr ?? this.nuevo.id_rol,
            id_permiso: sp ?? this.nuevo.id_permiso,
          } as any;
          this.editingKey = `${sr || ''}|${sp || ''}`;
        }
      }

      this.route.queryParams.subscribe((qp) => {
        try {
          const id_rol = qp['id_rol'] || null;
          const id_permiso = qp['id_permiso'] || null;
          if (id_rol && id_permiso) {
            const key = `${id_rol}|${id_permiso}`;
            if (key !== this.editingKey) this.loadRolesPermisos(String(id_rol), String(id_permiso));
          } else if (id_rol || id_permiso) {
            this.nuevo = {
              ...this.nuevo,
              id_rol: id_rol ?? this.nuevo.id_rol,
              id_permiso: id_permiso ?? this.nuevo.id_permiso,
            } as any;
            this.editingKey = `${id_rol || ''}|${id_permiso || ''}`;
          } else {
            this.editingKey = null;
            this.nuevo = { nombre: '', descripcion: '', activo: 1 };
          }
        } catch {}
      });
    } catch {}
  }

  private async cargarRolesAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('roles'));
      const list = Array.isArray(res) ? res : res?.roles || res?.data || [];
      // store if needed later; set options in fields if present
      try {
        const f = this.fields.find((x) => (x as any).key === 'id_rol');
        const opts = (list || []).map((r: any) => ({
          value: r.id_rol ?? r.id,
          label: r.nombre || '',
        }));
        if (f) (f as any).options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  private async cargarPermisosAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('permisos'));
      const list = Array.isArray(res) ? res : res?.permisos || res?.data || [];
      try {
        const f = this.fields.find((x) => (x as any).key === 'id_permiso');
        const opts = (list || []).map((p: any) => ({
          value: p.id_permiso ?? p.id,
          label: p.codigo || p.nombre || '',
        }));
        if (f) (f as any).options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  private loadRolesPermisos(rid: string, pid: string) {
    if (!rid || !pid) return;
    this.loading = true;
    this.api.get<any>(`roles-permisos/${rid}/${pid}`).subscribe({
      next: (res) => {
        const rec = res?.data || res || null;
        if (rec) {
          this.nuevo = {
            ...this.nuevo,
            id_rol: rec.id_rol ?? rid,
            id_permiso: rec.id_permiso ?? pid,
            nombre: rec.nombre ?? this.nuevo.nombre,
            descripcion: rec.descripcion ?? this.nuevo.descripcion,
            activo: rec.activo ?? this.nuevo.activo,
          } as any;
          this.editingKey = `${rid}|${pid}`;
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
    if (this.editingKey) {
      const [rid, pid] = (this.editingKey || '').split('|');
      this.api.put(`roles-permisos/${rid}/${pid}`, body).subscribe({
        next: () => {
          this.successMsg = 'Registro actualizado correctamente';
          setTimeout(() => this.router.navigate(['/roles-permisos']), 800);
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

    this.api.post('roles-permisos', body).subscribe({
      next: () => {
        this.successMsg = 'Registro creado correctamente';
        this.nuevo = { nombre: '', descripcion: '', activo: 1 };
        setTimeout(() => this.router.navigate(['/roles-permisos']), 800);
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
    this.router.navigate(['/roles-permisos']);
  }
}
