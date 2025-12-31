import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { UiCardComponent } from '../../../components/ui-data/ui-card/ui-card.component';
import { UiButtonComponent } from '../../../components/ui-form/ui-button/ui-button.component';

@Component({
  selector: 'page-general',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent],
  templateUrl: './general-page.component.html',
  styleUrls: ['./general-page.component.css'],
})
export class GeneralPageComponent {
  title = 'General';
  private notify = inject(NotificationService);

  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
  ];

  data = [
    { id: 1, nombre: 'Resultado 1' },
    { id: 2, nombre: 'Resultado 2' },
  ];

  onNuevo() {
    console.log('Nueva búsqueda general');
  }

  onEdit(item: any) {
    this.notify.info('Función de edición no implementada');
  }

  onRemove(item: any) {
    if (confirm('¿Eliminar elemento?')) {
      this.notify.info('Eliminado (simulado)');
    }
  }
}
