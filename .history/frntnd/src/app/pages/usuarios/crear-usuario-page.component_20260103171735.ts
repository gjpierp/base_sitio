import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSelectOption } from '../../components/ui-form/ui-selects/ui-selects.component';
import { UiEntityFormComponent } from '../../components/ui-templates/ui-entity-form/ui-entity-form.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TipoUsuario } from '../../models/tipo-usuario';
import { Estado } from '../../models/estado';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

/**
 * Componente para la creación de usuarios en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
@Component({
  selector: 'app-crear-usuario-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiEntityFormComponent,
    UiCardComponent,
    UiSpinnerComponent,
  ],
  templateUrl: './crear-usuario-page.component.html',
  styleUrls: ['./crear-usuario-page.component.css'],
})
export class CrearUsuarioPageComponent implements OnInit {
  private api = inject(ApiService)!;
  private router = inject(Router)!;
  private route = inject(ActivatedRoute)!;
  private cdr = inject(ChangeDetectorRef)!;

  tiposUsuario: TipoUsuario[] = [];
  estados: Estado[] = [];
  loading = false;
  datosListos = false;
  errorMsg = '';
  successMsg = '';
  editingId: string | null = null;

  // Modelo para el formulario de creación de usuario
  nuevo: any = {
    nombre: '',
    correo_electronico: '',
    id_tipo_usuario: '',
    id_estado: '',
    // version: '', // Descomentar si se requiere soporte de versión en el futuro
  };

  /**
   * ngOnInit - Inicializa la carga de datos requeridos para el formulario.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  async ngOnInit(): Promise<void> {
    // Cargar datos maestros primero para evitar sobreescrituras
    try {
      await Promise.all([this.cargarTiposUsuarioAsync(), this.cargarEstadosAsync()]);
    } catch (err) {
      // Ignorar: los métodos ya manejan errores internamente
    }

    // Suscribirse a cambios en queryParams para soportar navegación donde
    // el componente puede ser reutilizado por Angular y snapshot no cambie.
    const snapshotId = this.route.snapshot?.queryParams?.['id'] || null;
    if (snapshotId) {
      this.loadUsuario(String(snapshotId));
    }

    this.route.queryParams.subscribe((qp) => {
      try {
        const id = qp['id'] || null;
        if (id) {
          // Evitar recargar si ya estamos en el mismo modo edición
          if (String(id) !== String(this.editingId)) {
            this.loadUsuario(String(id));
          }
        } else {
          // Si no hay id, limpiar estado de edición y resetear el modelo
          this.editingId = null;
          this.nuevo = { nombre: '', correo_electronico: '', id_tipo_usuario: '', id_estado: '' };
        }
      } catch (err) {
        this.editingId = null;
      }
    });
  }

  private async cargarTiposUsuarioAsync(): Promise<void> {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('tipos_usuario'));
      this.tiposUsuario = Array.isArray(res) ? res : res?.tipos || res?.data || [];
      // Seleccionar por defecto el tipo llamado 'Usuario' si existe y el modelo aún no tiene valor
      try {
        const defecto = this.tiposUsuario.find(
          (t: any) => (t?.nombre || '').toLowerCase() === 'usuario'
        );
        if (defecto && !this.nuevo.id_tipo_usuario) {
          this.nuevo.id_tipo_usuario = defecto.id_tipo_usuario;
        }
      } catch {}
    } catch (err) {
      this.tiposUsuario = [];
    }
  }

  private async cargarEstadosAsync(): Promise<void> {
    try {
      const res: any = await firstValueFrom(this.api.get<any>('estados'));
      this.estados = Array.isArray(res) ? res : res?.estados || res?.data || [];
      // Forzar detección para que el formulario se pinte si ya está visible
      try {
        this.cdr.detectChanges();
      } catch {}
    } catch (err) {
      this.estados = [];
    }
  }

  private loadUsuario(id: string) {
    if (!id) return;
    this.loading = true;
    this.errorMsg = '';
    this.api.get<any>(`usuarios/${id}`).subscribe({
      next: (res) => {
        const u = res?.usuario || res?.data || res || null;
        if (u) {
          this.nuevo = {
            nombre: u.nombre_usuario ?? u.nombre ?? u.name ?? '',
            correo_electronico: u.correo ?? u.correo_electronico ?? '',
            id_tipo_usuario: u.id_tipo_usuario ?? u.id_tipo_usuario ?? '',
            id_estado: u.id_estado ?? u.id_estado ?? '',
          };
          this.editingId = String(id);
          try {
            this.cdr.detectChanges();
          } catch {}
        }
      },
      error: (err) => {
        this.errorMsg = (err as any)?.error?.msg || 'No se pudo cargar el usuario';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
   * cargarTiposUsuario - Carga los tipos de usuario desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargarTiposUsuario() {
    this.api.get<TipoUsuario[]>('tipos_usuario').subscribe({
      next: (res: any) => {
        this.tiposUsuario = Array.isArray(res) ? res : res?.tipos || res?.data || [];
        // Seleccionar por defecto el tipo llamado 'Usuario' si existe
        try {
          const defecto = this.tiposUsuario.find(
            (t: any) => (t?.nombre || '').toLowerCase() === 'usuario'
          );
          // Sólo asignar el valor por defecto si el modelo NO viene ya poblado
          if (defecto && !this.nuevo.id_tipo_usuario) {
            this.nuevo.id_tipo_usuario = defecto.id_tipo_usuario;
          }
        } catch {}
      },
      error: () => {
        this.tiposUsuario = [];
      },
    });
  }

  /**
   * cargarEstados - Carga los estados desde la API.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  cargarEstados() {
    this.api.get<Estado[]>('estados').subscribe({
      next: (res: any) => {
        this.estados = Array.isArray(res) ? res : res?.estados || res?.data || [];
      },
      error: () => {
        this.estados = [];
      },
    });
  }

  get tiposUsuarioOptions(): UiSelectOption[] {
    return (this.tiposUsuario || []).map((t) => ({
      label: (t as any).nombre || '',
      value: (t as any).id_tipo_usuario,
    }));
  }

  get estadosOptions(): UiSelectOption[] {
    return (this.estados || []).map((e) => ({ label: e.nombre || '', value: e.id_estado }));
  }

  get fields() {
    return [
      { key: 'nombre', label: 'Nombre completo', type: 'text' },
      { key: 'correo_electronico', label: 'Correo electrónico', type: 'email' },
      {
        key: 'id_tipo_usuario',
        label: 'Tipo de usuario',
        type: 'select',
        options: this.tiposUsuarioOptions,
      },
      { key: 'id_estado', label: 'Estado', type: 'select', options: this.estadosOptions },
    ];
  }

  /**
   * crearUsuario - Envía el formulario para crear un nuevo usuario.
   * Si la operación es exitosa, muestra mensaje y redirige al listado.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  crearUsuario(payload?: any) {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const model = payload && typeof payload === 'object' ? payload : this.nuevo;
    const body = {
      nombre: model.nombre,
      correo_electronico: model.correo_electronico,
      id_tipo_usuario: model.id_tipo_usuario,
      id_estado: model.id_estado,
    };

    // Si estamos en modo edición (editingId), usar PUT
    const editingId = (this as any).editingId;
    if (editingId) {
      this.api.put(`usuarios/${editingId}`, body).subscribe({
        next: () => {
          this.successMsg = 'Usuario actualizado correctamente';
          setTimeout(() => this.router.navigate(['/usuarios']), 400);
        },
        error: () => {
          this.errorMsg = 'No se pudo actualizar el usuario';
        },
        complete: () => {
          this.loading = false;
        },
      });
      return;
    }

    this.api.post('usuarios', body).subscribe({
      next: () => {
        this.successMsg = 'Usuario creado correctamente';
        this.nuevo = { nombre: '', correo_electronico: '', id_tipo_usuario: '', id_estado: '' };
      },
      error: () => {
        this.errorMsg = 'No se pudo crear el usuario';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
