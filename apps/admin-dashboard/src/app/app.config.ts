import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';

// TODO: Add Apollo GraphQL provider when graphql-schema lib is ready:
// import { provideApollo } from '@trimtime/graphql-schema';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    provideHttpClient(
      // TODO: withInterceptors([authInterceptor])
    ),
    // TODO: provideApollo(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
