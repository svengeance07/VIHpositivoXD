import { and, asc, eq, isNull, like, or, } from 'drizzle-orm';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, } from '../../common/errors.js';
import { autoridades, centroSalud, db, estados, municipios, parroquias, profesiones, subregion, usuarios, } from '../../db/index.js';
import { assertCentroScope, assertSubregionScope, hashPassword, requireAssignedCentro, requireAssignedSubregion, } from '../auth/index.js';
import { validateUbicacionGeografica } from '../catalogos/index.js';
function sanitizeSearchPattern(term) {
    const escaped = term.replace(/[%_\\]/g, (ch) => `\\${ch}`);
    return `%${escaped}%`;
}
async function assertProfesionExists(profesionId) {
    const rows = await db
        .select({ id_profesion: profesiones.id_profesion })
        .from(profesiones)
        .where(eq(profesiones.id_profesion, profesionId))
        .limit(1);
    if (!rows[0]) {
        throw new NotFoundError(`La profesión con ID ${profesionId} no existe.`);
    }
}
async function assertAutoridadAssignableAsJefe(autoridadId, targetKind, currentEntityId) {
    const rows = await db
        .select({
        id_autoridades: autoridades.id_autoridades,
        usuario_id: autoridades.usuario_id,
        tipo_usuario: usuarios.tipo_usuario,
        id_centro: centroSalud.id_centro,
        id_subregion: subregion.id_subregion,
    })
        .from(autoridades)
        .leftJoin(usuarios, eq(usuarios.id_usuarios, autoridades.usuario_id))
        .leftJoin(centroSalud, eq(centroSalud.id_jefe_centro, autoridades.id_autoridades))
        .leftJoin(subregion, eq(subregion.id_jefe_subregion, autoridades.id_autoridades))
        .where(eq(autoridades.id_autoridades, autoridadId))
        .limit(1);
    const row = rows[0];
    if (!row) {
        throw new NotFoundError(`La autoridad con ID ${autoridadId} no existe.`);
    }
    if (targetKind === 'centro') {
        if (row.tipo_usuario && row.tipo_usuario !== 'centro_salud_jefe') {
            throw new BadRequestError('La autoridad seleccionada no posee una cuenta con rol centro_salud_jefe.');
        }
        if (row.id_centro !== null && row.id_centro !== currentEntityId) {
            throw new ConflictError('La autoridad seleccionada ya está asignada como jefe de otro centro de salud.');
        }
        if (row.id_subregion !== null) {
            throw new ConflictError('La autoridad seleccionada ya dirige una subregión de salud.');
        }
        return;
    }
    if (row.tipo_usuario && row.tipo_usuario !== 'subregion') {
        throw new BadRequestError('La autoridad seleccionada no posee una cuenta con rol subregion.');
    }
    if (row.id_subregion !== null && row.id_subregion !== currentEntityId) {
        throw new ConflictError('La autoridad seleccionada ya está asignada como jefe de otra subregión.');
    }
    if (row.id_centro !== null) {
        throw new ConflictError('La autoridad seleccionada ya dirige un centro de salud.');
    }
}
function mapJefeResumen(row) {
    if (row.jefe_id_autoridades === null ||
        row.jefe_primer_nombre === null ||
        row.jefe_segundo_nombre === null ||
        row.jefe_primer_apellido === null ||
        row.jefe_segundo_apellido === null ||
        row.jefe_c_i === null ||
        row.jefe_n_impre === null ||
        row.jefe_telefono === null) {
        return null;
    }
    return {
        id_autoridades: row.jefe_id_autoridades,
        primer_nombre: row.jefe_primer_nombre,
        segundo_nombre: row.jefe_segundo_nombre,
        primer_apellido: row.jefe_primer_apellido,
        segundo_apellido: row.jefe_segundo_apellido,
        c_i: row.jefe_c_i,
        n_impre: row.jefe_n_impre,
        telefono: row.jefe_telefono,
    };
}
function mapCentroRow(row) {
    return {
        id_centro: row.id_centro,
        nombre_centro: row.nombre_centro,
        ubicacion_centro: row.ubicacion_centro,
        codigo_centro: row.codigo_centro,
        id_jefe_centro: row.id_jefe_centro,
        parroquia_id: row.parroquia_id,
        municipio_id: row.municipio_id,
        estado_id: row.estado_id,
        nombre_estado: row.nombre_estado,
        nombre_municipio: row.nombre_municipio,
        nombre_parroquia: row.nombre_parroquia,
        jefe_centro: mapJefeResumen(row),
    };
}
async function queryCentros(conditions) {
    const baseQuery = db
        .select({
        id_centro: centroSalud.id_centro,
        nombre_centro: centroSalud.nombre_centro,
        ubicacion_centro: centroSalud.ubicacion_centro,
        codigo_centro: centroSalud.codigo_centro,
        id_jefe_centro: centroSalud.id_jefe_centro,
        parroquia_id: centroSalud.parroquia_id,
        municipio_id: centroSalud.municipio_id,
        estado_id: centroSalud.estado_id,
        nombre_estado: estados.nombre_estado,
        nombre_municipio: municipios.nombre_municipio,
        nombre_parroquia: parroquias.nombre_parroquia,
        jefe_id_autoridades: autoridades.id_autoridades,
        jefe_primer_nombre: autoridades.primer_nombre,
        jefe_segundo_nombre: autoridades.segundo_nombre,
        jefe_primer_apellido: autoridades.primer_apellido,
        jefe_segundo_apellido: autoridades.segundo_apellido,
        jefe_c_i: autoridades.c_i,
        jefe_n_impre: autoridades.n_impre,
        jefe_telefono: autoridades.telefono,
    })
        .from(centroSalud)
        .leftJoin(estados, eq(estados.id_estado, centroSalud.estado_id))
        .leftJoin(municipios, eq(municipios.id_municipio, centroSalud.municipio_id))
        .leftJoin(parroquias, eq(parroquias.id_parroquia, centroSalud.parroquia_id))
        .leftJoin(autoridades, eq(autoridades.id_autoridades, centroSalud.id_jefe_centro));
    const rows = conditions.length > 0
        ? await baseQuery
            .where(and(...conditions))
            .orderBy(asc(centroSalud.nombre_centro))
        : await baseQuery.orderBy(asc(centroSalud.nombre_centro));
    return rows.map(mapCentroRow);
}
function assertCentroAccess(user, centro) {
    if (user.tipo_usuario === 'master') {
        return;
    }
    if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null || centro.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para acceder a centros de salud fuera de tu estado.');
        }
        return;
    }
    assertCentroScope(user, centro.id_centro);
}
export async function listCentrosSalud(user, filters = {}) {
    const conditions = [];
    if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null) {
            throw new ForbiddenError('La subregión autenticada no tiene un estado asignado.');
        }
        if (filters.estado_id !== undefined &&
            filters.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para consultar centros de otro estado.');
        }
        conditions.push(eq(centroSalud.estado_id, user.estado_id));
    }
    else if (user.tipo_usuario === 'centro_salud_jefe') {
        const assignedCentroId = requireAssignedCentro(user);
        conditions.push(eq(centroSalud.id_centro, assignedCentroId));
    }
    else if (filters.estado_id !== undefined) {
        conditions.push(eq(centroSalud.estado_id, filters.estado_id));
    }
    if (filters.municipio_id !== undefined) {
        conditions.push(eq(centroSalud.municipio_id, filters.municipio_id));
    }
    if (filters.parroquia_id !== undefined) {
        conditions.push(eq(centroSalud.parroquia_id, filters.parroquia_id));
    }
    if (filters.search) {
        const pattern = sanitizeSearchPattern(filters.search);
        const searchCondition = or(like(centroSalud.nombre_centro, pattern), like(centroSalud.codigo_centro, pattern));
        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }
    return queryCentros(conditions);
}
export async function getCentroSaludById(user, idCentro) {
    const rows = await queryCentros([eq(centroSalud.id_centro, idCentro)]);
    const centro = rows[0];
    if (!centro) {
        throw new NotFoundError(`El centro de salud con ID ${idCentro} no existe.`);
    }
    assertCentroAccess(user, centro);
    return centro;
}
export async function createCentroSalud(user, input) {
    if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null) {
            throw new ForbiddenError('La subregión autenticada no tiene un estado asignado.');
        }
        if (input.estado_id !== user.estado_id) {
            throw new ForbiddenError('Solo puedes registrar centros de salud dentro de tu estado asignado.');
        }
    }
    else if (user.tipo_usuario !== 'master') {
        throw new ForbiddenError('No cuentas con permisos para registrar nuevos centros de salud.');
    }
    await validateUbicacionGeografica({
        estado_id: input.estado_id,
        municipio_id: input.municipio_id,
        parroquia_id: input.parroquia_id,
    });
    const existingCode = await db
        .select({ id_centro: centroSalud.id_centro })
        .from(centroSalud)
        .where(eq(centroSalud.codigo_centro, input.codigo_centro))
        .limit(1);
    if (existingCode[0]) {
        throw new ConflictError(`Ya existe un centro de salud con el código "${input.codigo_centro}".`);
    }
    if (input.id_jefe_centro !== undefined && input.id_jefe_centro !== null) {
        await assertAutoridadAssignableAsJefe(input.id_jefe_centro, 'centro');
    }
    const [created] = await db
        .insert(centroSalud)
        .values({
        nombre_centro: input.nombre_centro,
        ubicacion_centro: input.ubicacion_centro,
        codigo_centro: input.codigo_centro,
        id_jefe_centro: input.id_jefe_centro ?? null,
        parroquia_id: input.parroquia_id,
        municipio_id: input.municipio_id,
        estado_id: input.estado_id,
    })
        .$returningId();
    if (!created) {
        throw new Error('No se pudo obtener el identificador del centro creado.');
    }
    return getCentroSaludById(user, created.id_centro);
}
export async function updateCentroSalud(user, idCentro, input) {
    if (user.tipo_usuario !== 'master' && user.tipo_usuario !== 'subregion') {
        throw new ForbiddenError('No cuentas con permisos para modificar centros de salud.');
    }
    const existing = await getCentroSaludById(user, idCentro);
    if (user.tipo_usuario === 'subregion' &&
        input.estado_id !== undefined &&
        input.estado_id !== user.estado_id) {
        throw new ForbiddenError('No puedes reasignar un centro de salud a otro estado.');
    }
    if (input.estado_id !== undefined ||
        input.municipio_id !== undefined ||
        input.parroquia_id !== undefined) {
        const estadoId = input.estado_id ?? existing.estado_id;
        const municipioId = input.municipio_id ?? existing.municipio_id;
        const parroquiaId = input.parroquia_id ?? existing.parroquia_id;
        if (estadoId === null || municipioId === null || parroquiaId === null) {
            throw new BadRequestError('Debe especificar estado_id, municipio_id y parroquia_id completos.');
        }
        await validateUbicacionGeografica({
            estado_id: estadoId,
            municipio_id: municipioId,
            parroquia_id: parroquiaId,
        });
    }
    if (input.codigo_centro !== undefined) {
        const existingCode = await db
            .select({ id_centro: centroSalud.id_centro })
            .from(centroSalud)
            .where(eq(centroSalud.codigo_centro, input.codigo_centro))
            .limit(1);
        if (existingCode[0] && existingCode[0].id_centro !== idCentro) {
            throw new ConflictError(`Ya existe otro centro de salud con el código "${input.codigo_centro}".`);
        }
    }
    if (input.id_jefe_centro !== undefined && input.id_jefe_centro !== null) {
        await assertAutoridadAssignableAsJefe(input.id_jefe_centro, 'centro', idCentro);
    }
    await db
        .update(centroSalud)
        .set({
        ...(input.nombre_centro !== undefined
            ? { nombre_centro: input.nombre_centro }
            : {}),
        ...(input.ubicacion_centro !== undefined
            ? { ubicacion_centro: input.ubicacion_centro }
            : {}),
        ...(input.codigo_centro !== undefined
            ? { codigo_centro: input.codigo_centro }
            : {}),
        ...(input.id_jefe_centro !== undefined
            ? { id_jefe_centro: input.id_jefe_centro }
            : {}),
        ...(input.parroquia_id !== undefined
            ? { parroquia_id: input.parroquia_id }
            : {}),
        ...(input.municipio_id !== undefined
            ? { municipio_id: input.municipio_id }
            : {}),
        ...(input.estado_id !== undefined ? { estado_id: input.estado_id } : {}),
    })
        .where(eq(centroSalud.id_centro, idCentro));
    return getCentroSaludById(user, idCentro);
}
function mapSubregionRow(row) {
    return {
        id_subregion: row.id_subregion,
        ubicacion: row.ubicacion,
        parroquia_id: row.parroquia_id,
        municipio_id: row.municipio_id,
        estado_id: row.estado_id,
        id_jefe_subregion: row.id_jefe_subregion,
        nombre_estado: row.nombre_estado,
        nombre_municipio: row.nombre_municipio,
        nombre_parroquia: row.nombre_parroquia,
        jefe_subregion: mapJefeResumen(row),
    };
}
async function querySubregiones(conditions) {
    const baseQuery = db
        .select({
        id_subregion: subregion.id_subregion,
        ubicacion: subregion.ubicacion,
        parroquia_id: subregion.parroquia_id,
        municipio_id: subregion.municipio_id,
        estado_id: subregion.estado_id,
        id_jefe_subregion: subregion.id_jefe_subregion,
        nombre_estado: estados.nombre_estado,
        nombre_municipio: municipios.nombre_municipio,
        nombre_parroquia: parroquias.nombre_parroquia,
        jefe_id_autoridades: autoridades.id_autoridades,
        jefe_primer_nombre: autoridades.primer_nombre,
        jefe_segundo_nombre: autoridades.segundo_nombre,
        jefe_primer_apellido: autoridades.primer_apellido,
        jefe_segundo_apellido: autoridades.segundo_apellido,
        jefe_c_i: autoridades.c_i,
        jefe_n_impre: autoridades.n_impre,
        jefe_telefono: autoridades.telefono,
    })
        .from(subregion)
        .leftJoin(estados, eq(estados.id_estado, subregion.estado_id))
        .leftJoin(municipios, eq(municipios.id_municipio, subregion.municipio_id))
        .leftJoin(parroquias, eq(parroquias.id_parroquia, subregion.parroquia_id))
        .leftJoin(autoridades, eq(autoridades.id_autoridades, subregion.id_jefe_subregion));
    const rows = conditions.length > 0
        ? await baseQuery
            .where(and(...conditions))
            .orderBy(asc(subregion.id_subregion))
        : await baseQuery.orderBy(asc(subregion.id_subregion));
    return rows.map(mapSubregionRow);
}
export async function listSubregiones(user, filters = {}) {
    const conditions = [];
    if (user.tipo_usuario === 'subregion') {
        const assignedSubregionId = requireAssignedSubregion(user);
        if (filters.estado_id !== undefined &&
            user.estado_id !== null &&
            filters.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para consultar subregiones de otro estado.');
        }
        conditions.push(eq(subregion.id_subregion, assignedSubregionId));
    }
    else if (user.tipo_usuario === 'centro_salud_jefe') {
        if (user.estado_id === null) {
            throw new ForbiddenError('El centro de salud autenticado no tiene un estado asociado.');
        }
        if (filters.estado_id !== undefined &&
            filters.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para consultar subregiones de otro estado.');
        }
        conditions.push(eq(subregion.estado_id, user.estado_id));
    }
    else if (filters.estado_id !== undefined) {
        conditions.push(eq(subregion.estado_id, filters.estado_id));
    }
    return querySubregiones(conditions);
}
export async function getSubregionById(user, idSubregion) {
    const rows = await querySubregiones([
        eq(subregion.id_subregion, idSubregion),
    ]);
    const item = rows[0];
    if (!item) {
        throw new NotFoundError(`La subregión con ID ${idSubregion} no existe.`);
    }
    if (user.tipo_usuario === 'subregion') {
        assertSubregionScope(user, item.id_subregion);
    }
    else if (user.tipo_usuario === 'centro_salud_jefe') {
        if (user.estado_id === null || item.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para acceder a una subregión fuera de tu estado.');
        }
    }
    return item;
}
export async function createSubregion(input) {
    await validateUbicacionGeografica({
        estado_id: input.estado_id,
        municipio_id: input.municipio_id,
        parroquia_id: input.parroquia_id,
    });
    if (input.id_jefe_subregion !== undefined &&
        input.id_jefe_subregion !== null) {
        await assertAutoridadAssignableAsJefe(input.id_jefe_subregion, 'subregion');
    }
    const [created] = await db
        .insert(subregion)
        .values({
        ubicacion: input.ubicacion,
        parroquia_id: input.parroquia_id,
        municipio_id: input.municipio_id,
        estado_id: input.estado_id,
        id_jefe_subregion: input.id_jefe_subregion ?? null,
    })
        .$returningId();
    if (!created) {
        throw new Error('No se pudo obtener el identificador de la subregión creada.');
    }
    const rows = await querySubregiones([
        eq(subregion.id_subregion, created.id_subregion),
    ]);
    const createdRow = rows[0];
    if (!createdRow) {
        throw new NotFoundError('La subregión recién creada no pudo recuperarse.');
    }
    return createdRow;
}
export async function updateSubregion(idSubregion, input) {
    const existingRows = await querySubregiones([
        eq(subregion.id_subregion, idSubregion),
    ]);
    const existing = existingRows[0];
    if (!existing) {
        throw new NotFoundError(`La subregión con ID ${idSubregion} no existe.`);
    }
    if (input.estado_id !== undefined ||
        input.municipio_id !== undefined ||
        input.parroquia_id !== undefined) {
        const estadoId = input.estado_id ?? existing.estado_id;
        const municipioId = input.municipio_id ?? existing.municipio_id;
        const parroquiaId = input.parroquia_id ?? existing.parroquia_id;
        if (estadoId === null || municipioId === null || parroquiaId === null) {
            throw new BadRequestError('Debe especificar estado_id, municipio_id y parroquia_id completos.');
        }
        await validateUbicacionGeografica({
            estado_id: estadoId,
            municipio_id: municipioId,
            parroquia_id: parroquiaId,
        });
    }
    if (input.id_jefe_subregion !== undefined &&
        input.id_jefe_subregion !== null) {
        await assertAutoridadAssignableAsJefe(input.id_jefe_subregion, 'subregion', idSubregion);
    }
    await db
        .update(subregion)
        .set({
        ...(input.ubicacion !== undefined ? { ubicacion: input.ubicacion } : {}),
        ...(input.parroquia_id !== undefined
            ? { parroquia_id: input.parroquia_id }
            : {}),
        ...(input.municipio_id !== undefined
            ? { municipio_id: input.municipio_id }
            : {}),
        ...(input.estado_id !== undefined ? { estado_id: input.estado_id } : {}),
        ...(input.id_jefe_subregion !== undefined
            ? { id_jefe_subregion: input.id_jefe_subregion }
            : {}),
    })
        .where(eq(subregion.id_subregion, idSubregion));
    const updatedRows = await querySubregiones([
        eq(subregion.id_subregion, idSubregion),
    ]);
    const updated = updatedRows[0];
    if (!updated) {
        throw new NotFoundError(`La subregión con ID ${idSubregion} no existe.`);
    }
    return updated;
}
async function queryAutoridades(conditions) {
    const baseQuery = db
        .select({
        id_autoridades: autoridades.id_autoridades,
        primer_nombre: autoridades.primer_nombre,
        segundo_nombre: autoridades.segundo_nombre,
        primer_apellido: autoridades.primer_apellido,
        segundo_apellido: autoridades.segundo_apellido,
        c_i: autoridades.c_i,
        n_impre: autoridades.n_impre,
        domicilio: autoridades.domicilio,
        telefono: autoridades.telefono,
        usuario_id: autoridades.usuario_id,
        profesion_id: autoridades.profesion_id,
        nombre_profesion: profesiones.nombre_profesion,
        correo_usuario: usuarios.correo_usuario,
        tipo_usuario: usuarios.tipo_usuario,
        id_centro_asignado: centroSalud.id_centro,
        id_subregion_asignada: subregion.id_subregion,
        centro_estado_id: centroSalud.estado_id,
    })
        .from(autoridades)
        .leftJoin(profesiones, eq(profesiones.id_profesion, autoridades.profesion_id))
        .leftJoin(usuarios, eq(usuarios.id_usuarios, autoridades.usuario_id))
        .leftJoin(centroSalud, eq(centroSalud.id_jefe_centro, autoridades.id_autoridades))
        .leftJoin(subregion, eq(subregion.id_jefe_subregion, autoridades.id_autoridades));
    return conditions.length > 0
        ? baseQuery
            .where(and(...conditions))
            .orderBy(asc(autoridades.primer_apellido), asc(autoridades.primer_nombre))
        : baseQuery.orderBy(asc(autoridades.primer_apellido), asc(autoridades.primer_nombre));
}
function stripAutoridadMeta(row) {
    const { centro_estado_id: _centroEstadoId, ...detalle } = row;
    return detalle;
}
function canSubregionManageAutoridad(user, row) {
    if (user.id_autoridades !== null && row.id_autoridades === user.id_autoridades) {
        return true;
    }
    if (user.estado_id !== null && row.centro_estado_id === user.estado_id) {
        return true;
    }
    const isUnassigned = row.id_centro_asignado === null && row.id_subregion_asignada === null;
    const isCompatibleAccount = row.tipo_usuario === null || row.tipo_usuario === 'centro_salud_jefe';
    return isUnassigned && isCompatibleAccount;
}
function buildSubregionAutoridadFilter(user) {
    const unassignedCondition = and(isNull(centroSalud.id_centro), isNull(subregion.id_subregion), or(isNull(usuarios.tipo_usuario), eq(usuarios.tipo_usuario, 'centro_salud_jefe')));
    const scopes = [];
    if (user.id_autoridades !== null) {
        scopes.push(eq(autoridades.id_autoridades, user.id_autoridades));
    }
    if (user.estado_id !== null) {
        scopes.push(eq(centroSalud.estado_id, user.estado_id));
    }
    if (unassignedCondition) {
        scopes.push(unassignedCondition);
    }
    const combined = or(...scopes);
    if (!combined) {
        throw new ForbiddenError('No fue posible resolver el alcance de la subregión.');
    }
    return combined;
}
export async function listAutoridades(user, filters = {}) {
    const conditions = [];
    if (user.tipo_usuario === 'centro_salud_jefe') {
        if (user.id_autoridades === null) {
            return [];
        }
        conditions.push(eq(autoridades.id_autoridades, user.id_autoridades));
    }
    else if (user.tipo_usuario === 'subregion') {
        conditions.push(buildSubregionAutoridadFilter(user));
    }
    if (filters.c_i !== undefined) {
        conditions.push(eq(autoridades.c_i, filters.c_i));
    }
    if (filters.search) {
        const pattern = sanitizeSearchPattern(filters.search);
        const searchCondition = or(like(autoridades.primer_nombre, pattern), like(autoridades.segundo_nombre, pattern), like(autoridades.primer_apellido, pattern), like(autoridades.segundo_apellido, pattern));
        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }
    const rows = await queryAutoridades(conditions);
    return rows.map(stripAutoridadMeta);
}
export async function getAutoridadById(user, idAutoridades) {
    const rows = await queryAutoridades([
        eq(autoridades.id_autoridades, idAutoridades),
    ]);
    const row = rows[0];
    if (!row) {
        throw new NotFoundError(`La autoridad con ID ${idAutoridades} no existe.`);
    }
    if (user.tipo_usuario === 'centro_salud_jefe') {
        if (user.id_autoridades !== row.id_autoridades) {
            throw new ForbiddenError('No tienes autorización para consultar el perfil de otra autoridad.');
        }
    }
    else if (user.tipo_usuario === 'subregion') {
        if (!canSubregionManageAutoridad(user, row)) {
            throw new ForbiddenError('No tienes autorización para acceder a esta autoridad.');
        }
    }
    return stripAutoridadMeta(row);
}
export async function createAutoridad(user, input) {
    if (user.tipo_usuario !== 'master' && user.tipo_usuario !== 'subregion') {
        throw new ForbiddenError('No cuentas con permisos para registrar autoridades sanitarias.');
    }
    if (user.tipo_usuario === 'subregion' &&
        input.cuenta_usuario &&
        input.cuenta_usuario.tipo_usuario !== 'centro_salud_jefe') {
        throw new ForbiddenError('Una subregión únicamente puede crear cuentas de acceso con rol centro_salud_jefe.');
    }
    await assertProfesionExists(input.profesion_id);
    const existingCi = await db
        .select({ id_autoridades: autoridades.id_autoridades })
        .from(autoridades)
        .where(eq(autoridades.c_i, input.c_i))
        .limit(1);
    if (existingCi[0]) {
        throw new ConflictError(`Ya existe una autoridad registrada con la cédula ${input.c_i}.`);
    }
    let hashedPassword = null;
    if (input.cuenta_usuario) {
        const existingEmail = await db
            .select({ id_usuarios: usuarios.id_usuarios })
            .from(usuarios)
            .where(eq(usuarios.correo_usuario, input.cuenta_usuario.correo_usuario))
            .limit(1);
        if (existingEmail[0]) {
            throw new ConflictError(`El correo "${input.cuenta_usuario.correo_usuario}" ya está registrado en usuarios.`);
        }
        hashedPassword = await hashPassword(input.cuenta_usuario.contrasena);
    }
    else if (input.usuario_id !== undefined && input.usuario_id !== null) {
        const userRows = await db
            .select({
            id_usuarios: usuarios.id_usuarios,
            tipo_usuario: usuarios.tipo_usuario,
        })
            .from(usuarios)
            .where(eq(usuarios.id_usuarios, input.usuario_id))
            .limit(1);
        const targetUser = userRows[0];
        if (!targetUser) {
            throw new NotFoundError(`El usuario con ID ${input.usuario_id} no existe.`);
        }
        if (user.tipo_usuario === 'subregion' &&
            targetUser.tipo_usuario !== 'centro_salud_jefe') {
            throw new ForbiddenError('Una subregión solo puede vincular cuentas con rol centro_salud_jefe.');
        }
        const linkedAutoridad = await db
            .select({ id_autoridades: autoridades.id_autoridades })
            .from(autoridades)
            .where(eq(autoridades.usuario_id, input.usuario_id))
            .limit(1);
        if (linkedAutoridad[0]) {
            throw new ConflictError(`El usuario con ID ${input.usuario_id} ya se encuentra vinculado a otra autoridad.`);
        }
    }
    const createdAutoridadId = await db.transaction(async (tx) => {
        let resolvedUserId = input.usuario_id ?? null;
        if (input.cuenta_usuario && hashedPassword !== null) {
            const [createdUser] = await tx
                .insert(usuarios)
                .values({
                correo_usuario: input.cuenta_usuario.correo_usuario,
                contrasena: hashedPassword,
                tipo_usuario: input.cuenta_usuario.tipo_usuario,
            })
                .$returningId();
            if (!createdUser) {
                throw new Error('No se pudo obtener el identificador del usuario creado.');
            }
            resolvedUserId = createdUser.id_usuarios;
        }
        const [createdAutoridad] = await tx
            .insert(autoridades)
            .values({
            primer_nombre: input.primer_nombre,
            segundo_nombre: input.segundo_nombre,
            primer_apellido: input.primer_apellido,
            segundo_apellido: input.segundo_apellido,
            c_i: input.c_i,
            n_impre: input.n_impre,
            domicilio: input.domicilio ?? null,
            telefono: input.telefono,
            usuario_id: resolvedUserId,
            profesion_id: input.profesion_id,
        })
            .$returningId();
        if (!createdAutoridad) {
            throw new Error('No se pudo obtener el identificador de la autoridad creada.');
        }
        return createdAutoridad.id_autoridades;
    });
    return getAutoridadById(user, createdAutoridadId);
}
export async function updateAutoridad(user, idAutoridades, input) {
    if (user.tipo_usuario !== 'master' && user.tipo_usuario !== 'subregion') {
        throw new ForbiddenError('No cuentas con permisos para actualizar autoridades.');
    }
    const rows = await queryAutoridades([
        eq(autoridades.id_autoridades, idAutoridades),
    ]);
    const existing = rows[0];
    if (!existing) {
        throw new NotFoundError(`La autoridad con ID ${idAutoridades} no existe.`);
    }
    if (user.tipo_usuario === 'subregion' &&
        !canSubregionManageAutoridad(user, existing)) {
        throw new ForbiddenError('No tienes autorización para modificar esta autoridad.');
    }
    if (input.profesion_id !== undefined) {
        await assertProfesionExists(input.profesion_id);
    }
    if (input.c_i !== undefined) {
        const existingCi = await db
            .select({ id_autoridades: autoridades.id_autoridades })
            .from(autoridades)
            .where(eq(autoridades.c_i, input.c_i))
            .limit(1);
        if (existingCi[0] && existingCi[0].id_autoridades !== idAutoridades) {
            throw new ConflictError(`Ya existe otra autoridad registrada con la cédula ${input.c_i}.`);
        }
    }
    await db
        .update(autoridades)
        .set({
        ...(input.primer_nombre !== undefined
            ? { primer_nombre: input.primer_nombre }
            : {}),
        ...(input.segundo_nombre !== undefined
            ? { segundo_nombre: input.segundo_nombre }
            : {}),
        ...(input.primer_apellido !== undefined
            ? { primer_apellido: input.primer_apellido }
            : {}),
        ...(input.segundo_apellido !== undefined
            ? { segundo_apellido: input.segundo_apellido }
            : {}),
        ...(input.c_i !== undefined ? { c_i: input.c_i } : {}),
        ...(input.n_impre !== undefined ? { n_impre: input.n_impre } : {}),
        ...(input.domicilio !== undefined ? { domicilio: input.domicilio } : {}),
        ...(input.telefono !== undefined ? { telefono: input.telefono } : {}),
        ...(input.profesion_id !== undefined
            ? { profesion_id: input.profesion_id }
            : {}),
    })
        .where(eq(autoridades.id_autoridades, idAutoridades));
    return getAutoridadById(user, idAutoridades);
}
//# sourceMappingURL=centros.service.js.map