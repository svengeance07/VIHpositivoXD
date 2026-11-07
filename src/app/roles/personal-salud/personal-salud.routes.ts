import type { Routes } from '@angular/router';

/**
 * Enrutamiento del rol Personal de Salud (Centro de Salud - /PS).
 *
 * Utiliza el layout envolvente `PersonalSaludShell` y carga perezosamente (lazy loading)
 * cada una de las vistas funcionales de forma modular y progresiva.
 */
export const PERSONAL_SALUD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/personal-salud-shell').then((m) => m.PersonalSaludShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Centro de Salud · Sistema V',
        loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.PersonalSaludInicio),
      },
      {
        path: 'estacion',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'pacientes',
        title: 'Consultar y Vacunar · Centro de Salud',
        loadComponent: () =>
          import('./paginas/pacientes/pacientes').then((m) => m.PersonalSaludPacientes),
      },
      {
        path: 'pacientes/nuevo',
        title: 'Registrar Paciente · Centro de Salud',
        loadComponent: () =>
          import('./paginas/nuevo-paciente/nuevo-paciente').then(
            (m) => m.PersonalSaludNuevoPaciente,
          ),
      },
      {
        path: 'reportes',
        title: 'Reportes de Incidencias (ESAVI) · Centro de Salud',
        loadComponent: () =>
          import('./paginas/reportes/reportes').then((m) => m.PersonalSaludReportes),
      },
      {
        path: 'historial',
        title: 'Historial de Inmunizaciones · Centro de Salud',
        loadComponent: () =>
          import('./paginas/historial/historial').then((m) => m.PersonalSaludHistorial),
      },
      {
        path: 'personal',
        title: 'Mi Credencial y Perfil · Centro de Salud',
        loadComponent: () =>
          import('./paginas/personal/personal').then((m) => m.PersonalSaludPersonal),
      },
    ],
  },
];
