import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  type: NotificationType;
  text: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private channel = new Subject<Notification>();
  stream$ = this.channel.asObservable();

  private push(type: NotificationType, text: string, timeout = 4000) {
    const notif: Notification = { id: ++this.counter, type, text, timeout };
    this.channel.next(notif);
  }

  info(text: string, timeout?: number) {
    this.push('info', text, timeout);
  }
  success(text: string, timeout?: number) {
    this.push('success', text, timeout);
  }
  warning(text: string, timeout?: number) {
    this.push('warning', text, timeout);
  }
  error(text: string, timeout?: number) {
    this.push('error', text, timeout);
  }
}
