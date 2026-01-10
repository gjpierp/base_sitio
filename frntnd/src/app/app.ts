import { Component, signal, OnInit, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';
import { UiNotificationsComponent } from './components/ui-feedback/ui-notifications/ui-notifications.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiNotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('admin-sitio-pro');
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
