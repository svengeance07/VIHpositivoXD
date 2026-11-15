import { type SQL } from 'drizzle-orm';
import { type AuthUserContext } from '../auth/index.js';
import { type CartillaFamiliarCedula, type CartillaVacunacionCiudadano, type CreateInmunizacionBody, type InmunizacionDetalle, type InmunizacionesQuery, type UpdateInmunizacionBody } from './inmunizaciones.schemas.js';
export declare function queryInmunizaciones(conditions: SQL[], options?: {
    limit?: number;
    offset?: number;
    order?: 'asc_dosis' | 'desc_reciente';
}): Promise<InmunizacionDetalle[]>;
export declare function listInmunizaciones(user: AuthUserContext, filters: InmunizacionesQuery): Promise<InmunizacionDetalle[]>;
export declare function getInmunizacionById(user: AuthUserContext, idInmunizacion: number): Promise<InmunizacionDetalle>;
export declare function getCartillaByCiudadanoMayorId(idCiudadano: number): Promise<CartillaVacunacionCiudadano>;
export declare function getCartillaByCiudadanoMenorId(idMenor: number): Promise<CartillaVacunacionCiudadano>;
export declare function getCartillaFamiliarByCedula(ci: number): Promise<CartillaFamiliarCedula>;
export declare function createInmunizacion(user: AuthUserContext, input: CreateInmunizacionBody): Promise<InmunizacionDetalle>;
export declare function updateInmunizacion(user: AuthUserContext, idInmunizacion: number, input: UpdateInmunizacionBody): Promise<InmunizacionDetalle>;
