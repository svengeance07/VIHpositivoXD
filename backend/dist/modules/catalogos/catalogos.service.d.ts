import type { CreateExamenBody, CreateSintomaComunBody, CreateVacunaBody, ParroquiasQuery, UpdateVacunaBody } from './catalogos.schemas.js';
export declare function listEstados(): Promise<{
    id_estado: number;
    nombre_estado: string;
}[]>;
export declare function listMunicipios(estadoId?: number): Promise<{
    id_municipio: number;
    nombre_municipio: string;
    estado_id: number | null;
}[]>;
export declare function listParroquias(filters?: ParroquiasQuery): Promise<{
    id_parroquia: number;
    nombre_parroquia: string;
    municipio_id: number | null;
    estado_id: number | null;
}[]>;
export declare function listEtnias(): Promise<{
    id_etnia: number;
    nombre_etnia: string;
}[]>;
export declare function listProfesiones(): Promise<{
    id_profesion: number;
    nombre_profesion: string;
}[]>;
export declare function listVacunas(): Promise<{
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}[]>;
export declare function getVacunaById(idVacuna: number): Promise<{
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}>;
export declare function createVacuna(input: CreateVacunaBody): Promise<{
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}>;
export declare function updateVacuna(idVacuna: number, input: UpdateVacunaBody): Promise<{
    id_vacuna: number;
    nombre_vacuna: string;
    cantidad_dosis: number;
}>;
export declare function listSintomasComunes(): Promise<{
    id_sintoma: number;
    descripcion_sintoma: string | null;
}[]>;
export declare function createSintomaComun(input: CreateSintomaComunBody): Promise<{
    id_sintoma: number;
    descripcion_sintoma: string | null;
}>;
export declare function listExamenes(): Promise<{
    id_examenes: number;
    nombre_examen: string;
}[]>;
export declare function createExamen(input: CreateExamenBody): Promise<{
    id_examenes: number;
    nombre_examen: string;
}>;
export declare function getCatalogosResumen(): Promise<{
    estados: {
        id_estado: number;
        nombre_estado: string;
    }[];
    etnias: {
        id_etnia: number;
        nombre_etnia: string;
    }[];
    profesiones: {
        id_profesion: number;
        nombre_profesion: string;
    }[];
    vacunas: {
        id_vacuna: number;
        nombre_vacuna: string;
        cantidad_dosis: number;
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
/**
 * Valida la existencia e integridad jerárquica de `parroquia -> municipio -> estado`.
 */
export declare function validateUbicacionGeografica(ubicacion: {
    estado_id: number;
    municipio_id: number;
    parroquia_id: number;
}): Promise<void>;
