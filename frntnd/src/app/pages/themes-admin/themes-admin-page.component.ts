import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiInputComponent } from '../../components/ui-form/ui-input/ui-input.component';

@Component({
  selector: 'page-themes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './themes-admin-page.component.html',
})
export class ThemesAdminPageComponent {
  private api = inject(ApiService);

  themes: any[] = [];
  loading = false;

  // form
  clave = '';
  nombre = '';
  cssVarsText = '{}';

  editingId: number | null = null;

  constructor() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<any>('themes').subscribe({
      next: (res) => {
        this.themes = res?.data ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  createOrUpdate() {
    let cssVars = {};
    try {
      cssVars = JSON.parse(this.cssVarsText || '{}');
    } catch (e) {
      alert('css_vars JSON inválido');
      return;
    }

    const payload: any = { clave: this.clave, nombre: this.nombre, css_vars: cssVars };
    if (this.editingId) {
      this.api.put<any>(`themes/${this.editingId}`, payload).subscribe({
        next: () => {
          this.load();
          this.resetForm();
        },
        error: (e) => alert('Error actualizando tema'),
      });
    } else {
      this.api.post<any>('themes', payload).subscribe({
        next: () => {
          this.load();
          this.resetForm();
        },
        error: () => alert('Error creando tema'),
      });
    }
  }

  edit(t: any) {
    this.editingId = t.id_tema || t.id || null;
    this.clave = t.clave || '';
    this.nombre = t.nombre || '';
    this.cssVarsText = JSON.stringify(t.css_vars || {}, null, 2);
  }

  deleteTheme(t: any) {
    const id = t.id_tema || t.id;
    if (!confirm('Eliminar tema?')) return;
    this.api.delete<any>(`themes/${id}`).subscribe({
      next: () => this.load(),
      error: () => alert('Error eliminando tema'),
    });
  }

  resetForm() {
    this.editingId = null;
    this.clave = '';
    this.nombre = '';
    this.cssVarsText = '{}';
  }
}
