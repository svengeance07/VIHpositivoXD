import type { Routes } from '@angular/router';

export const PERSONAL_SALUD_ROUTES: Routes = [
  {
    path: '',
    title: 'Personal de salud · Sistema V',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.PersonalSaludInicio),
  },
];
