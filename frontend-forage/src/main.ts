import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

function handleError(err: unknown) {
  if (err instanceof Error) {
    console.error('Error:', err.message);
  } else {
    console.error('Unknown error:', err);
  }
}

bootstrapApplication(App, appConfig).catch(handleError);

