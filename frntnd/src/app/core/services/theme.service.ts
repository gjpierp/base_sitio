import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
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

    // Intentar cargar variables CSS desde API `/api/themes/:clave`
    try {
      const res: any = await firstValueFrom(
        this.api.get<any>(`themes/${encodeURIComponent(theme)}`)
      );
      const themeData = res?.data || res;
      const vars = themeData?.css_vars || {};
      Object.keys(vars).forEach((k) => {
        try {
          if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.style.setProperty(k, vars[k]);
          }
        } catch (e) {
          // ignore
        }
      });
    } catch (err) {
      // si falla, ignorar y continuar cargando CSS estático
    }

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
    return this.api.get<any>('themes');
  }

  setUserTheme(clave: string) {
    return this.api.put<any>(`configuraciones/user_theme?user=1`, { valor: clave });
  }
}
