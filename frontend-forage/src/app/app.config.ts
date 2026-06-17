import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { apiInterceptor } from './interceptors/api.interceptor';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptors';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor, authInterceptor])),
    provideHttpClient(withInterceptorsFromDi()),
    LoadingInterceptor,
  ],
};
