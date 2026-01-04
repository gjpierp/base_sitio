import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { ApiService } from '../../services/api.service';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';

@Component({
  selector: 'page-crear-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityFormComponent,
  ],
  templateUrl: './crear-usuarios-roles-page.component.html',
  styleUrls: ['./crear-usuarios-roles-page.component.css'],
})
export class CrearUsuariosRolesPageComponent implements OnInit {
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
    id_usuario: null,
    id_rol: null,
    descripcion: '',
    activo: 1,
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields: FieldDef[] = [
    { key: 'id_usuario', label: 'Usuario', type: 'text' },
    { key: 'id_rol', label: 'Rol', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
  ];

  ngOnInit() {
    const pre = this.route.snapshot && (this.route.snapshot.data as any)['pre'];
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }

    // Cargar datos maestros (usuarios y roles) antes de aceptar edición
    (async () => {
      try {
        await Promise.all([this.cargarUsuariosAsync(), this.cargarRolesAsync()]);
      } catch {}
    })();

    // Soporta edición: snapshot + suscripción
    try {
      const su = this.route.snapshot.queryParams['id_usuario'] || null;
      const sr = this.route.snapshot.queryParams['id_rol'] || null;
      if (su || sr) {
        if (su && sr) this.loadUsuariosRoles(String(su), String(sr));
        else {
          this.nuevo.id_usuario = su ?? this.nuevo.id_usuario;
          this.nuevo.id_rol = sr ?? this.nuevo.id_rol;
          this.editingKey = `${su || ''}|${sr || ''}`;
        }
      }

      this.route.queryParams.subscribe((qp) => {
        try {
          const id_usuario = qp['id_usuario'] || null;
          const id_rol = qp['id_rol'] || null;
          if (id_usuario && id_rol) {
            const key = `${id_usuario}|${id_rol}`;
            if (key !== this.editingKey) this.loadUsuariosRoles(String(id_usuario), String(id_rol));
          } else if (id_usuario || id_rol) {
            this.nuevo.id_usuario = id_usuario ?? this.nuevo.id_usuario;
            this.nuevo.id_rol = id_rol ?? this.nuevo.id_rol;
            this.editingKey = `${id_usuario || ''}|${id_rol || ''}`;
          } else {
            this.editingKey = null;
            this.nuevo = { id_usuario: null, id_rol: null, descripcion: '', activo: 1 };
          }
        } catch {}
      });
    } catch {}
  }

  private async cargarUsuariosAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('usuarios'));
      const list = Array.isArray(res) ? res : res?.usuarios || res?.data || [];
      const opts = (list || []).map((u: any) => ({
        value: u.id_usuario ?? u.id,
        label: u.nombre || u.nombre_usuario || u.correo || '',
      }));
      try {
        const f = this.fields.find((x) => x.key === 'id_usuario');
        if (f) (f as any).options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  private async cargarRolesAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('roles'));
      const list = Array.isArray(res) ? res : res?.roles || res?.data || [];
      const opts = (list || []).map((r: any) => ({
        value: r.id_rol ?? r.id,
        label: r.nombre || '',
      }));
      try {
        const f = this.fields.find((x) => x.key === 'id_rol');
        if (f) (f as any).options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  private loadUsuariosRoles(uid: string, rid: string) {
    if (!uid || !rid) return;
    this.loading = true;
    this.api.get<any>(`usuarios_roles/${uid}/${rid}`).subscribe({
      next: (res) => {
        const rec = res?.usuarios_roles || res?.data || res || null;
        if (rec) {
          this.nuevo = {
            id_usuario: rec.id_usuario ?? uid,
            id_rol: rec.id_rol ?? rid,
            descripcion: rec.descripcion ?? '',
            activo: rec.activo ?? 1,
          };
          this.editingKey = `${uid}|${rid}`;
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
      id_usuario: this.nuevo.id_usuario,
      id_rol: this.nuevo.id_rol,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
    };

    const editingKey = (this as any).editingKey;
    if (editingKey) {
      // Intentar PUT en endpoint compuesto; si falla, mostrar error
      const [uid, rid] = editingKey.split('|');
      this.api.put(`usuarios_roles/${uid}/${rid}`, body).subscribe({
        next: () => {
          this.successMsg = 'Asignación actualizada correctamente';
          setTimeout(() => this.router.navigate(['/usuarios-roles']), 600);
        },
        error: (err) => {
          this.errorMsg = (err && err.msg) || 'No se pudo actualizar la asignación';
        },
        complete: () => (this.loading = false),
      });
      return;
    }

    this.api.post('usuarios_roles', body).subscribe({
      next: () => {
        this.successMsg = 'Asignación creada correctamente';
        this.nuevo = { id_usuario: null, id_rol: null, descripcion: '', activo: 1 };
        setTimeout(() => this.router.navigate(['/usuarios-roles']), 600);
      },
      error: (err) => {
        this.errorMsg = (err && err.msg) || 'No se pudo crear la asignación';
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/usuarios-roles']);
  }
}
