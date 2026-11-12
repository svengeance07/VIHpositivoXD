/**
 * Barril principal de modelos de datos del proyecto.
 * Permite importar de forma centralizada o por dominio específico:
 * - `nucleo/modelos/comunes`
 * - `nucleo/modelos/personal-salud`
 * - `nucleo/modelos/master`
 * - `nucleo/modelos/subregion-salud`
 */

export * from './comunes/index';
export * from './master/index';
export * from './personal-salud/index';
export * from './subregion-salud/index';

