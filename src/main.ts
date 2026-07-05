import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { loadAppSettings } from './app/core/app-config-loader';

loadAppSettings()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
