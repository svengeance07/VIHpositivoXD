import type { Routes } from '@angular/router';

export const MASTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/master-shell').then((m) => m.MasterShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Panel del master · Sistema V',
        loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.MasterInicio),
      },
      {
        path: 'busqueda',
        title: 'Buscar ciudadanos · Sistema V',
        loadComponent: () => import('./paginas/busqueda/busqueda').then((m) => m.MasterBusqueda),
      },
      {
        path: 'vacunas',
        title: 'Control de vacunas · Sistema V',
        loadComponent: () => import('./paginas/vacunas/vacunas').then((m) => m.MasterVacunas),
      },
      {
        path: 'vacunas/buscar',
        title: 'Buscar lotes · Sistema V',
        loadComponent: () =>
          import('./paginas/vacunas-buscar/vacunas-buscar').then((m) => m.MasterVacunasBuscar),
      },
      {
        path: 'personal',
        loadComponent: () => import('./paginas/personal/personal').then((m) => m.MasterPersonal),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'subregiones' },
          {
            path: 'subregiones',
            title: 'Subregiones · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/subregiones/subregiones').then((m) => m.MasterSubregiones),
          },
          {
            path: 'subregiones/:id',
            data: { tipo: 'subregion' },
            title: 'Detalle de subregión · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/detalle/detalle').then((m) => m.MasterDetalle),
          },
          {
            path: 'centros',
            title: 'Buscar centros · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/centros/centros').then((m) => m.MasterCentros),
          },
          {
            path: 'centros/:id',
            data: { tipo: 'centro' },
            title: 'Detalle de centro · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/detalle/detalle').then((m) => m.MasterDetalle),
          },
          {
            path: 'empleados',
            title: 'Buscar empleados · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/empleados/empleados').then((m) => m.MasterEmpleados),
          },
          {
            path: 'empleados/:id',
            data: { tipo: 'empleado' },
            title: 'Ficha de personal · Sistema V',
            loadComponent: () =>
              import('./paginas/personal/detalle/detalle').then((m) => m.MasterDetalle),
          },
        ],
      },
      {
        path: 'movimientos',
        title: 'Movimientos · Sistema V',
        loadComponent: () =>
          import('./paginas/movimientos/movimientos').then((m) => m.MasterMovimientos),
      },
      {
        path: 'busquedas',
        title: 'Búsquedas registradas · Sistema V',
        loadComponent: () => import('./paginas/busquedas/busquedas').then((m) => m.MasterBusquedas),
      },
    ],
  },
];
