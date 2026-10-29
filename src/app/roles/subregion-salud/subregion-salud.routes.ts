import type { Routes } from '@angular/router';

/**
 * Enrutamiento del rol Subregión de Salud (/SRS).
 *
 * Usa un shell propio y carga perezosamente las vistas de consulta de personal,
 * ciudadanos, certificados y notificaciones.
 */
export const SUBREGION_SALUD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/subregion-salud-shell').then((m) => m.SubregionSaludShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Panel de la subregión · Sistema V',
        loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.SubregionSaludInicio),
      },
      {
        path: 'trabajadores',
        title: 'Personal de salud · Sistema V',
        loadComponent: () =>
          import('./paginas/trabajadores/trabajadores').then((m) => m.SubregionSaludTrabajadores),
      },
      {
        path: 'trabajadores/:id',
        title: 'Ficha del trabajador · Sistema V',
        loadComponent: () =>
          import('./paginas/trabajador-detalle/trabajador-detalle').then(
            (m) => m.SubregionSaludTrabajadorDetalle,
          ),
      },
      {
        path: 'ciudadanos',
        title: 'Ciudadanos del estado · Sistema V',
        loadComponent: () =>
          import('./paginas/ciudadanos/ciudadanos').then((m) => m.SubregionSaludCiudadanos),
      },
      {
        path: 'ciudadanos/:id',
        title: 'Ficha ciudadana · Sistema V',
        loadComponent: () =>
          import('./paginas/ciudadano-detalle/ciudadano-detalle').then(
            (m) => m.SubregionSaludCiudadanoDetalle,
          ),
      },
      {
        path: 'certificados',
        title: 'Certificados de salud · Sistema V',
        loadComponent: () =>
          import('./paginas/certificados/certificados').then((m) => m.SubregionSaludCertificados),
      },
      {
        path: 'certificados/:id',
        title: 'Revisión de certificado · Sistema V',
        loadComponent: () =>
          import('./paginas/certificado-detalle/certificado-detalle').then(
            (m) => m.SubregionSaludCertificadoDetalle,
          ),
      },
      {
        path: 'notificaciones',
        title: 'Notificaciones de la subregión · Sistema V',
        loadComponent: () =>
          import('./paginas/notificaciones/notificaciones').then(
            (m) => m.SubregionSaludNotificaciones,
          ),
      },
    ],
  },
];
