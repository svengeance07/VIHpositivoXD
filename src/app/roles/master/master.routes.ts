import type { Routes } from '@angular/router';

export const MASTER_ROUTES: Routes = [
  {
    path: '',
    title: 'Master · Sistema V',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.MasterInicio),
  },
];
