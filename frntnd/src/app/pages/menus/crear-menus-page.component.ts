import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldDef } from '../../components/ui-form/ui-field/ui-field.component';
import { ApiService } from '../../services/api.service';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';

@Component({
  selector: 'page-crear-menus',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiEntityFormComponent,
    UiCardComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './crear-menus-page.component.html',
  styleUrls: ['./crear-menus-page.component.css'],
})
export class CrearMenusPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  editingId: any = null;
  formVisible = true;

  loading = false;
  errorMsg = '';
  successMsg = '';

  nuevo: any = {
    nombre: '',
    ruta: '',
    icono: '',
    descripcion: '',
    activo: 1,
    orden: 0,
    padre_id: null,
  };

  activeOptions = [
    { value: 1, label: 'Sí' },
    { value: 0, label: 'No' },
  ];

  fields: FieldDef[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'ruta', label: 'Ruta', type: 'text' },
    { key: 'icono', label: 'Ícono', type: 'text' },
    { key: 'orden', label: 'Orden', type: 'number' },
    { key: 'padre_id', label: 'Menú Padre', type: 'select', options: [] },
    { key: 'activo', label: 'Activo', type: 'select', options: this.activeOptions },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
  ];

  async ngOnInit() {
    const pre = this.route.snapshot && (this.route.snapshot.data as any)['pre'];
    if (pre && pre.nuevo) {
      this.nuevo = { ...this.nuevo, ...pre.nuevo };
    }

    // Intentar cargar inmediatamente desde snapshot (garantiza carga al entrar)
    try {
      const initialId = this.route.snapshot?.queryParams?.['id'] || null;
      if (initialId) {
        this.loadMenu(String(initialId));
      }
    } catch (e) {
      console.error('[CrearMenus] snapshot id read error', e);
    }

    // Suscribirse inmediatamente a queryParams para capturar navegaciones
    try {
      this.route.queryParams.subscribe((qp) => {
        try {
          const id = qp['id'] || null;
          console.log('[CrearMenus] queryParams', qp, 'editingId=', this.editingId);
          if (id) {
            // Intentar cargar siempre; loadMenu evitará recargas innecesarias
            this.loadMenu(String(id));
          } else {
            this.editingId = null;
            this.nuevo = {
              nombre: '',
              ruta: '',
              icono: '',
              descripcion: '',
              activo: 1,
              orden: 0,
              padre_id: null,
            };
            console.log('[CrearMenus] cleared form');
          }
        } catch (e) {
          console.error('[CrearMenus] queryParams handler error', e);
        }
      });
    } catch (e) {
      console.error('[CrearMenus] subscribe error', e);
    }

    // Escuchar eventos de navegación para garantizar que, después de navegar,
    // leamos los queryParams y carguemos la entidad cuando corresponda.
    try {
      (this.router.events as any)
        .pipe(filter((ev: any) => ev instanceof NavigationEnd))
        .subscribe(() => {
          try {
            const id = this.route.snapshot?.queryParams?.['id'] || null;
            console.log(
              '[CrearMenus] NavigationEnd detected, snapshot queryParams=',
              this.route.snapshot?.queryParams
            );
            if (id) this.loadMenu(String(id));
          } catch (e) {
            console.error('[CrearMenus] NavigationEnd handler error', e);
          }
        });
    } catch (e) {
      console.error('[CrearMenus] router.events subscribe error', e);
    }

    // Cargar datos maestros (menús padres). No bloquea la suscripción a params.
    try {
      await this.cargarPadresAsync();
    } catch {}

    // Ya hemos intentado cargar desde snapshot al inicio; continuar con carga de datos maestros
  }

  private async cargarPadresAsync() {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('menus'));
      const list = Array.isArray(res) ? res : res?.menus || res?.data || [];
      const opts = (list || []).map((m: any) => ({
        value: m.id_menu ?? m.id,
        label: m.nombre || '',
      }));
      try {
        const f = this.fields.find((x) => x.key === 'padre_id');
        if (f) f.options = opts;
        this.cdr.detectChanges();
      } catch {}
    } catch {}
  }

  private loadMenu(id: string) {
    if (!id) return;
    // Evitar recarga si ya estamos editando ese id
    if (String(this.editingId) === String(id)) {
      console.log('[CrearMenus] loadMenu - already editing id', id);
      return;
    }
    console.log('[CrearMenus] loadMenu start id=', id);
    // Marcar editingId temprano para evitar condiciones de carrera
    this.editingId = id;
    this.loading = true;
    this.api.get<any>(`menus/${id}`).subscribe({
      next: (res) => {
        const m = res?.menu || res?.data || res || null;
        console.log('[CrearMenus] loadMenu response', res);
        if (m) {
          // Force recreate the child form to ensure it renders updated model
          this.formVisible = false;
          this.cdr.detectChanges();
          this.nuevo = {
            nombre: m.nombre ?? m['nombre'] ?? '',
            ruta: m.ruta ?? m['url'] ?? m['ruta'] ?? '',
            icono: m.icono ?? '',
            descripcion: m.descripcion ?? m['descripcion'] ?? '',
            activo: m.activo ?? m['activo'] ?? 1,
            orden: m.orden ?? m['orden'] ?? 0,
            padre_id: m.padre_id ?? m['id_menu_padre'] ?? null,
          };
          try {
            // Small delay then show form again to force child component recreation
            setTimeout(() => {
              this.formVisible = true;
              try {
                this.cdr.detectChanges();
              } catch (e) {
                console.error('[CrearMenus] detectChanges after recreate error', e);
              }
            }, 20);
          } catch (e) {
            console.error('[CrearMenus] detectChanges error', e);
          }
        }
      },
      error: (err) => {
        console.error('[CrearMenus] loadMenu error', err);
      },
      complete: () => {
        this.loading = false;
        console.log('[CrearMenus] loadMenu complete id=', id);
      },
    });
  }

  crear() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const body = {
      nombre: this.nuevo.nombre,
      ruta: this.nuevo.ruta,
      icono: this.nuevo.icono,
      descripcion: this.nuevo.descripcion,
      activo: Number(this.nuevo.activo) ? 1 : 0,
      orden: Number(this.nuevo.orden) || 0,
      padre_id: this.nuevo.padre_id || null,
    };

    const editingId = (this as any).editingId;
    if (editingId) {
      this.api.put(`menus/${editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Menú actualizado correctamente';
          setTimeout(() => this.router.navigate(['/menus']), 600);
        },
        error: (err) => {
          this.errorMsg = (err && err.msg) || 'No se pudo actualizar el menú';
        },
        complete: () => (this.loading = false),
      });
      return;
    }

    this.api.post('menus', body).subscribe({
      next: () => {
        this.successMsg = 'Menú creado correctamente';
        this.nuevo = {
          nombre: '',
          ruta: '',
          icono: '',
          descripcion: '',
          activo: 1,
          orden: 0,
          padre_id: null,
        };
        setTimeout(() => this.router.navigate(['/menus']), 600);
      },
      error: (err) => {
        this.errorMsg = (err && err.msg) || 'No se pudo crear el menú';
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar() {
    this.router.navigate(['/menus']);
  }
}
