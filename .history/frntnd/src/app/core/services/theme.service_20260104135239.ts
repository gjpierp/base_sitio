import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { ApiService } from '../../services/api.service';

const THEME_KEY = 'theme';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private api = inject(ApiService);
  private themeSubject = new BehaviorSubject<string>(this.getStoredTheme());
  theme$ = this.themeSubject.asObservable();

  private getStoredTheme(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(THEME_KEY) || 'modern';
    }
    return 'modern';
  }

  getTheme(): string {
    return this.themeSubject.value;
  }

  setTheme(theme: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(THEME_KEY, theme);
    }
    this.themeSubject.next(theme);
    // applyTheme is async but we don't need to await here
    void this.applyTheme(theme);
  }

  async applyTheme(theme: string): Promise<void> {
    // Aplicar atributo de tema tanto en <body> como en <html>
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-theme', theme);
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }

    // Priorizar cargar variables desde archivos locales; no llamar al backend.
    // Si en el futuro queremos soportar variables remotas, reintroducir la llamada API
    // como opción configurada.

    // Cargar el CSS correspondiente al tema desde assets
    try {
      const head = typeof document !== 'undefined' ? document.head : null;
      if (head) {
        const cssFile = `/assets/design-system/themes/${theme}.css?v=${Date.now()}`;
        let link = document.getElementById('theme-link') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'stylesheet';
          link.id = 'theme-link';
          head.appendChild(link);
        }
        link.href = cssFile;
      }
    } catch (e) {
      // ignore
    }
  }

  initTheme() {
    void this.applyTheme(this.getTheme());
  }

  // API helpers
  listThemes() {
    // Retornar lista estática basada en los CSS disponibles en `/assets/design-system/themes/`.
    const themes = [
      { clave: 'light', nombre: 'Claro', preview: '/assets/img/themes/light.png' },
      { clave: 'modern', nombre: 'Moderno', preview: '/assets/img/themes/modern.png' },
      { clave: 'dark', nombre: 'Oscuro', preview: '/assets/img/themes/dark.png' },
      { clave: 'futuristic', nombre: 'Futurista', preview: '/assets/img/themes/futuristic.png' },
      { clave: 'minimalist', nombre: 'Minimalista', preview: '/assets/img/themes/minimalist.png' },
      { clave: 'classic', nombre: 'Clásico', preview: '/assets/img/themes/classic.png' },
      { clave: 'material', nombre: 'Material', preview: '/assets/img/themes/material.png' },
      { clave: 'flat', nombre: 'Flat', preview: '/assets/img/themes/flat.png' },
      { clave: 'retro', nombre: 'Retro', preview: '/assets/img/themes/retro.png' },
      {
        clave: 'neumorphism',
        nombre: 'Neumorphism',
        preview: '/assets/img/themes/neumorphism.png',
      },
      { clave: 'glassmorphism', nombre: 'Glass', preview: '/assets/img/themes/glassmorphism.png' },
      { clave: 'elegant', nombre: 'Elegante', preview: '/assets/img/themes/elegant.png' },
      { clave: 'fach-light', nombre: 'Fach Light', preview: '/assets/img/themes/fach-light.png' },
      { clave: 'fach-dark', nombre: 'Fach Dark', preview: '/assets/img/themes/fach-dark.png' },
    ];
    return of({ data: themes });
  }

  setUserTheme(clave: string) {
    return this.api.put<any>(`configuraciones/user_theme?user=1`, { valor: clave });
  }
}
