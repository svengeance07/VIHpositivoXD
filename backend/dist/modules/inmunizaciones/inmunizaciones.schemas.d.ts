import { z } from 'zod';
import { idParamSchema, okSchema } from '../catalogos/catalogos.schemas.js';
import { cedulaParamSchema } from '../ciudadanos/ciudadanos.schemas.js';
export { cedulaParamSchema, idParamSchema, okSchema };
export declare function getTodayIsoUtc(): string;
export declare const fechaIsoCalendarSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const fechaIsoNotFutureSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const vacunaResumenSchema: z.ZodObject<{
    id_vacuna: z.ZodNumber;
    nombre_vacuna: z.ZodString;
    cantidad_dosis: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}, {
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}>;
export declare const centroAplicacionResumenSchema: z.ZodObject<{
    id_centro: z.ZodNumber;
    nombre_centro: z.ZodString;
    codigo_centro: z.ZodString;
    estado_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id: number | null;
    id_centro: number;
    nombre_centro: string;
    codigo_centro: string;
}, {
    estado_id: number | null;
    id_centro: number;
    nombre_centro: string;
    codigo_centro: string;
}>;
export declare const pacienteMayorResumenSchema: z.ZodObject<{
    id_ciudadano: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodNullable<z.ZodString>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodNullable<z.ZodString>;
    c_i: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    c_i: number;
    id_ciudadano: number;
}, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    c_i: number;
    id_ciudadano: number;
}>;
export declare const pacienteMenorResumenSchema: z.ZodObject<{
    id_menor: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodNullable<z.ZodString>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodNullable<z.ZodString>;
    padre_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    id_menor: number;
    padre_id: number | null;
}, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    id_menor: number;
    padre_id: number | null;
}>;
export declare const inmunizacionDetalleSchema: z.ZodObject<{
    id_inmunizacion: z.ZodNumber;
    numero_dosis: z.ZodNumber;
    fecha_aplicacion: z.ZodNullable<z.ZodString>;
    numero_lote: z.ZodNullable<z.ZodString>;
    observaciones: z.ZodNullable<z.ZodString>;
    centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
    vacuna_id: z.ZodNullable<z.ZodNumber>;
    ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
    ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
    vacuna: z.ZodNullable<z.ZodObject<{
        id_vacuna: z.ZodNumber;
        nombre_vacuna: z.ZodString;
        cantidad_dosis: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    }, {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    }>>;
    centro_salud: z.ZodNullable<z.ZodObject<{
        id_centro: z.ZodNumber;
        nombre_centro: z.ZodString;
        codigo_centro: z.ZodString;
        estado_id: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        estado_id: number | null;
        id_centro: number;
        nombre_centro: string;
        codigo_centro: string;
    }, {
        estado_id: number | null;
        id_centro: number;
        nombre_centro: string;
        codigo_centro: string;
    }>>;
    ciudadano_mayor: z.ZodNullable<z.ZodObject<{
        id_ciudadano: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodNullable<z.ZodString>;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodNullable<z.ZodString>;
        c_i: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
    }, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
    }>>;
    ciudadano_menor: z.ZodNullable<z.ZodObject<{
        id_menor: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodNullable<z.ZodString>;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodNullable<z.ZodString>;
        padre_id: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        id_menor: number;
        padre_id: number | null;
    }, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        id_menor: number;
        padre_id: number | null;
    }>>;
}, "strip", z.ZodTypeAny, {
    centro_salud: {
        estado_id: number | null;
        id_centro: number;
        nombre_centro: string;
        codigo_centro: string;
    } | null;
    id_inmunizacion: number;
    numero_dosis: number;
    fecha_aplicacion: string | null;
    numero_lote: string | null;
    observaciones: string | null;
    centro_salud_aplicacion: number | null;
    vacuna_id: number | null;
    ciudadano_mayor_edad_id: number | null;
    ciudadano_mayor_menor_id: number | null;
    vacuna: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    } | null;
    ciudadano_mayor: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
    } | null;
    ciudadano_menor: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        id_menor: number;
        padre_id: number | null;
    } | null;
}, {
    centro_salud: {
        estado_id: number | null;
        id_centro: number;
        nombre_centro: string;
        codigo_centro: string;
    } | null;
    id_inmunizacion: number;
    numero_dosis: number;
    fecha_aplicacion: string | null;
    numero_lote: string | null;
    observaciones: string | null;
    centro_salud_aplicacion: number | null;
    vacuna_id: number | null;
    ciudadano_mayor_edad_id: number | null;
    ciudadano_mayor_menor_id: number | null;
    vacuna: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    } | null;
    ciudadano_mayor: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
    } | null;
    ciudadano_menor: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        id_menor: number;
        padre_id: number | null;
    } | null;
}>;
export declare const esquemaVacunaProgresoSchema: z.ZodObject<{
    id_vacuna: z.ZodNumber;
    nombre_vacuna: z.ZodString;
    cantidad_dosis_requeridas: z.ZodNumber;
    dosis_aplicadas: z.ZodNumber;
    esquema_completo: z.ZodBoolean;
    proxima_dosis: z.ZodNullable<z.ZodNumber>;
    historial: z.ZodArray<z.ZodObject<{
        id_inmunizacion: z.ZodNumber;
        numero_dosis: z.ZodNumber;
        fecha_aplicacion: z.ZodNullable<z.ZodString>;
        numero_lote: z.ZodNullable<z.ZodString>;
        observaciones: z.ZodNullable<z.ZodString>;
        centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
        vacuna_id: z.ZodNullable<z.ZodNumber>;
        ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
        ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
        vacuna: z.ZodNullable<z.ZodObject<{
            id_vacuna: z.ZodNumber;
            nombre_vacuna: z.ZodString;
            cantidad_dosis: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        }, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        }>>;
        centro_salud: z.ZodNullable<z.ZodObject<{
            id_centro: z.ZodNumber;
            nombre_centro: z.ZodString;
            codigo_centro: z.ZodString;
            estado_id: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        }, {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        }>>;
        ciudadano_mayor: z.ZodNullable<z.ZodObject<{
            id_ciudadano: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            c_i: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        }, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        }>>;
        ciudadano_menor: z.ZodNullable<z.ZodObject<{
            id_menor: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            padre_id: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        }, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        }>>;
    }, "strip", z.ZodTypeAny, {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }, {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis_requeridas: number;
    dosis_aplicadas: number;
    esquema_completo: boolean;
    proxima_dosis: number | null;
    historial: {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }[];
}, {
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis_requeridas: number;
    dosis_aplicadas: number;
    esquema_completo: boolean;
    proxima_dosis: number | null;
    historial: {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }[];
}>;
export declare const cartillaVacunacionCiudadanoSchema: z.ZodObject<{
    resumen_esquemas: z.ZodArray<z.ZodObject<{
        id_vacuna: z.ZodNumber;
        nombre_vacuna: z.ZodString;
        cantidad_dosis_requeridas: z.ZodNumber;
        dosis_aplicadas: z.ZodNumber;
        esquema_completo: z.ZodBoolean;
        proxima_dosis: z.ZodNullable<z.ZodNumber>;
        historial: z.ZodArray<z.ZodObject<{
            id_inmunizacion: z.ZodNumber;
            numero_dosis: z.ZodNumber;
            fecha_aplicacion: z.ZodNullable<z.ZodString>;
            numero_lote: z.ZodNullable<z.ZodString>;
            observaciones: z.ZodNullable<z.ZodString>;
            centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
            vacuna_id: z.ZodNullable<z.ZodNumber>;
            ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
            ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
            vacuna: z.ZodNullable<z.ZodObject<{
                id_vacuna: z.ZodNumber;
                nombre_vacuna: z.ZodString;
                cantidad_dosis: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            }, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            }>>;
            centro_salud: z.ZodNullable<z.ZodObject<{
                id_centro: z.ZodNumber;
                nombre_centro: z.ZodString;
                codigo_centro: z.ZodString;
                estado_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            }, {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            }>>;
            ciudadano_mayor: z.ZodNullable<z.ZodObject<{
                id_ciudadano: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                c_i: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            }>>;
            ciudadano_menor: z.ZodNullable<z.ZodObject<{
                id_menor: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                padre_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }, {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis_requeridas: number;
        dosis_aplicadas: number;
        esquema_completo: boolean;
        proxima_dosis: number | null;
        historial: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
    }, {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis_requeridas: number;
        dosis_aplicadas: number;
        esquema_completo: boolean;
        proxima_dosis: number | null;
        historial: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
    }>, "many">;
    inmunizaciones: z.ZodArray<z.ZodObject<{
        id_inmunizacion: z.ZodNumber;
        numero_dosis: z.ZodNumber;
        fecha_aplicacion: z.ZodNullable<z.ZodString>;
        numero_lote: z.ZodNullable<z.ZodString>;
        observaciones: z.ZodNullable<z.ZodString>;
        centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
        vacuna_id: z.ZodNullable<z.ZodNumber>;
        ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
        ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
        vacuna: z.ZodNullable<z.ZodObject<{
            id_vacuna: z.ZodNumber;
            nombre_vacuna: z.ZodString;
            cantidad_dosis: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        }, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        }>>;
        centro_salud: z.ZodNullable<z.ZodObject<{
            id_centro: z.ZodNumber;
            nombre_centro: z.ZodString;
            codigo_centro: z.ZodString;
            estado_id: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        }, {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        }>>;
        ciudadano_mayor: z.ZodNullable<z.ZodObject<{
            id_ciudadano: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            c_i: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        }, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        }>>;
        ciudadano_menor: z.ZodNullable<z.ZodObject<{
            id_menor: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            padre_id: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        }, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        }>>;
    }, "strip", z.ZodTypeAny, {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }, {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    inmunizaciones: {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }[];
    resumen_esquemas: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis_requeridas: number;
        dosis_aplicadas: number;
        esquema_completo: boolean;
        proxima_dosis: number | null;
        historial: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
    }[];
}, {
    inmunizaciones: {
        centro_salud: {
            estado_id: number | null;
            id_centro: number;
            nombre_centro: string;
            codigo_centro: string;
        } | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        observaciones: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
        ciudadano_mayor_edad_id: number | null;
        ciudadano_mayor_menor_id: number | null;
        vacuna: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis: number;
        } | null;
        ciudadano_mayor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
        } | null;
        ciudadano_menor: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            id_menor: number;
            padre_id: number | null;
        } | null;
    }[];
    resumen_esquemas: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis_requeridas: number;
        dosis_aplicadas: number;
        esquema_completo: boolean;
        proxima_dosis: number | null;
        historial: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
    }[];
}>;
export declare const cartillaFamiliarCedulaSchema: z.ZodObject<{
    titular: z.ZodObject<{
        id_ciudadano: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodNullable<z.ZodString>;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodNullable<z.ZodString>;
        c_i: z.ZodNumber;
        fecha_nacimiento: z.ZodString;
        sexo: z.ZodEnum<["masculino", "femenino"]>;
        tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
        estatura: z.ZodNumber;
        correo_electronico: z.ZodNullable<z.ZodString>;
        telefono_celular: z.ZodNullable<z.ZodString>;
        telefono_domicilio: z.ZodNullable<z.ZodString>;
        domicilio: z.ZodString;
        profesion_id: z.ZodNullable<z.ZodNumber>;
        parroquia_id: z.ZodNullable<z.ZodNumber>;
        municipio_id: z.ZodNullable<z.ZodNumber>;
        estado_id: z.ZodNullable<z.ZodNumber>;
        etnia_id: z.ZodNullable<z.ZodNumber>;
        nombre_profesion: z.ZodNullable<z.ZodString>;
        nombre_etnia: z.ZodNullable<z.ZodString>;
        nombre_estado: z.ZodNullable<z.ZodString>;
        nombre_municipio: z.ZodNullable<z.ZodString>;
        nombre_parroquia: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nombre_profesion: string | null;
        nombre_estado: string | null;
        nombre_municipio: string | null;
        estado_id: number | null;
        nombre_parroquia: string | null;
        municipio_id: number | null;
        nombre_etnia: string | null;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        domicilio: string;
        profesion_id: number | null;
        parroquia_id: number | null;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        estatura: number;
        correo_electronico: string | null;
        telefono_celular: string | null;
        telefono_domicilio: string | null;
        etnia_id: number | null;
    }, {
        nombre_profesion: string | null;
        nombre_estado: string | null;
        nombre_municipio: string | null;
        estado_id: number | null;
        nombre_parroquia: string | null;
        municipio_id: number | null;
        nombre_etnia: string | null;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        domicilio: string;
        profesion_id: number | null;
        parroquia_id: number | null;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        estatura: number;
        correo_electronico: string | null;
        telefono_celular: string | null;
        telefono_domicilio: string | null;
        etnia_id: number | null;
    }>;
    cartilla_titular: z.ZodObject<{
        resumen_esquemas: z.ZodArray<z.ZodObject<{
            id_vacuna: z.ZodNumber;
            nombre_vacuna: z.ZodString;
            cantidad_dosis_requeridas: z.ZodNumber;
            dosis_aplicadas: z.ZodNumber;
            esquema_completo: z.ZodBoolean;
            proxima_dosis: z.ZodNullable<z.ZodNumber>;
            historial: z.ZodArray<z.ZodObject<{
                id_inmunizacion: z.ZodNumber;
                numero_dosis: z.ZodNumber;
                fecha_aplicacion: z.ZodNullable<z.ZodString>;
                numero_lote: z.ZodNullable<z.ZodString>;
                observaciones: z.ZodNullable<z.ZodString>;
                centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
                vacuna_id: z.ZodNullable<z.ZodNumber>;
                ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
                ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
                vacuna: z.ZodNullable<z.ZodObject<{
                    id_vacuna: z.ZodNumber;
                    nombre_vacuna: z.ZodString;
                    cantidad_dosis: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                }, {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                }>>;
                centro_salud: z.ZodNullable<z.ZodObject<{
                    id_centro: z.ZodNumber;
                    nombre_centro: z.ZodString;
                    codigo_centro: z.ZodString;
                    estado_id: z.ZodNullable<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                }, {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                }>>;
                ciudadano_mayor: z.ZodNullable<z.ZodObject<{
                    id_ciudadano: z.ZodNumber;
                    primer_nombre: z.ZodString;
                    segundo_nombre: z.ZodNullable<z.ZodString>;
                    primer_apellido: z.ZodString;
                    segundo_apellido: z.ZodNullable<z.ZodString>;
                    c_i: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                }, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                }>>;
                ciudadano_menor: z.ZodNullable<z.ZodObject<{
                    id_menor: z.ZodNumber;
                    primer_nombre: z.ZodString;
                    segundo_nombre: z.ZodNullable<z.ZodString>;
                    primer_apellido: z.ZodString;
                    segundo_apellido: z.ZodNullable<z.ZodString>;
                    padre_id: z.ZodNullable<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                }, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                }>>;
            }, "strip", z.ZodTypeAny, {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }, {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }, {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }>, "many">;
        inmunizaciones: z.ZodArray<z.ZodObject<{
            id_inmunizacion: z.ZodNumber;
            numero_dosis: z.ZodNumber;
            fecha_aplicacion: z.ZodNullable<z.ZodString>;
            numero_lote: z.ZodNullable<z.ZodString>;
            observaciones: z.ZodNullable<z.ZodString>;
            centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
            vacuna_id: z.ZodNullable<z.ZodNumber>;
            ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
            ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
            vacuna: z.ZodNullable<z.ZodObject<{
                id_vacuna: z.ZodNumber;
                nombre_vacuna: z.ZodString;
                cantidad_dosis: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            }, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            }>>;
            centro_salud: z.ZodNullable<z.ZodObject<{
                id_centro: z.ZodNumber;
                nombre_centro: z.ZodString;
                codigo_centro: z.ZodString;
                estado_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            }, {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            }>>;
            ciudadano_mayor: z.ZodNullable<z.ZodObject<{
                id_ciudadano: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                c_i: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            }>>;
            ciudadano_menor: z.ZodNullable<z.ZodObject<{
                id_menor: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                padre_id: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }, {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        inmunizaciones: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
        resumen_esquemas: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }[];
    }, {
        inmunizaciones: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
        resumen_esquemas: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }[];
    }>;
    menores_a_cargo: z.ZodArray<z.ZodObject<{
        menor: z.ZodObject<{
            id_menor: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            fecha_nacimiento: z.ZodString;
            sexo: z.ZodEnum<["masculino", "femenino"]>;
            tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
            estatura: z.ZodNumber;
            domicilio: z.ZodString;
            parroquia_id: z.ZodNullable<z.ZodNumber>;
            municipio_id: z.ZodNullable<z.ZodNumber>;
            estado_id: z.ZodNullable<z.ZodNumber>;
            etnia_id: z.ZodNullable<z.ZodNumber>;
            padre_id: z.ZodNullable<z.ZodNumber>;
            nombre_etnia: z.ZodNullable<z.ZodString>;
            nombre_estado: z.ZodNullable<z.ZodString>;
            nombre_municipio: z.ZodNullable<z.ZodString>;
            nombre_parroquia: z.ZodNullable<z.ZodString>;
            representante: z.ZodNullable<z.ZodObject<{
                id_ciudadano: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                c_i: z.ZodNumber;
                telefono_celular: z.ZodNullable<z.ZodString>;
                telefono_domicilio: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            }>>;
        }, "strip", z.ZodTypeAny, {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        }, {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        }>;
        cartilla: z.ZodObject<{
            resumen_esquemas: z.ZodArray<z.ZodObject<{
                id_vacuna: z.ZodNumber;
                nombre_vacuna: z.ZodString;
                cantidad_dosis_requeridas: z.ZodNumber;
                dosis_aplicadas: z.ZodNumber;
                esquema_completo: z.ZodBoolean;
                proxima_dosis: z.ZodNullable<z.ZodNumber>;
                historial: z.ZodArray<z.ZodObject<{
                    id_inmunizacion: z.ZodNumber;
                    numero_dosis: z.ZodNumber;
                    fecha_aplicacion: z.ZodNullable<z.ZodString>;
                    numero_lote: z.ZodNullable<z.ZodString>;
                    observaciones: z.ZodNullable<z.ZodString>;
                    centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
                    vacuna_id: z.ZodNullable<z.ZodNumber>;
                    ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
                    ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
                    vacuna: z.ZodNullable<z.ZodObject<{
                        id_vacuna: z.ZodNumber;
                        nombre_vacuna: z.ZodString;
                        cantidad_dosis: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    }, {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    }>>;
                    centro_salud: z.ZodNullable<z.ZodObject<{
                        id_centro: z.ZodNumber;
                        nombre_centro: z.ZodString;
                        codigo_centro: z.ZodString;
                        estado_id: z.ZodNullable<z.ZodNumber>;
                    }, "strip", z.ZodTypeAny, {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    }, {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    }>>;
                    ciudadano_mayor: z.ZodNullable<z.ZodObject<{
                        id_ciudadano: z.ZodNumber;
                        primer_nombre: z.ZodString;
                        segundo_nombre: z.ZodNullable<z.ZodString>;
                        primer_apellido: z.ZodString;
                        segundo_apellido: z.ZodNullable<z.ZodString>;
                        c_i: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    }, {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    }>>;
                    ciudadano_menor: z.ZodNullable<z.ZodObject<{
                        id_menor: z.ZodNumber;
                        primer_nombre: z.ZodString;
                        segundo_nombre: z.ZodNullable<z.ZodString>;
                        primer_apellido: z.ZodString;
                        segundo_apellido: z.ZodNullable<z.ZodString>;
                        padre_id: z.ZodNullable<z.ZodNumber>;
                    }, "strip", z.ZodTypeAny, {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    }, {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }, {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }, {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }>, "many">;
            inmunizaciones: z.ZodArray<z.ZodObject<{
                id_inmunizacion: z.ZodNumber;
                numero_dosis: z.ZodNumber;
                fecha_aplicacion: z.ZodNullable<z.ZodString>;
                numero_lote: z.ZodNullable<z.ZodString>;
                observaciones: z.ZodNullable<z.ZodString>;
                centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
                vacuna_id: z.ZodNullable<z.ZodNumber>;
                ciudadano_mayor_edad_id: z.ZodNullable<z.ZodNumber>;
                ciudadano_mayor_menor_id: z.ZodNullable<z.ZodNumber>;
                vacuna: z.ZodNullable<z.ZodObject<{
                    id_vacuna: z.ZodNumber;
                    nombre_vacuna: z.ZodString;
                    cantidad_dosis: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                }, {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                }>>;
                centro_salud: z.ZodNullable<z.ZodObject<{
                    id_centro: z.ZodNumber;
                    nombre_centro: z.ZodString;
                    codigo_centro: z.ZodString;
                    estado_id: z.ZodNullable<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                }, {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                }>>;
                ciudadano_mayor: z.ZodNullable<z.ZodObject<{
                    id_ciudadano: z.ZodNumber;
                    primer_nombre: z.ZodString;
                    segundo_nombre: z.ZodNullable<z.ZodString>;
                    primer_apellido: z.ZodString;
                    segundo_apellido: z.ZodNullable<z.ZodString>;
                    c_i: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                }, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                }>>;
                ciudadano_menor: z.ZodNullable<z.ZodObject<{
                    id_menor: z.ZodNumber;
                    primer_nombre: z.ZodString;
                    segundo_nombre: z.ZodNullable<z.ZodString>;
                    primer_apellido: z.ZodString;
                    segundo_apellido: z.ZodNullable<z.ZodString>;
                    padre_id: z.ZodNullable<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                }, {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                }>>;
            }, "strip", z.ZodTypeAny, {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }, {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        }, {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        }>;
    }, "strip", z.ZodTypeAny, {
        menor: {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        };
        cartilla: {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        };
    }, {
        menor: {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        };
        cartilla: {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    menores_a_cargo: {
        menor: {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        };
        cartilla: {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        };
    }[];
    titular: {
        nombre_profesion: string | null;
        nombre_estado: string | null;
        nombre_municipio: string | null;
        estado_id: number | null;
        nombre_parroquia: string | null;
        municipio_id: number | null;
        nombre_etnia: string | null;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        domicilio: string;
        profesion_id: number | null;
        parroquia_id: number | null;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        estatura: number;
        correo_electronico: string | null;
        telefono_celular: string | null;
        telefono_domicilio: string | null;
        etnia_id: number | null;
    };
    cartilla_titular: {
        inmunizaciones: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
        resumen_esquemas: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }[];
    };
}, {
    menores_a_cargo: {
        menor: {
            nombre_estado: string | null;
            nombre_municipio: string | null;
            estado_id: number | null;
            nombre_parroquia: string | null;
            municipio_id: number | null;
            nombre_etnia: string | null;
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            domicilio: string;
            parroquia_id: number | null;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            estatura: number;
            etnia_id: number | null;
            id_menor: number;
            padre_id: number | null;
            representante: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                telefono_celular: string | null;
                telefono_domicilio: string | null;
            } | null;
        };
        cartilla: {
            inmunizaciones: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
            resumen_esquemas: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis_requeridas: number;
                dosis_aplicadas: number;
                esquema_completo: boolean;
                proxima_dosis: number | null;
                historial: {
                    centro_salud: {
                        estado_id: number | null;
                        id_centro: number;
                        nombre_centro: string;
                        codigo_centro: string;
                    } | null;
                    id_inmunizacion: number;
                    numero_dosis: number;
                    fecha_aplicacion: string | null;
                    numero_lote: string | null;
                    observaciones: string | null;
                    centro_salud_aplicacion: number | null;
                    vacuna_id: number | null;
                    ciudadano_mayor_edad_id: number | null;
                    ciudadano_mayor_menor_id: number | null;
                    vacuna: {
                        id_vacuna: number;
                        nombre_vacuna: string;
                        cantidad_dosis: number;
                    } | null;
                    ciudadano_mayor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        c_i: number;
                        id_ciudadano: number;
                    } | null;
                    ciudadano_menor: {
                        primer_nombre: string;
                        segundo_nombre: string | null;
                        primer_apellido: string;
                        segundo_apellido: string | null;
                        id_menor: number;
                        padre_id: number | null;
                    } | null;
                }[];
            }[];
        };
    }[];
    titular: {
        nombre_profesion: string | null;
        nombre_estado: string | null;
        nombre_municipio: string | null;
        estado_id: number | null;
        nombre_parroquia: string | null;
        municipio_id: number | null;
        nombre_etnia: string | null;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        domicilio: string;
        profesion_id: number | null;
        parroquia_id: number | null;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        estatura: number;
        correo_electronico: string | null;
        telefono_celular: string | null;
        telefono_domicilio: string | null;
        etnia_id: number | null;
    };
    cartilla_titular: {
        inmunizaciones: {
            centro_salud: {
                estado_id: number | null;
                id_centro: number;
                nombre_centro: string;
                codigo_centro: string;
            } | null;
            id_inmunizacion: number;
            numero_dosis: number;
            fecha_aplicacion: string | null;
            numero_lote: string | null;
            observaciones: string | null;
            centro_salud_aplicacion: number | null;
            vacuna_id: number | null;
            ciudadano_mayor_edad_id: number | null;
            ciudadano_mayor_menor_id: number | null;
            vacuna: {
                id_vacuna: number;
                nombre_vacuna: string;
                cantidad_dosis: number;
            } | null;
            ciudadano_mayor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
            } | null;
            ciudadano_menor: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                id_menor: number;
                padre_id: number | null;
            } | null;
        }[];
        resumen_esquemas: {
            id_vacuna: number;
            nombre_vacuna: string;
            cantidad_dosis_requeridas: number;
            dosis_aplicadas: number;
            esquema_completo: boolean;
            proxima_dosis: number | null;
            historial: {
                centro_salud: {
                    estado_id: number | null;
                    id_centro: number;
                    nombre_centro: string;
                    codigo_centro: string;
                } | null;
                id_inmunizacion: number;
                numero_dosis: number;
                fecha_aplicacion: string | null;
                numero_lote: string | null;
                observaciones: string | null;
                centro_salud_aplicacion: number | null;
                vacuna_id: number | null;
                ciudadano_mayor_edad_id: number | null;
                ciudadano_mayor_menor_id: number | null;
                vacuna: {
                    id_vacuna: number;
                    nombre_vacuna: string;
                    cantidad_dosis: number;
                } | null;
                ciudadano_mayor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    c_i: number;
                    id_ciudadano: number;
                } | null;
                ciudadano_menor: {
                    primer_nombre: string;
                    segundo_nombre: string | null;
                    primer_apellido: string;
                    segundo_apellido: string | null;
                    id_menor: number;
                    padre_id: number | null;
                } | null;
            }[];
        }[];
    };
}>;
export declare const createInmunizacionBodySchema: z.ZodEffects<z.ZodObject<{
    vacuna_id: z.ZodNumber;
    numero_dosis: z.ZodNumber;
    fecha_aplicacion: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    numero_lote: z.ZodString;
    observaciones: z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNull, z.ZodUndefined]>, string | null | undefined, string | null | undefined>, string | null | undefined, string | null | undefined>;
    centro_salud_aplicacion: z.ZodOptional<z.ZodNumber>;
    ciudadano_mayor_edad_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ciudadano_mayor_menor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    numero_dosis: number;
    numero_lote: string;
    vacuna_id: number;
    fecha_aplicacion?: string | undefined;
    observaciones?: string | null | undefined;
    centro_salud_aplicacion?: number | undefined;
    ciudadano_mayor_edad_id?: number | null | undefined;
    ciudadano_mayor_menor_id?: number | null | undefined;
}, {
    numero_dosis: number;
    numero_lote: string;
    vacuna_id: number;
    fecha_aplicacion?: string | undefined;
    observaciones?: string | null | undefined;
    centro_salud_aplicacion?: number | undefined;
    ciudadano_mayor_edad_id?: number | null | undefined;
    ciudadano_mayor_menor_id?: number | null | undefined;
}>, {
    numero_dosis: number;
    numero_lote: string;
    vacuna_id: number;
    fecha_aplicacion?: string | undefined;
    observaciones?: string | null | undefined;
    centro_salud_aplicacion?: number | undefined;
    ciudadano_mayor_edad_id?: number | null | undefined;
    ciudadano_mayor_menor_id?: number | null | undefined;
}, {
    numero_dosis: number;
    numero_lote: string;
    vacuna_id: number;
    fecha_aplicacion?: string | undefined;
    observaciones?: string | null | undefined;
    centro_salud_aplicacion?: number | undefined;
    ciudadano_mayor_edad_id?: number | null | undefined;
    ciudadano_mayor_menor_id?: number | null | undefined;
}>;
export declare const updateInmunizacionBodySchema: z.ZodEffects<z.ZodObject<{
    fecha_aplicacion: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    numero_lote: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNull, z.ZodUndefined]>, string | null | undefined, string | null | undefined>, string | null | undefined, string | null | undefined>;
}, "strip", z.ZodTypeAny, {
    fecha_aplicacion?: string | undefined;
    numero_lote?: string | undefined;
    observaciones?: string | null | undefined;
}, {
    fecha_aplicacion?: string | undefined;
    numero_lote?: string | undefined;
    observaciones?: string | null | undefined;
}>, {
    fecha_aplicacion?: string | undefined;
    numero_lote?: string | undefined;
    observaciones?: string | null | undefined;
}, {
    fecha_aplicacion?: string | undefined;
    numero_lote?: string | undefined;
    observaciones?: string | null | undefined;
}>;
export declare const inmunizacionesQuerySchema: z.ZodObject<{
    vacuna_id: z.ZodOptional<z.ZodNumber>;
    centro_salud_aplicacion: z.ZodOptional<z.ZodNumber>;
    estado_id: z.ZodOptional<z.ZodNumber>;
    ciudadano_mayor_edad_id: z.ZodOptional<z.ZodNumber>;
    ciudadano_mayor_menor_id: z.ZodOptional<z.ZodNumber>;
    numero_lote: z.ZodOptional<z.ZodString>;
    fecha_desde: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fecha_hasta: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    estado_id?: number | undefined;
    numero_lote?: string | undefined;
    centro_salud_aplicacion?: number | undefined;
    vacuna_id?: number | undefined;
    ciudadano_mayor_edad_id?: number | undefined;
    ciudadano_mayor_menor_id?: number | undefined;
    fecha_desde?: string | undefined;
    fecha_hasta?: string | undefined;
}, {
    estado_id?: number | undefined;
    numero_lote?: string | undefined;
    centro_salud_aplicacion?: number | undefined;
    vacuna_id?: number | undefined;
    ciudadano_mayor_edad_id?: number | undefined;
    ciudadano_mayor_menor_id?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    fecha_desde?: string | undefined;
    fecha_hasta?: string | undefined;
}>;
export type VacunaResumen = z.infer<typeof vacunaResumenSchema>;
export type CentroAplicacionResumen = z.infer<typeof centroAplicacionResumenSchema>;
export type PacienteMayorResumen = z.infer<typeof pacienteMayorResumenSchema>;
export type PacienteMenorResumen = z.infer<typeof pacienteMenorResumenSchema>;
export type InmunizacionDetalle = z.infer<typeof inmunizacionDetalleSchema>;
export type EsquemaVacunaProgreso = z.infer<typeof esquemaVacunaProgresoSchema>;
export type CartillaVacunacionCiudadano = z.infer<typeof cartillaVacunacionCiudadanoSchema>;
export type CartillaFamiliarCedula = z.infer<typeof cartillaFamiliarCedulaSchema>;
export type CreateInmunizacionBody = z.infer<typeof createInmunizacionBodySchema>;
export type UpdateInmunizacionBody = z.infer<typeof updateInmunizacionBodySchema>;
export type InmunizacionesQuery = z.infer<typeof inmunizacionesQuerySchema>;
