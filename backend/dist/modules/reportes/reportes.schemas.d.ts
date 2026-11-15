import { z } from 'zod';
import { cedulaParamSchema, fechaIsoCalendarSchema, fechaIsoNotFutureSchema, idParamSchema, okSchema } from '../inmunizaciones/index.js';
export { cedulaParamSchema, fechaIsoCalendarSchema, fechaIsoNotFutureSchema, idParamSchema, okSchema, };
export declare const reporteInmunizacionResumenSchema: z.ZodObject<{
    id_inmunizacion: z.ZodNumber;
    numero_dosis: z.ZodNumber;
    fecha_aplicacion: z.ZodNullable<z.ZodString>;
    numero_lote: z.ZodNullable<z.ZodString>;
    centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
    nombre_centro: z.ZodNullable<z.ZodString>;
    estado_id: z.ZodNullable<z.ZodNumber>;
    vacuna_id: z.ZodNullable<z.ZodNumber>;
    nombre_vacuna: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    estado_id: number | null;
    nombre_vacuna: string | null;
    nombre_centro: string | null;
    id_inmunizacion: number;
    numero_dosis: number;
    fecha_aplicacion: string | null;
    numero_lote: string | null;
    centro_salud_aplicacion: number | null;
    vacuna_id: number | null;
}, {
    estado_id: number | null;
    nombre_vacuna: string | null;
    nombre_centro: string | null;
    id_inmunizacion: number;
    numero_dosis: number;
    fecha_aplicacion: string | null;
    numero_lote: string | null;
    centro_salud_aplicacion: number | null;
    vacuna_id: number | null;
}>;
export declare const reporteDetalleSchema: z.ZodObject<{
    id_reportes: z.ZodNumber;
    nivel_gravedad: z.ZodEnum<["LEVE", "MODERADO", "SEVERO"]>;
    recomendaciones: z.ZodString;
    inmunizacion_id: z.ZodNullable<z.ZodNumber>;
    ciudadano_mayor_id: z.ZodNullable<z.ZodNumber>;
    ciudadano_menor_id: z.ZodNullable<z.ZodNumber>;
    sintoma_id: z.ZodNullable<z.ZodNumber>;
    descripcion_sintoma: z.ZodNullable<z.ZodString>;
    inmunizacion: z.ZodNullable<z.ZodObject<{
        id_inmunizacion: z.ZodNumber;
        numero_dosis: z.ZodNumber;
        fecha_aplicacion: z.ZodNullable<z.ZodString>;
        numero_lote: z.ZodNullable<z.ZodString>;
        centro_salud_aplicacion: z.ZodNullable<z.ZodNumber>;
        nombre_centro: z.ZodNullable<z.ZodString>;
        estado_id: z.ZodNullable<z.ZodNumber>;
        vacuna_id: z.ZodNullable<z.ZodNumber>;
        nombre_vacuna: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        estado_id: number | null;
        nombre_vacuna: string | null;
        nombre_centro: string | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
    }, {
        estado_id: number | null;
        nombre_vacuna: string | null;
        nombre_centro: string | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
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
    descripcion_sintoma: string | null;
    inmunizacion: {
        estado_id: number | null;
        nombre_vacuna: string | null;
        nombre_centro: string | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
    } | null;
    id_reportes: number;
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number | null;
    ciudadano_mayor_id: number | null;
    ciudadano_menor_id: number | null;
    sintoma_id: number | null;
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
    descripcion_sintoma: string | null;
    inmunizacion: {
        estado_id: number | null;
        nombre_vacuna: string | null;
        nombre_centro: string | null;
        id_inmunizacion: number;
        numero_dosis: number;
        fecha_aplicacion: string | null;
        numero_lote: string | null;
        centro_salud_aplicacion: number | null;
        vacuna_id: number | null;
    } | null;
    id_reportes: number;
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number | null;
    ciudadano_mayor_id: number | null;
    ciudadano_menor_id: number | null;
    sintoma_id: number | null;
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
export declare const createReporteBodySchema: z.ZodEffects<z.ZodObject<{
    inmunizacion_id: z.ZodNumber;
    sintoma_id: z.ZodNumber;
    nivel_gravedad: z.ZodEnum<["LEVE", "MODERADO", "SEVERO"]>;
    recomendaciones: z.ZodString;
    ciudadano_mayor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ciudadano_menor_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number;
    sintoma_id: number;
    ciudadano_mayor_id?: number | null | undefined;
    ciudadano_menor_id?: number | null | undefined;
}, {
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number;
    sintoma_id: number;
    ciudadano_mayor_id?: number | null | undefined;
    ciudadano_menor_id?: number | null | undefined;
}>, {
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number;
    sintoma_id: number;
    ciudadano_mayor_id?: number | null | undefined;
    ciudadano_menor_id?: number | null | undefined;
}, {
    nivel_gravedad: "LEVE" | "MODERADO" | "SEVERO";
    recomendaciones: string;
    inmunizacion_id: number;
    sintoma_id: number;
    ciudadano_mayor_id?: number | null | undefined;
    ciudadano_menor_id?: number | null | undefined;
}>;
export declare const updateReporteBodySchema: z.ZodEffects<z.ZodObject<{
    nivel_gravedad: z.ZodOptional<z.ZodEnum<["LEVE", "MODERADO", "SEVERO"]>>;
    recomendaciones: z.ZodOptional<z.ZodString>;
    sintoma_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    recomendaciones?: string | undefined;
    sintoma_id?: number | undefined;
}, {
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    recomendaciones?: string | undefined;
    sintoma_id?: number | undefined;
}>, {
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    recomendaciones?: string | undefined;
    sintoma_id?: number | undefined;
}, {
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    recomendaciones?: string | undefined;
    sintoma_id?: number | undefined;
}>;
export declare const reportesQuerySchema: z.ZodObject<{
    nivel_gravedad: z.ZodOptional<z.ZodEnum<["LEVE", "MODERADO", "SEVERO"]>>;
    sintoma_id: z.ZodOptional<z.ZodNumber>;
    inmunizacion_id: z.ZodOptional<z.ZodNumber>;
    ciudadano_mayor_id: z.ZodOptional<z.ZodNumber>;
    ciudadano_menor_id: z.ZodOptional<z.ZodNumber>;
    centro_salud_id: z.ZodOptional<z.ZodNumber>;
    estado_id: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    estado_id?: number | undefined;
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    inmunizacion_id?: number | undefined;
    ciudadano_mayor_id?: number | undefined;
    ciudadano_menor_id?: number | undefined;
    sintoma_id?: number | undefined;
    centro_salud_id?: number | undefined;
}, {
    estado_id?: number | undefined;
    nivel_gravedad?: "LEVE" | "MODERADO" | "SEVERO" | undefined;
    inmunizacion_id?: number | undefined;
    ciudadano_mayor_id?: number | undefined;
    ciudadano_menor_id?: number | undefined;
    sintoma_id?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    centro_salud_id?: number | undefined;
}>;
export declare const certificadoCiudadanoSchema: z.ZodObject<{
    id_ciudadano: z.ZodNumber;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodNullable<z.ZodString>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodNullable<z.ZodString>;
    c_i: z.ZodNumber;
    fecha_nacimiento: z.ZodString;
    sexo: z.ZodEnum<["masculino", "femenino"]>;
    tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    c_i: number;
    id_ciudadano: number;
    fecha_nacimiento: string;
    sexo: "masculino" | "femenino";
    tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
}, {
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    c_i: number;
    id_ciudadano: number;
    fecha_nacimiento: string;
    sexo: "masculino" | "femenino";
    tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
}>;
export declare const certificadoDetalleSchema: z.ZodObject<{
    id_certificado: z.ZodNumber;
    fecha_emision: z.ZodString;
    estatus: z.ZodEnum<["RECHAZADO", "APROBADO"]>;
    ciudadano_mayor_id: z.ZodNullable<z.ZodNumber>;
    examen_id: z.ZodNullable<z.ZodNumber>;
    nombre_examen: z.ZodNullable<z.ZodString>;
    ciudadano: z.ZodNullable<z.ZodObject<{
        id_ciudadano: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodNullable<z.ZodString>;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodNullable<z.ZodString>;
        c_i: z.ZodNumber;
        fecha_nacimiento: z.ZodString;
        sexo: z.ZodEnum<["masculino", "femenino"]>;
        tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
    }, "strip", z.ZodTypeAny, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    }, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    }>>;
    total_inmunizaciones_registradas: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    nombre_examen: string | null;
    ciudadano_mayor_id: number | null;
    id_certificado: number;
    fecha_emision: string;
    estatus: "RECHAZADO" | "APROBADO";
    examen_id: number | null;
    ciudadano: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    } | null;
    total_inmunizaciones_registradas: number;
}, {
    nombre_examen: string | null;
    ciudadano_mayor_id: number | null;
    id_certificado: number;
    fecha_emision: string;
    estatus: "RECHAZADO" | "APROBADO";
    examen_id: number | null;
    ciudadano: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    } | null;
    total_inmunizaciones_registradas: number;
}>;
export declare const validacionCertificadoSchema: z.ZodObject<{
    valido: z.ZodBoolean;
    motivo: z.ZodString;
    certificado: z.ZodObject<{
        id_certificado: z.ZodNumber;
        fecha_emision: z.ZodString;
        estatus: z.ZodEnum<["RECHAZADO", "APROBADO"]>;
        ciudadano_mayor_id: z.ZodNullable<z.ZodNumber>;
        examen_id: z.ZodNullable<z.ZodNumber>;
        nombre_examen: z.ZodNullable<z.ZodString>;
        ciudadano: z.ZodNullable<z.ZodObject<{
            id_ciudadano: z.ZodNumber;
            primer_nombre: z.ZodString;
            segundo_nombre: z.ZodNullable<z.ZodString>;
            primer_apellido: z.ZodString;
            segundo_apellido: z.ZodNullable<z.ZodString>;
            c_i: z.ZodNumber;
            fecha_nacimiento: z.ZodString;
            sexo: z.ZodEnum<["masculino", "femenino"]>;
            tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
        }, "strip", z.ZodTypeAny, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        }, {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        }>>;
        total_inmunizaciones_registradas: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nombre_examen: string | null;
        ciudadano_mayor_id: number | null;
        id_certificado: number;
        fecha_emision: string;
        estatus: "RECHAZADO" | "APROBADO";
        examen_id: number | null;
        ciudadano: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        } | null;
        total_inmunizaciones_registradas: number;
    }, {
        nombre_examen: string | null;
        ciudadano_mayor_id: number | null;
        id_certificado: number;
        fecha_emision: string;
        estatus: "RECHAZADO" | "APROBADO";
        examen_id: number | null;
        ciudadano: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        } | null;
        total_inmunizaciones_registradas: number;
    }>;
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
    certificado: {
        nombre_examen: string | null;
        ciudadano_mayor_id: number | null;
        id_certificado: number;
        fecha_emision: string;
        estatus: "RECHAZADO" | "APROBADO";
        examen_id: number | null;
        ciudadano: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        } | null;
        total_inmunizaciones_registradas: number;
    };
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
    valido: boolean;
    motivo: string;
}, {
    certificado: {
        nombre_examen: string | null;
        ciudadano_mayor_id: number | null;
        id_certificado: number;
        fecha_emision: string;
        estatus: "RECHAZADO" | "APROBADO";
        examen_id: number | null;
        ciudadano: {
            primer_nombre: string;
            segundo_nombre: string | null;
            primer_apellido: string;
            segundo_apellido: string | null;
            c_i: number;
            id_ciudadano: number;
            fecha_nacimiento: string;
            sexo: "masculino" | "femenino";
            tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
        } | null;
        total_inmunizaciones_registradas: number;
    };
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
    valido: boolean;
    motivo: string;
}>;
export declare const consultaCertificadosCedulaSchema: z.ZodObject<{
    ciudadano: z.ZodObject<{
        id_ciudadano: z.ZodNumber;
        primer_nombre: z.ZodString;
        segundo_nombre: z.ZodNullable<z.ZodString>;
        primer_apellido: z.ZodString;
        segundo_apellido: z.ZodNullable<z.ZodString>;
        c_i: z.ZodNumber;
        fecha_nacimiento: z.ZodString;
        sexo: z.ZodEnum<["masculino", "femenino"]>;
        tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
    }, "strip", z.ZodTypeAny, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    }, {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    }>;
    certificados: z.ZodArray<z.ZodObject<{
        valido: z.ZodBoolean;
        motivo: z.ZodString;
        certificado: z.ZodObject<{
            id_certificado: z.ZodNumber;
            fecha_emision: z.ZodString;
            estatus: z.ZodEnum<["RECHAZADO", "APROBADO"]>;
            ciudadano_mayor_id: z.ZodNullable<z.ZodNumber>;
            examen_id: z.ZodNullable<z.ZodNumber>;
            nombre_examen: z.ZodNullable<z.ZodString>;
            ciudadano: z.ZodNullable<z.ZodObject<{
                id_ciudadano: z.ZodNumber;
                primer_nombre: z.ZodString;
                segundo_nombre: z.ZodNullable<z.ZodString>;
                primer_apellido: z.ZodString;
                segundo_apellido: z.ZodNullable<z.ZodString>;
                c_i: z.ZodNumber;
                fecha_nacimiento: z.ZodString;
                sexo: z.ZodEnum<["masculino", "femenino"]>;
                tipo_sangre: z.ZodEnum<["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]>;
            }, "strip", z.ZodTypeAny, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            }, {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            }>>;
            total_inmunizaciones_registradas: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        }, {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        certificado: {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        };
        valido: boolean;
        motivo: string;
    }, {
        certificado: {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        };
        valido: boolean;
        motivo: string;
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
    certificados: {
        certificado: {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        };
        valido: boolean;
        motivo: string;
    }[];
    ciudadano: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    };
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
    certificados: {
        certificado: {
            nombre_examen: string | null;
            ciudadano_mayor_id: number | null;
            id_certificado: number;
            fecha_emision: string;
            estatus: "RECHAZADO" | "APROBADO";
            examen_id: number | null;
            ciudadano: {
                primer_nombre: string;
                segundo_nombre: string | null;
                primer_apellido: string;
                segundo_apellido: string | null;
                c_i: number;
                id_ciudadano: number;
                fecha_nacimiento: string;
                sexo: "masculino" | "femenino";
                tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
            } | null;
            total_inmunizaciones_registradas: number;
        };
        valido: boolean;
        motivo: string;
    }[];
    ciudadano: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        c_i: number;
        id_ciudadano: number;
        fecha_nacimiento: string;
        sexo: "masculino" | "femenino";
        tipo_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
    };
}>;
export declare const createCertificadoBodySchema: z.ZodObject<{
    ciudadano_mayor_id: z.ZodNumber;
    examen_id: z.ZodNumber;
    fecha_emision: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    estatus: z.ZodDefault<z.ZodEnum<["RECHAZADO", "APROBADO"]>>;
}, "strip", z.ZodTypeAny, {
    ciudadano_mayor_id: number;
    estatus: "RECHAZADO" | "APROBADO";
    examen_id: number;
    fecha_emision?: string | undefined;
}, {
    ciudadano_mayor_id: number;
    examen_id: number;
    fecha_emision?: string | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
}>;
export declare const updateCertificadoBodySchema: z.ZodEffects<z.ZodObject<{
    estatus: z.ZodOptional<z.ZodEnum<["RECHAZADO", "APROBADO"]>>;
    examen_id: z.ZodOptional<z.ZodNumber>;
    fecha_emision: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    fecha_emision?: string | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
}, {
    fecha_emision?: string | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
}>, {
    fecha_emision?: string | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
}, {
    fecha_emision?: string | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
}>;
export declare const certificadosQuerySchema: z.ZodObject<{
    ciudadano_mayor_id: z.ZodOptional<z.ZodNumber>;
    c_i: z.ZodOptional<z.ZodNumber>;
    examen_id: z.ZodOptional<z.ZodNumber>;
    estatus: z.ZodOptional<z.ZodEnum<["RECHAZADO", "APROBADO"]>>;
    fecha_desde: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fecha_hasta: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    c_i?: number | undefined;
    ciudadano_mayor_id?: number | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
    fecha_desde?: string | undefined;
    fecha_hasta?: string | undefined;
}, {
    c_i?: number | undefined;
    ciudadano_mayor_id?: number | undefined;
    estatus?: "RECHAZADO" | "APROBADO" | undefined;
    examen_id?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    fecha_desde?: string | undefined;
    fecha_hasta?: string | undefined;
}>;
export type ReporteInmunizacionResumen = z.infer<typeof reporteInmunizacionResumenSchema>;
export type ReporteDetalle = z.infer<typeof reporteDetalleSchema>;
export type CreateReporteBody = z.infer<typeof createReporteBodySchema>;
export type UpdateReporteBody = z.infer<typeof updateReporteBodySchema>;
export type ReportesQuery = z.infer<typeof reportesQuerySchema>;
export type CertificadoCiudadano = z.infer<typeof certificadoCiudadanoSchema>;
export type CertificadoDetalle = z.infer<typeof certificadoDetalleSchema>;
export type ValidacionCertificado = z.infer<typeof validacionCertificadoSchema>;
export type ConsultaCertificadosCedula = z.infer<typeof consultaCertificadosCedulaSchema>;
export type CreateCertificadoBody = z.infer<typeof createCertificadoBodySchema>;
export type UpdateCertificadoBody = z.infer<typeof updateCertificadoBodySchema>;
export type CertificadosQuery = z.infer<typeof certificadosQuerySchema>;
