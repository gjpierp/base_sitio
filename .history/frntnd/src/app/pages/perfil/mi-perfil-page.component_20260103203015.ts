import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiInputComponent } from '../../components/ui-form/ui-input/ui-input.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'page-mi-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiButtonComponent,
    UiInputComponent,
    UiModalComponent,
  ],
  templateUrl: './mi-perfil-page.component.html',
  styleUrls: ['./mi-perfil-page.component.css'],
})
export class MiPerfilPageComponent {
  title = 'Mi Perfil';
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private theme = inject(ThemeService);

  loading = false;
  datosListos = false;
  error = '';

  nombres = '';
  apellidos = '';
  correo_electronico = '';

  // Tema
  themes: Array<any> = [];
  selectedTheme = '';
  avatarUrl = '/assets/img/no-img.png';
  idUsuario: number | null = null;
  uploading = false;
  uploadPreview: string | null = null;
  selectedFile: File | null = null;
  // Modal de confirmación
  confirmModalOpen = false;

  constructor() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.api.get<any>('auth/profile').subscribe({
      next: (res) => {
        const u = res?.user ?? res ?? {};
        this.nombres = u.nombres ?? u.nombre ?? '';
        this.apellidos = u.apellidos ?? '';
        this.correo_electronico = u.correo_electronico ?? u.email ?? '';
        // Determinar URL de avatar: puede ser URL absoluta o nombre de archivo en uploads
        const img = u.img ?? u.picture ?? null;
        this.idUsuario = u.id_usuario ?? u.id ?? null;
        if (!img) {
          this.avatarUrl = '/assets/img/no-img.png';
        } else if (/^https?:\/\//i.test(img) || img.startsWith('/')) {
          this.avatarUrl = img;
        } else {
          // usar endpoint de uploads del backend (proxy /api)
          this.avatarUrl = `/api/uploads/usuarios/${img}`;
        }
        this.loading = false;
        this.datosListos = true;
      },
      error: () => {
        this.error = 'No se pudo cargar perfil';
        this.loading = false;
        this.notify.error(this.error);
      },
    });
  }

  guardar() {
    const payload = {
      nombres: this.nombres,
      apellidos: this.apellidos,
      correo_electronico: this.correo_electronico,
    };
    this.api.put('auth/profile', payload).subscribe({
      next: (res: any) => {
        this.notify.success('Perfil actualizado');
        const u = res?.user ?? res ?? {};
        this.avatarUrl = u.img || '/assets/img/default-avatar.png';
        // cargar temas disponibles
        this.theme.listThemes().subscribe({
          next: (r: any) => {
            this.themes = r?.data ?? [];
            // seleccionar el primero que coincida con user preference si aplica
            this.selectedTheme = this.themes[0]?.clave || '';
          },
          error: () => {},
        });
      },
      error: () => this.notify.error('No se pudo actualizar el perfil'),
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    // preview local, store file for confirmation
    this.selectedFile = file;
    if (this.uploadPreview) {
      try {
        URL.revokeObjectURL(this.uploadPreview);
      } catch {}
    }
    this.uploadPreview = URL.createObjectURL(file);
  }

  confirmUpload() {
    if (!this.selectedFile) {
      this.notify.error('No hay archivo seleccionado');
      return;
    }
    this.uploadImage(this.selectedFile);
  }

  openConfirmModal() {
    if (!this.selectedFile) {
      this.notify.error('No hay archivo seleccionado');
      return;
    }
    this.confirmModalOpen = true;
  }

  onModalConfirmed() {
    this.confirmModalOpen = false;
    this.confirmUpload();
  }

  onModalClosed() {
    // cerrar modal y limpiar la selección/preview
    this.confirmModalOpen = false;
    this.cancelUpload();
  }

  cancelUpload() {
    if (this.uploadPreview) {
      try {
        URL.revokeObjectURL(this.uploadPreview);
      } catch {}
    }
    this.uploadPreview = null;
    this.selectedFile = null;
  }

  uploadImage(file: File) {
    if (!this.idUsuario) {
      this.notify.error('No se pudo determinar el usuario');
      return;
    }
    const fd = new FormData();
    fd.append('imagen', file);
    this.uploading = true;
    this.api.upload<any>(`uploads/usuarios/${this.idUsuario}`, fd, 'put').subscribe({
      next: (res) => {
        if (res && (res as any).nombreArchivo) {
          const nombre = (res as any).nombreArchivo;
          this.avatarUrl = `/api/uploads/usuarios/${nombre}`;
          this.notify.success('Imagen actualizada');
        } else {
          this.notify.success('Imagen actualizada');
        }
        if (this.uploadPreview) {
          try {
            URL.revokeObjectURL(this.uploadPreview);
          } catch {}
        }
        this.uploadPreview = null;
        this.selectedFile = null;
        this.uploading = false;
      },
      error: () => {
        this.notify.error('Error subiendo la imagen');
        if (this.uploadPreview) {
          try {
            URL.revokeObjectURL(this.uploadPreview);
          } catch {}
        }
        this.uploadPreview = null;
        this.selectedFile = null;
        this.uploading = false;
      },
    });
  }

  aplicarTema() {
    if (!this.selectedTheme) return;
    this.theme.setUserTheme(this.selectedTheme).subscribe({
      next: () => {
        this.theme.applyTheme(this.selectedTheme).then(() => {
          this.notify.success('Tema aplicado');
        });
      },
      error: () => this.notify.error('No se pudo guardar la preferencia de tema'),
    });
  }
}
