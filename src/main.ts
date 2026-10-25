import { bootstrapApplication } from '@angular/platform-browser';
import { provideCaustica } from 'caustica-design/angular';
import { appConfig } from './app/app.config';
import { App } from './app/app';

provideCaustica();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
