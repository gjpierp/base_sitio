import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Notification, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'ui-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-notifications.component.html',
  styleUrl: './ui-notifications.component.css',
})
export class UiNotificationsComponent implements OnDestroy {
  items: Notification[] = [];
  private sub: Subscription;

  constructor(private notifications: NotificationService) {
    this.sub = this.notifications.stream$.subscribe((n) => {
      this.items.push(n);
      if (n.timeout && n.timeout > 0) {
        setTimeout(() => this.dismiss(n.id), n.timeout);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  dismiss(id: number) {
    this.items = this.items.filter((i) => i.id !== id);
  }
}
