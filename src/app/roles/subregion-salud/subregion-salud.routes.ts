import type { Routes } from '@angular/router';

export const SUBREGION_SALUD_ROUTES: Routes = [
  {
    path: '',
    title: 'Subregión de salud · Sistema V',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.SubregionSaludInicio),
  },
];
