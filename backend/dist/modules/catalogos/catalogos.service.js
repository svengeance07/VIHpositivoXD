import { and, asc, eq } from 'drizzle-orm';
import { BadRequestError, ConflictError, NotFoundError, } from '../../common/errors.js';
import { db, estados, etnias, examenes, municipios, parroquias, profesiones, sintomasComunes, vacunas, } from '../../db/index.js';
export async function listEstados() {
    return db
        .select({
        id_estado: estados.id_estado,
        nombre_estado: estados.nombre_estado,
    })
        .from(estados)
        .orderBy(asc(estados.nombre_estado));
}
export async function listMunicipios(estadoId) {
    const baseQuery = db
        .select({
        id_municipio: municipios.id_municipio,
        nombre_municipio: municipios.nombre_municipio,
        estado_id: municipios.estado_id,
    })
        .from(municipios);
    if (estadoId !== undefined) {
        return baseQuery
            .where(eq(municipios.estado_id, estadoId))
            .orderBy(asc(municipios.nombre_municipio));
    }
    return baseQuery.orderBy(asc(municipios.nombre_municipio));
}
export async function listParroquias(filters = {}) {
    const conditions = [];
    if (filters.estado_id !== undefined) {
        conditions.push(eq(parroquias.estado_id, filters.estado_id));
    }
    if (filters.municipio_id !== undefined) {
        conditions.push(eq(parroquias.municipio_id, filters.municipio_id));
    }
    const baseQuery = db
        .select({
        id_parroquia: parroquias.id_parroquia,
        nombre_parroquia: parroquias.nombre_parroquia,
        municipio_id: parroquias.municipio_id,
        estado_id: parroquias.estado_id,
    })
        .from(parroquias);
    if (conditions.length > 0) {
        return baseQuery
            .where(and(...conditions))
            .orderBy(asc(parroquias.nombre_parroquia));
    }
    return baseQuery.orderBy(asc(parroquias.nombre_parroquia));
}
export async function listEtnias() {
    return db
        .select({
        id_etnia: etnias.id_etnia,
        nombre_etnia: etnias.nombre_etnia,
    })
        .from(etnias)
        .orderBy(asc(etnias.nombre_etnia));
}
export async function listProfesiones() {
    return db
        .select({
        id_profesion: profesiones.id_profesion,
        nombre_profesion: profesiones.nombre_profesion,
    })
        .from(profesiones)
        .orderBy(asc(profesiones.nombre_profesion));
}
export async function listVacunas() {
    return db
        .select({
        id_vacuna: vacunas.id_vacuna,
        nombre_vacuna: vacunas.nombre_vacuna,
        cantidad_dosis: vacunas.cantidad_dosis,
    })
        .from(vacunas)
        .orderBy(asc(vacunas.nombre_vacuna));
}
export async function getVacunaById(idVacuna) {
    const rows = await db
        .select({
        id_vacuna: vacunas.id_vacuna,
        nombre_vacuna: vacunas.nombre_vacuna,
        cantidad_dosis: vacunas.cantidad_dosis,
    })
        .from(vacunas)
        .where(eq(vacunas.id_vacuna, idVacuna))
        .limit(1);
    const vacuna = rows[0];
    if (!vacuna) {
        throw new NotFoundError(`La vacuna con ID ${idVacuna} no existe.`);
    }
    return vacuna;
}
export async function createVacuna(input) {
    const existentes = await db
        .select({ id_vacuna: vacunas.id_vacuna })
        .from(vacunas)
        .where(eq(vacunas.nombre_vacuna, input.nombre_vacuna))
        .limit(1);
    if (existentes[0]) {
        throw new ConflictError(`Ya existe una vacuna registrada con el nombre "${input.nombre_vacuna}".`);
    }
    const [created] = await db
        .insert(vacunas)
        .values({
        nombre_vacuna: input.nombre_vacuna,
        cantidad_dosis: input.cantidad_dosis,
    })
        .$returningId();
    if (!created) {
        throw new Error('No se pudo obtener el identificador de la vacuna creada.');
    }
    return getVacunaById(created.id_vacuna);
}
export async function updateVacuna(idVacuna, input) {
    await getVacunaById(idVacuna);
    if (input.nombre_vacuna !== undefined) {
        const duplicada = await db
            .select({ id_vacuna: vacunas.id_vacuna })
            .from(vacunas)
            .where(eq(vacunas.nombre_vacuna, input.nombre_vacuna))
            .limit(1);
        if (duplicada[0] && duplicada[0].id_vacuna !== idVacuna) {
            throw new ConflictError(`Ya existe otra vacuna registrada con el nombre "${input.nombre_vacuna}".`);
        }
    }
    await db
        .update(vacunas)
        .set({
        ...(input.nombre_vacuna !== undefined
            ? { nombre_vacuna: input.nombre_vacuna }
            : {}),
        ...(input.cantidad_dosis !== undefined
            ? { cantidad_dosis: input.cantidad_dosis }
            : {}),
    })
        .where(eq(vacunas.id_vacuna, idVacuna));
    return getVacunaById(idVacuna);
}
export async function listSintomasComunes() {
    return db
        .select({
        id_sintoma: sintomasComunes.id_sintoma,
        descripcion_sintoma: sintomasComunes.descripcion_sintoma,
    })
        .from(sintomasComunes)
        .orderBy(asc(sintomasComunes.id_sintoma));
}
export async function createSintomaComun(input) {
    const existentes = await db
        .select({ id_sintoma: sintomasComunes.id_sintoma })
        .from(sintomasComunes)
        .where(eq(sintomasComunes.descripcion_sintoma, input.descripcion_sintoma))
        .limit(1);
    if (existentes[0]) {
        throw new ConflictError(`Ya existe un síntoma común registrado como "${input.descripcion_sintoma}".`);
    }
    const [created] = await db
        .insert(sintomasComunes)
        .values({
        descripcion_sintoma: input.descripcion_sintoma,
    })
        .$returningId();
    if (!created) {
        throw new Error('No se pudo obtener el identificador del síntoma creado.');
    }
    const rows = await db
        .select({
        id_sintoma: sintomasComunes.id_sintoma,
        descripcion_sintoma: sintomasComunes.descripcion_sintoma,
    })
        .from(sintomasComunes)
        .where(eq(sintomasComunes.id_sintoma, created.id_sintoma))
        .limit(1);
    const sintoma = rows[0];
    if (!sintoma) {
        throw new NotFoundError('El síntoma recién creado no pudo recuperarse.');
    }
    return sintoma;
}
export async function listExamenes() {
    return db
        .select({
        id_examenes: examenes.id_examenes,
        nombre_examen: examenes.nombre_examen,
    })
        .from(examenes)
        .orderBy(asc(examenes.nombre_examen));
}
export async function createExamen(input) {
    const existentes = await db
        .select({ id_examenes: examenes.id_examenes })
        .from(examenes)
        .where(eq(examenes.nombre_examen, input.nombre_examen))
        .limit(1);
    if (existentes[0]) {
        throw new ConflictError(`Ya existe un examen registrado con el nombre "${input.nombre_examen}".`);
    }
    const [created] = await db
        .insert(examenes)
        .values({
        nombre_examen: input.nombre_examen,
    })
        .$returningId();
    if (!created) {
        throw new Error('No se pudo obtener el identificador del examen creado.');
    }
    const rows = await db
        .select({
        id_examenes: examenes.id_examenes,
        nombre_examen: examenes.nombre_examen,
    })
        .from(examenes)
        .where(eq(examenes.id_examenes, created.id_examenes))
        .limit(1);
    const examen = rows[0];
    if (!examen) {
        throw new NotFoundError('El examen recién creado no pudo recuperarse.');
    }
    return examen;
}
export async function getCatalogosResumen() {
    const [estadosList, etniasList, profesionesList, vacunasList, sintomasList, examenesList,] = await Promise.all([
        listEstados(),
        listEtnias(),
        listProfesiones(),
        listVacunas(),
        listSintomasComunes(),
        listExamenes(),
    ]);
    return {
        estados: estadosList,
        etnias: etniasList,
        profesiones: profesionesList,
        vacunas: vacunasList,
        sintomas_comunes: sintomasList,
        examenes: examenesList,
    };
}
/**
 * Valida la existencia e integridad jerárquica de `parroquia -> municipio -> estado`.
 */
