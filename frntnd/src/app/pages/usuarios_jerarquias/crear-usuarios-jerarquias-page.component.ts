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
  selector: 'page-crear-usuarios-jerarquias',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiEntityFormComponent,
  ],
  templateUrl: './crear-usuarios-jerarquias-page.component.html',
  styleUrls: ['./crear-usuarios-jerarquias-page.component.css'],
})
export class CrearUsuariosJerarquiasPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingKey: string | null = null;

  loading = false;
  errorMsg = '';
  successMsg = '';

  nuevo: any = {
    id_usuario: null,
    id_jerarquia: null,
    descripcion: '',
    activo: 1,
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields: FieldDef[] = [
    { key: 'id_usuario', label: 'Usuario', type: 'text' },
    { key: 'id_jerarquia', label: 'Jerarquía', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
  ];

  ngOnInit() {
    const pre = this.route.snapshot && (this.route.snapshot.data as any)['pre'];
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }

    // Cargar datos maestros (usuarios y jerarquías) antes de aceptar edición
    (async () => {
      try {
        await Promise.all([this.cargarUsuariosAsync(), this.cargarJerarquiasAsync()]);
      } catch {}
    })();

    // Soporta edición vía snapshot
    try {
      const id_usuario = this.route.snapshot.queryParams['id_usuario'] || null;
      const id_jerarquia = this.route.snapshot.queryParams['id_jerarquia'] || null;
      if (id_usuario && id_jerarquia) {
        this.loadUsuariosJerarquias(String(id_usuario), String(id_jerarquia));
      } else if (id_usuario || id_jerarquia) {
        this.nuevo.id_usuario = id_usuario ?? this.nuevo.id_usuario;
        this.nuevo.id_jerarquia = id_jerarquia ?? this.nuevo.id_jerarquia;
        this.editingKey = `${id_usuario || ''}|${id_jerarquia || ''}`;
      }
    } catch {}

    // Suscripción a cambios en queryParams (navegación reuse)
    this.route.queryParams.subscribe((qp) => {
      try {
        const id_usuario = qp['id_usuario'] || null;
        const id_jerarquia = qp['id_jerarquia'] || null;
        if (id_usuario && id_jerarquia) {
          const key = `${id_usuario}|${id_jerarquia}`;
          if (key !== this.editingKey)
            this.loadUsuariosJerarquias(String(id_usuario), String(id_jerarquia));
        } else if (id_usuario || id_jerarquia) {
          this.nuevo.id_usuario = id_usuario ?? this.nuevo.id_usuario;
          this.nuevo.id_jerarquia = id_jerarquia ?? this.nuevo.id_jerarquia;
          this.editingKey = `${id_usuario || ''}|${id_jerarquia || ''}`;
        } else {
          this.editingKey = null;
          this.nuevo = { id_usuario: null, id_jerarquia: null, descripcion: '', activo: 1 };
        }
      } catch {}
    });
  }

  private loadUsuariosJerarquias(uid: string, jid: string) {
    if (!uid || !jid) return;
    this.loading = true;
    this.api.get<any>(`usuarios_jerarquias/${uid}/${jid}`).subscribe({
      next: (res) => {
        const rec = res?.usuarios_jerarquias || res?.data || res || null;
        if (rec) {
          this.nuevo = {
            id_usuario: rec.id_usuario ?? uid,
            id_jerarquia: rec.id_jerarquia ?? jid,
            descripcion: rec.descripcion ?? '',
            activo: rec.activo ?? 1,
          };
          this.editingKey = `${uid}|${jid}`;
          try {
            this.cdr.detectChanges();
          } catch {}
        }
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
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

  private async cargarJerarquiasAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('jerarquias'));
      const list = Array.isArray(res) ? res : res?.jerarquias || res?.data || [];
      const opts = (list || []).map((j: any) => ({
        value: j.id_jerarquia ?? j.id,
        label: j.nombre || '',
      }));
      try {
        const f = this.fields.find((x) => x.key === 'id_jerarquia');
        if (f) (f as any).options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  crear() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const body = {
      id_usuario: this.nuevo.id_usuario,
      id_jerarquia: this.nuevo.id_jerarquia,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
    };

    const editingKey = (this as any).editingKey;
    if (editingKey) {
      const [uid, jid] = editingKey.split('|');
      this.api.put(`usuarios_jerarquias/${uid}/${jid}`, body).subscribe({
        next: () => {
          this.successMsg = 'Asignación actualizada correctamente';
          setTimeout(() => this.router.navigate(['/usuarios-jerarquias']), 600);
        },
        error: (err: any) => {
          this.errorMsg = (err && (err as any).msg) || 'No se pudo actualizar la asignación';
        },
        complete: () => (this.loading = false),
      });
      return;
    }

    this.api.post('usuarios_jerarquias', body).subscribe({
      next: () => {
        this.successMsg = 'Asignación creada correctamente';
        this.nuevo = { id_usuario: null, id_jerarquia: null, descripcion: '', activo: 1 };
        setTimeout(() => this.router.navigate(['/usuarios-jerarquias']), 600);
      },
      error: (err: any) => {
        this.errorMsg = (err && (err as any).msg) || 'No se pudo crear la asignación';
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/usuarios-jerarquias']);
  }
}
