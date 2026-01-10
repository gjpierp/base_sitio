import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private notify: NotificationService, private ngZone: NgZone) {}

  handleError(error: any): void {
    this.ngZone.run(() => {
      this.notify?.error('Ha ocurrido un error inesperado.');
      // Puedes loguear el error en el backend aquí si lo deseas
      console.error('GlobalErrorHandler:', error);
    });
  }
}
