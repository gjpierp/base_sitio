import { Component, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../components/ui-form/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../components/ui-form/ui-button/ui-button.component';
import { UiHeaderPublicComponent } from '../../../components/ui-layout/ui-header-public/ui-header-public.component';
import { ApiService } from '../../../services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    UiButtonComponent,
    UiHeaderPublicComponent,
  ],
})
export class LoginPageComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private themeService = inject(ThemeService);

  email = '';
  password = '';
  loading = false;
  errorMsg = '';
  googleReady = false;
  facebookReady = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Aplicar tema en páginas públicas (login) antes de cargar SDKs
      try {
        this.themeService.initTheme();
      } catch (e) {
        // ignore
      }
      // Cargar SDKs de forma segura solo en navegador
      this.loadGoogleSdk();
      this.loadFacebookSdk();
    }
  }

  async onLogin() {
    this.errorMsg = '';
    this.loading = true;
    try {
      console.log('Intentando login con', this.email, this.password);
      const resp = await firstValueFrom(
        this.api.post<any>('login', {
          correo_electronico: this.email,
          contrasena: this.password,
        })
      );
      const token = resp?.token || resp?.jwt || resp?.accessToken;
      if (!token) throw new Error('Token no recibido');

      localStorage.setItem('x-token', token);
      // Persistir menú/roles/permisos si vienen en la respuesta
      try {
        if (Array.isArray(resp?.menu)) {
          localStorage.setItem('menu', JSON.stringify(resp.menu));
          console.log('[login] menu guardado en localStorage:', resp.menu);
        }
        if (Array.isArray(resp?.roles)) {
          localStorage.setItem('roles', JSON.stringify(resp.roles));
        }
        if (Array.isArray(resp?.permisos)) {
          localStorage.setItem('permisos', JSON.stringify(resp.permisos));
        }
      } catch {}
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/dashboard';
      try {
        // Navegar primero; dispatch después para que componentes nuevos (ej. Dashboard)
        // ya estén inicializados y reciban el evento.
        await this.router.navigateByUrl(redirectTo);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          const detail = { menu: Array.isArray(resp?.menu) ? resp.menu : null };
          window.dispatchEvent(new CustomEvent('app:login', { detail }));
        }
      } catch {}
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error de autenticación';
    } finally {
      this.loading = false;
    }
  }

  // --- Google ---
  private loadGoogleSdk() {
    if ((window as any).google) {
      this.googleReady = true;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.googleReady = true;
    };
    script.onerror = () => {
      console.error('No se pudo cargar Google Identity');
      this.googleReady = false;
    };
    document.head.appendChild(script);
  }

  async onGoogle() {
    this.errorMsg = '';
    if (!isPlatformBrowser(this.platformId)) return;
    const google = (window as any).google;
    if (!google) {
      this.errorMsg = 'Google no está listo';
      return;
    }
    const clientId = environment.GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      this.errorMsg = 'Configura GOOGLE CLIENT ID';
      return;
    }
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const idToken = response?.credential;
          if (idToken) {
            this.submitGoogleToken(idToken);
          } else {
            this.errorMsg = 'No se recibió token de Google';
          }
        },
        cancel_on_tap_outside: false,
        auto_select: false,
      });
      google.accounts.id.prompt();
    } catch (e: any) {
      this.errorMsg = e?.message || 'Error inicializando Google';
    }
  }

  private async submitGoogleToken(token: string) {
    this.loading = true;
    try {
      const resp = await firstValueFrom(this.api.post<any>('login/google', { token }));
      const jwt = resp?.token;
      if (!jwt) throw new Error('Token no recibido');
      localStorage.setItem('x-token', jwt);
      try {
        console.log(
          '[login-google] x-token guardado; menu en localStorage:',
          localStorage.getItem('menu')
        );
      } catch {}
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/dashboard';
      try {
        await this.router.navigateByUrl(redirectTo);
      } catch {}
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          const detail = { menu: Array.isArray(resp?.menu) ? resp.menu : null };
          window.dispatchEvent(new CustomEvent('app:login', { detail }));
        }
      } catch {}
    } catch (err: any) {
      this.errorMsg = err?.error?.msg || err?.message || 'Error con Google';
    } finally {
      this.loading = false;
    }
  }

  // --- Facebook ---
  private loadFacebookSdk() {
    if ((window as any).FB) {
      this.facebookReady = true;
      return;
    }
    const appId = environment.FACEBOOK_APP_ID;
    if (!appId || appId.includes('YOUR_FACEBOOK_APP_ID')) {
      // No marcamos error aquí; solo deshabilitamos el botón
      this.facebookReady = false;
      return;
    }
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      this.facebookReady = true;
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('No se pudo cargar Facebook SDK');
      this.facebookReady = false;
    };
    document.head.appendChild(script);
  }

  async onFacebook() {
    this.errorMsg = '';
    if (!isPlatformBrowser(this.platformId)) return;
    const FB = (window as any).FB;
    if (!FB) {
      this.errorMsg = 'Facebook no está listo';
      return;
    }
    try {
      FB.login(
        async (response: any) => {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            this.errorMsg = 'No se recibió token de Facebook';
            return;
          }
          await this.submitFacebookToken(accessToken);
        },
        { scope: 'email,public_profile' }
      );
    } catch (e: any) {
      this.errorMsg = e?.message || 'Error inicializando Facebook';
    }
  }

  private async submitFacebookToken(accessToken: string) {
    this.loading = true;
    try {
      const resp = await firstValueFrom(this.api.post<any>('login/facebook', { accessToken }));
      const jwt = resp?.token;
      if (!jwt) throw new Error('Token no recibido');
      localStorage.setItem('x-token', jwt);
      try {
        console.log(
          '[login-facebook] x-token guardado; menu en localStorage:',
          localStorage.getItem('menu')
        );
      } catch {}
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/dashboard';
      try {
        await this.router.navigateByUrl(redirectTo);
      } catch {}
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          const detail = { menu: Array.isArray(resp?.menu) ? resp.menu : null };
          window.dispatchEvent(new CustomEvent('app:login', { detail }));
        }
      } catch {}
    } catch (err: any) {
      this.errorMsg = err?.error?.msg || err?.message || 'Error con Facebook';
    } finally {
      this.loading = false;
    }
  }

  onRegister() {
    try {
      this.router.navigateByUrl('/register');
    } catch (e) {
      // Fallback a navigate si navigateByUrl falla
      this.router.navigate(['/register']);
    }
  }
}
