import type { CuentaAcceso } from '../modelos/cuenta-acceso';

/**
 * Cuentas de prueba para la etapa de vistas.
 *
 * Cada centro de salud (rol 2) y cada subregión de salud (rol 3) cuenta únicamente
 * con el usuario de su jefe encargado, sin sub-perfiles internos.
 */
export const CUENTAS_ACCESO: readonly CuentaAcceso[] = [
  {
    id: 'master-1',
    rol: 1,
    nombre: 'Ana Rodríguez',
    entidad: null,
    centroId: null,
    nombreUsuario: 'master',
    correo: 'master@vih.gob.ve',
    clave: 'master123',
  },
  {
    id: 'p-maria-perez',
    rol: 2,
    nombre: 'Dra. María Pérez',
    entidad: 'Centro de Salud La Pastora',
    centroId: 'centro-la-pastora',
    correo: 'jefe.centro@vih.gob.ve',
    clave: 'jefe123',
  },
  {
    id: 'p-carlos',
    rol: 3,
    nombre: 'Lic. Carlos Rojas',
    entidad: 'Subregión de Salud Guárico',
    centroId: 'srs-guarico',
    correo: 'jefe.subregion@vih.gob.ve',
    clave: 'jefe123',
  },
];