export async function validateUbicacionGeografica(ubicacion) {
    const [estadoRows, municipioRows, parroquiaRows] = await Promise.all([
        db
            .select({ id_estado: estados.id_estado })
            .from(estados)
            .where(eq(estados.id_estado, ubicacion.estado_id))
            .limit(1),
        db
            .select({
            id_municipio: municipios.id_municipio,
            estado_id: municipios.estado_id,
        })
            .from(municipios)
            .where(eq(municipios.id_municipio, ubicacion.municipio_id))
            .limit(1),
        db
            .select({
            id_parroquia: parroquias.id_parroquia,
            municipio_id: parroquias.municipio_id,
            estado_id: parroquias.estado_id,
        })
            .from(parroquias)
            .where(eq(parroquias.id_parroquia, ubicacion.parroquia_id))
            .limit(1),
    ]);
    const estado = estadoRows[0];
    if (!estado) {
        throw new NotFoundError(`El estado con ID ${ubicacion.estado_id} no existe.`);
    }
    const municipio = municipioRows[0];
    if (!municipio) {
        throw new NotFoundError(`El municipio con ID ${ubicacion.municipio_id} no existe.`);
    }
    if (municipio.estado_id !== ubicacion.estado_id) {
        throw new BadRequestError('El municipio seleccionado no pertenece al estado especificado.');
    }
    const parroquia = parroquiaRows[0];
    if (!parroquia) {
        throw new NotFoundError(`La parroquia con ID ${ubicacion.parroquia_id} no existe.`);
    }
    if (parroquia.municipio_id !== ubicacion.municipio_id) {
        throw new BadRequestError('La parroquia seleccionada no pertenece al municipio especificado.');
    }
    if (parroquia.estado_id !== ubicacion.estado_id) {
        throw new BadRequestError('La parroquia seleccionada no pertenece al estado especificado.');
    }
}
//# sourceMappingURL=catalogos.service.js.map