import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiInputComponent } from '../../components/ui-form/ui-input/ui-input.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UiEntityTableComponent } from '../../components/ui-templates/ui-entity-table/ui-entity-table.component';

@Component({
  selector: 'page-themes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './themes-admin-page.component.html',
})
export class ThemesAdminPageComponent {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  themes: any[] = [];
  loading = false;
  datosListos = false;
  total = 0;

  // form
  clave = '';
  nombre = '';
  cssVarsText = '{}';

  editingId: number | null = null;

  constructor() {
    const pre = (this.route.snapshot.data || {})['pre'];
    if (pre && Array.isArray(pre.themes)) {
      this.themes = pre.themes;
      this.total = Number(pre.total) || this.themes.length || 0;
      this.datosListos = true;
    } else {
      this.load();
    }
  }

  async load() {
    this.loading = true;
    try {
      const res: any = await this.api.getPaginated('themes', { desde: 0, limite: 20 }).toPromise();
      this.themes = res?.data || [];
      this.total = Number(res?.total) || this.themes.length || 0;
      this.datosListos = true;
    } catch (err) {
      this.themes = [];
      this.datosListos = false;
    }
    this.loading = false;
    try {
      this.cdr.detectChanges();
    } catch {}
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
    // navegar a editor si existe ruta de crear
    try {
      const id = this.editingId;
      if (id) this.router.navigate(['/themes/crear'], { queryParams: { id } });
    } catch {}
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

  refrescar() {
    this.load();
  }

  onPageChange(evt: { page: number; pageSize: number; term?: string; sortKey?: string; sortDir?: any }) {
    const desde = (evt.page - 1) * evt.pageSize;
    const limite = evt.pageSize;
    this.loading = true;
    this.api.get<any>('themes', { desde, limite, sortKey: evt.sortKey, sortDir: evt.sortDir }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.themes = rows;
        this.total = Number(res?.total) || this.themes.length || 0;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onTableReady() {
    this.datosListos = true;
    try {
      this.cdr.detectChanges();
    } catch {}
  }
}
