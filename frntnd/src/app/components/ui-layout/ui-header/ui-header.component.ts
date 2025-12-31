import { Component, EventEmitter, Output, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UiInputComponent } from '../../ui-form/ui-input/ui-input.component';
import { UiButtonComponent } from '../../ui-form/ui-button/ui-button.component';
import { NotificationService } from '../../../services/notification.service';
import { ThemeSelectorComponent } from '../../../shared/theme-selector/theme-selector.component';

@Component({
  selector: 'ui-header',
  standalone: true,
  imports: [UiInputComponent, UiButtonComponent, ThemeSelectorComponent],
  templateUrl: './ui-header.component.html',
  styleUrl: './ui-header.component.css',
})
export class UiHeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  isLoggedIn = false;
  userName: string | null = null;
  userEmail: string | null = null;
  userInitials: string = 'US';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('x-token') || localStorage.getItem('token');
      this.isLoggedIn = !!token;
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            const name = payload?.nombre || payload?.name || null;
            const email = payload?.email || payload?.correo || null;
            this.userName = name;
            this.userEmail = email;
            const initials = (name || email || 'Usuario')
              .split(/\s+/)
              .map((s: string) => s[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();
            this.userInitials = initials || 'US';
          } catch {}
        }
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('x-token');
      localStorage.removeItem('token');
      localStorage.removeItem('menu');
      localStorage.removeItem('roles');
      localStorage.removeItem('permisos');
    }
    this.isLoggedIn = false;
    this.userName = null;
    this.userEmail = null;
    this.userInitials = 'US';
    this.notify.info('Sesión finalizada', 2500);
    this.router.navigate(['/']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
