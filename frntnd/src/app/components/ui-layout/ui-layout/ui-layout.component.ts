import { Component, OnInit, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UiHeaderComponent } from '../ui-header/ui-header.component';
import { UiSidebarComponent } from '../../ui-navigation/ui-sidebar/ui-sidebar.component';
import { UiFooterComponent } from '../ui-footer/ui-footer.component';
import { UiBreadcrumbsComponent } from '../../ui-navigation/ui-breadcrumbs/ui-breadcrumbs.component';
import { UiNotificationsComponent } from '../../ui-feedback/ui-notifications/ui-notifications.component';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'ui-layout',
  standalone: true,
  imports: [
    UiHeaderComponent,
    UiSidebarComponent,
    UiFooterComponent,
    RouterOutlet,
    UiBreadcrumbsComponent,
    UiNotificationsComponent,
  ],
  templateUrl: './ui-layout.component.html',
  styleUrl: './ui-layout.component.css',
})
export class UiLayoutComponent implements OnInit {
  collapsed = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private theme: ThemeService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('sidebarCollapsed');
      this.collapsed = stored === 'true';
    } else {
      this.collapsed = false;
    }
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar tema en cliente
      this.theme.initTheme?.();
    }
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('sidebarCollapsed', String(this.collapsed));
    }
  }
}
