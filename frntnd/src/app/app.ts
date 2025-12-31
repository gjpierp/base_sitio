import { Component, signal, OnInit, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
