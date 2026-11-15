import { z } from 'zod';
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const estadoSchema: z.ZodObject<{
    id_estado: z.ZodNumber;
    nombre_estado: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id_estado: number;
    nombre_estado: string;
}, {
    id_estado: number;
    nombre_estado: string;
}>;
export declare const municipiosQuerySchema: z.ZodObject<{
    estado_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id?: number | undefined;
}, {
    estado_id?: number | undefined;
}>;
export declare const municipioSchema: z.ZodObject<{
    id_municipio: z.ZodNumber;
    nombre_municipio: z.ZodString;
    estado_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id_municipio: number;
    nombre_municipio: string;
    estado_id: number | null;
}, {
    id_municipio: number;
    nombre_municipio: string;
    estado_id: number | null;
}>;
export declare const parroquiasQuerySchema: z.ZodObject<{
    estado_id: z.ZodOptional<z.ZodNumber>;
    municipio_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
}, {
    estado_id?: number | undefined;
    municipio_id?: number | undefined;
}>;
export declare const parroquiaSchema: z.ZodObject<{
    id_parroquia: z.ZodNumber;
    nombre_parroquia: z.ZodString;
    municipio_id: z.ZodNullable<z.ZodNumber>;
    estado_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    estado_id: number | null;
    id_parroquia: number;
    nombre_parroquia: string;
    municipio_id: number | null;
}, {
    estado_id: number | null;
    id_parroquia: number;
    nombre_parroquia: string;
    municipio_id: number | null;
}>;
export declare const etniaSchema: z.ZodObject<{
    id_etnia: z.ZodNumber;
    nombre_etnia: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id_etnia: number;
    nombre_etnia: string;
}, {
    id_etnia: number;
    nombre_etnia: string;
}>;
export declare const profesionSchema: z.ZodObject<{
    id_profesion: z.ZodNumber;
    nombre_profesion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id_profesion: number;
    nombre_profesion: string;
}, {
    id_profesion: number;
    nombre_profesion: string;
}>;
export declare const vacunaSchema: z.ZodObject<{
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
export declare const createVacunaBodySchema: z.ZodObject<{
    nombre_vacuna: z.ZodString;
    cantidad_dosis: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    nombre_vacuna: string;
    cantidad_dosis: number;
}, {
    nombre_vacuna: string;
    cantidad_dosis: number;
}>;
export declare const updateVacunaBodySchema: z.ZodEffects<z.ZodObject<{
    nombre_vacuna: z.ZodOptional<z.ZodString>;
    cantidad_dosis: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nombre_vacuna?: string | undefined;
    cantidad_dosis?: number | undefined;
}, {
    nombre_vacuna?: string | undefined;
    cantidad_dosis?: number | undefined;
}>, {
    nombre_vacuna?: string | undefined;
    cantidad_dosis?: number | undefined;
}, {
    nombre_vacuna?: string | undefined;
    cantidad_dosis?: number | undefined;
}>;
export declare const sintomaComunSchema: z.ZodObject<{
    id_sintoma: z.ZodNumber;
    descripcion_sintoma: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id_sintoma: number;
    descripcion_sintoma: string | null;
}, {
    id_sintoma: number;
    descripcion_sintoma: string | null;
}>;
export declare const createSintomaComunBodySchema: z.ZodObject<{
    descripcion_sintoma: z.ZodString;
}, "strip", z.ZodTypeAny, {
    descripcion_sintoma: string;
}, {
    descripcion_sintoma: string;
}>;
export declare const examenSchema: z.ZodObject<{
    id_examenes: z.ZodNumber;
    nombre_examen: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id_examenes: number;
    nombre_examen: string;
}, {
    id_examenes: number;
    nombre_examen: string;
}>;
export declare const createExamenBodySchema: z.ZodObject<{
    nombre_examen: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre_examen: string;
}, {
    nombre_examen: string;
}>;
export declare const catalogosResumenSchema: z.ZodObject<{
    estados: z.ZodArray<z.ZodObject<{
        id_estado: z.ZodNumber;
        nombre_estado: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_estado: number;
        nombre_estado: string;
    }, {
        id_estado: number;
        nombre_estado: string;
    }>, "many">;
    etnias: z.ZodArray<z.ZodObject<{
        id_etnia: z.ZodNumber;
        nombre_etnia: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_etnia: number;
        nombre_etnia: string;
    }, {
        id_etnia: number;
        nombre_etnia: string;
    }>, "many">;
    profesiones: z.ZodArray<z.ZodObject<{
        id_profesion: z.ZodNumber;
        nombre_profesion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_profesion: number;
        nombre_profesion: string;
    }, {
        id_profesion: number;
        nombre_profesion: string;
    }>, "many">;
    vacunas: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    sintomas_comunes: z.ZodArray<z.ZodObject<{
        id_sintoma: z.ZodNumber;
        descripcion_sintoma: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id_sintoma: number;
        descripcion_sintoma: string | null;
    }, {
        id_sintoma: number;
        descripcion_sintoma: string | null;
    }>, "many">;
    examenes: z.ZodArray<z.ZodObject<{
        id_examenes: z.ZodNumber;
        nombre_examen: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id_examenes: number;
        nombre_examen: string;
    }, {
        id_examenes: number;
        nombre_examen: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    vacunas: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    }[];
    profesiones: {
        id_profesion: number;
        nombre_profesion: string;
    }[];
    estados: {
        id_estado: number;
        nombre_estado: string;
    }[];
    etnias: {
        id_etnia: number;
        nombre_etnia: string;
    }[];
    sintomas_comunes: {
        id_sintoma: number;
        descripcion_sintoma: string | null;
    }[];
    examenes: {
        id_examenes: number;
        nombre_examen: string;
    }[];
}, {
    vacunas: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
    }[];
    profesiones: {
        id_profesion: number;
        nombre_profesion: string;
    }[];
    estados: {
        id_estado: number;
        nombre_estado: string;
    }[];
    etnias: {
        id_etnia: number;
        nombre_etnia: string;
    }[];
    sintomas_comunes: {
        id_sintoma: number;
        descripcion_sintoma: string | null;
    }[];
    examenes: {
        id_examenes: number;
        nombre_examen: string;
    }[];
}>;
export declare function okSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: T;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    ok: z.ZodLiteral<true>;
    data: T;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    ok: z.ZodLiteral<true>;
    data: T;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type CreateVacunaBody = z.infer<typeof createVacunaBodySchema>;
export type UpdateVacunaBody = z.infer<typeof updateVacunaBodySchema>;
export type CreateSintomaComunBody = z.infer<typeof createSintomaComunBodySchema>;
export type CreateExamenBody = z.infer<typeof createExamenBodySchema>;
export type MunicipiosQuery = z.infer<typeof municipiosQuerySchema>;
export type ParroquiasQuery = z.infer<typeof parroquiasQuerySchema>;
