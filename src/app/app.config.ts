import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { mockApiInterceptor } from './components/async-validation/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The interceptor fakes the backend used by validateHttp() in Exercise 04
    provideHttpClient(withInterceptors([mockApiInterceptor])),
  ],
};
