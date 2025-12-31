import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiInputComponent } from '../../../components/ui-form/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, UiInputComponent, UiButtonComponent],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private sidebarState = inject(SidebarStateService);

  nombre_usuario = '';
  contrasena = '';
  contrasena_confirm = '';
  correo_electronico = '';
  nombres = '';
  apellidos = '';

  loading = false;
  error: string | null = null;
  success: string | null = null;

  async submit() {
    this.error = null;
    this.success = null;
    if (this.contrasena !== this.contrasena_confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    const body = {
      nombre_usuario: this.nombre_usuario,
      contrasena: this.contrasena,
      correo_electronico: this.correo_electronico,
      nombres: this.nombres,
      apellidos: this.apellidos,
    };
    this.loading = true;
    try {
      await firstValueFrom(this.api.post<any>('usuarios', body));
      this.success = 'Usuario creado correctamente. Redirigiendo a login...';
      setTimeout(() => {
        this.sidebarState.clearExpansionState();
        this.router.navigate(['/login']);
      }, 1000);
    } catch (e: any) {
      const msg = e?.error?.msg || e?.error?.message || 'Error al crear usuario';
      this.error = msg;
    } finally {
      this.loading = false;
    }
  }
}
