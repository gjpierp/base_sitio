import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';

import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
