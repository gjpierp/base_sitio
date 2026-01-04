import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCardComponent } from '../../components/ui-data/ui-card/ui-card.component';
import { UiSpinnerComponent } from '../../components/ui-feedback/ui-spinner/ui-spinner.component';
import { UiButtonComponent } from '../../components/ui-form/ui-button/ui-button.component';
import { UiInputComponent } from '../../components/ui-form/ui-input/ui-input.component';
import { UiModalComponent } from '../../components/ui-feedback/ui-modal/ui-modal.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ThemeSelectorComponent } from '../../shared/theme-selector/theme-selector.component';

@Component({
  selector: 'page-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiCardComponent,
    UiSpinnerComponent,
    UiButtonComponent,
    UiInputComponent,
    UiModalComponent,
    ThemeSelectorComponent,
  ],
  templateUrl: './configuracion-page.component.html',
  styleUrls: ['./configuracion-page.component.css'],
})
export class ConfiguracionPageComponent {
  title = 'Configuración';
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  data: Array<{ clave: string; valor: string }> = [];
  loading = false;
  datosListos = false;
  error = '';

  editarClave = '';
  editarValor = '';
  editOpen = false;

  constructor() {
    const pre = (this.route.snapshot.data || {})['pre'];
    if (pre && Array.isArray(pre.configuraciones)) {
      const rows = pre.configuraciones;
      this.data = rows.map((r: any) => ({
        clave: r.clave ?? r.key ?? '',
        valor: r.valor ?? r.value ?? '',
      }));
      this.datosListos = true;
    } else {
      this.cargar();
    }
  }

  cargar() {
    this.loading = true;
    this.api.get<any>('configuraciones').subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.data = rows.map((r: any) => ({
          clave: r.clave ?? r.key ?? '',
          valor: r.valor ?? r.value ?? '',
        }));
        this.loading = false;
        this.datosListos = true;
        try {
          this.cdr.detectChanges();
        } catch {}
      },
      error: () => {
        this.error = 'No se pudieron cargar configuraciones';
        this.loading = false;
        this.notify.error(this.error);
      },
    });
  }

  abrirEditar(item: { clave: string; valor: string }) {
    this.editarClave = item.clave;
    this.editarValor = item.valor;
    this.editOpen = true;
  }

  guardarEdicion() {
    const clave = (this.editarClave || '').trim();
    if (!clave) return this.notify.error('La clave es requerida');
    this.api
      .put(`configuraciones/${encodeURIComponent(clave)}`, { valor: this.editarValor })
      .subscribe({
        next: () => {
          this.notify.success('Configuración actualizada');
          this.editOpen = false;
          this.cargar();
        },
        error: () => this.notify.error('No se pudo guardar la configuración'),
      });
  }

  cancelar() {
    this.editOpen = false;
    this.editarClave = '';
    this.editarValor = '';
  }
}
