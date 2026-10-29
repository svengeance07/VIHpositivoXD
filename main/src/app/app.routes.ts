import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Sistema V · Gestión de salud pública',
    loadComponent: () => import('./publico/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · Sistema V',
    loadComponent: () => import('./publico/login/login').then((m) => m.Login),
  },
  {
    path: 'consulta',
    title: 'Consulta ciudadana · Sistema V',
    loadComponent: () => import('./publico/consulta/consulta').then((m) => m.Consulta),
  },
  {
    path: 'master',
    loadChildren: () => import('./roles/master/master.routes').then((m) => m.MASTER_ROUTES),
  },
  {
    path: 'PS',
    loadChildren: () =>
      import('./roles/personal-salud/personal-salud.routes').then((m) => m.PERSONAL_SALUD_ROUTES),
  },
  {
    path: 'SRS',
    loadChildren: () =>
      import('./roles/subregion-salud/subregion-salud.routes').then(
        (m) => m.SUBREGION_SALUD_ROUTES,
      ),
  },
  { path: '**', redirectTo: '' },
];
