import type { CuentaAcceso } from '../modelos/cuenta-acceso';

/**
 * Cuentas de prueba para la etapa de vistas.
 *
 * Cuando exista backend, este archivo se elimina y `SesionService` pasa a validar
 * contra la API. Las contraseñas en claro solo tienen sentido mientras sean datos falsos.
 */
export const CUENTAS_ACCESO: readonly CuentaAcceso[] = [
  {
    id: 'master-1',
    rol: 1,
    nombre: 'Ana Rodríguez',
    nombreUsuario: 'master',
    correo: 'master@vih.gob.ve',
    clave: 'master123',
    perfiles: [],
  },
  {
    id: 'centro-la-pastora',
    rol: 2,
    nombre: 'Centro de Salud La Pastora',
    correo: 'centro@vih.gob.ve',
    clave: 'centro123',
    perfiles: [
      {
        id: 'centro-jefe',
        nombre: 'Dra. María Pérez',
        tipo: 'jefe',
        correo: 'jefe.centro@vih.gob.ve',
        clave: 'jefe123',
      },
      {
        id: 'centro-enfermero',
        nombre: 'Enf. Luis Gómez',
        tipo: 'trabajador',
        correo: 'enfermero.centro@vih.gob.ve',
        clave: 'enfermero123',
      },
    ],
  },
  {
    id: 'subregion-guari-co',
    rol: 3,
    nombre: 'Subregión de Salud Guárico',
    correo: 'subregion@vih.gob.ve',
    clave: 'subregion123',
    perfiles: [
      {
        id: 'subregion-jefe',
        nombre: 'Lic. Carlos Rojas',
        tipo: 'jefe',
        correo: 'jefe.subregion@vih.gob.ve',
        clave: 'jefe123',
      },
      {
        id: 'subregion-analista',
        nombre: 'Analista Sofía Díaz',
        tipo: 'trabajador',
        correo: 'analista.subregion@vih.gob.ve',
        clave: 'analista123',
      },
    ],
  },
];
