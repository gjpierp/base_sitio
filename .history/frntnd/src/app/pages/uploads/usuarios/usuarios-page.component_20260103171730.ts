import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../../components/ui-form/ui-button/ui-button.component';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'page-usuarios',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css'],
})
export class UsuariosPageComponent {
  title = 'Usuarios';
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private successNotified = false;

  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
  ];

  data: Array<{ id: any; nombre: string; correo_electronico?: string }> = [];
  loading = false;
  datosListos = false;
  error?: string;

  onNuevo() {
    // Acción de nuevo usuario (pendiente de implementación)
  }

  constructor() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.api.get<any>('usuarios').subscribe({
      next: (res) => {
        const toArray = (v: any): any[] => {
          if (Array.isArray(v)) return v;
          if (v && typeof v === 'object') {
            if (Array.isArray(v.data)) return v.data;
            if (Array.isArray(v.items)) return v.items;
            if (Array.isArray(v.rows)) return v.rows;
            try {
              const values = Object.values(v);
              if (
                Array.isArray(values) &&
                values.every(
                  (x) => typeof x === 'object' || typeof x === 'string' || typeof x === 'number'
                )
              ) {
                return values as any[];
              }
            } catch {}
          }
          return [];
        };

        let rows: any[] = [];
        const candidates = [
          res?.usuarios,
          res?.data,
          res?.items,
          res?.rows,
          res?.usuarios?.rows,
          res,
        ];
        for (const c of candidates) {
          const arr = toArray(c);
          if (arr.length) {
            rows = arr;
            break;
          }
        }
        try {
          this.data = rows.map((r: any) => ({
            id: r.id_usuario ?? r.id ?? r.ID ?? '',
            nombre: r.nombre ?? r.correo_electronico ?? r.name ?? '',
            correo_electronico: r.correo_electronico ?? undefined,
          }));
        } catch {
          this.data = [];
        }
        this.loading = false;
        // Notificación de éxito solo la primera vez, discreta
        if (this.data.length && !this.successNotified) {
          this.notify.info('Usuarios cargados', 1500);
          this.successNotified = true;
        }
      },
      error: () => {
        this.error = 'No se pudo cargar usuarios';
        this.notify.error(this.error);
        this.loading = false;
      },
    });
  }

  onEdit(item: any) {
    this.notify.info('Función de edición no implementada en uploads');
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar usuario?')) {
      alert('Eliminado: ' + JSON.stringify(item));
    }
  }
}
