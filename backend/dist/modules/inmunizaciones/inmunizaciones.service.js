import { and, asc, desc, eq, gte, like, lte, } from 'drizzle-orm';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnprocessableEntityError, } from '../../common/errors.js';
import { centroSalud, ciudadanoMayorEdad, ciudadanoMenorEdad, db, inmunizacion, vacunas, } from '../../db/index.js';
import { assertCentroScope, requireAssignedCentro, } from '../auth/index.js';
import { getCiudadanoMayorByCedula } from '../ciudadanos/index.js';
import { getTodayIsoUtc, } from './inmunizaciones.schemas.js';
function sanitizeSearchPattern(term) {
    const escaped = term.replace(/[%_\\]/g, (ch) => `\\${ch}`);
    return `%${escaped}%`;
}
function mapInmunizacionRow(row) {
    const vacuna = row.vac_id !== null &&
        row.vac_nombre !== null &&
        row.vac_cantidad_dosis !== null
        ? {
            id_vacuna: row.vac_id,
            nombre_vacuna: row.vac_nombre,
            cantidad_dosis: row.vac_cantidad_dosis,
        }
        : null;
    const centro = row.cs_id !== null && row.cs_nombre !== null && row.cs_codigo !== null
        ? {
            id_centro: row.cs_id,
            nombre_centro: row.cs_nombre,
            codigo_centro: row.cs_codigo,
            estado_id: row.cs_estado_id,
        }
        : null;
    const ciudadanoMayor = row.cm_id !== null &&
        row.cm_primer_nombre !== null &&
        row.cm_primer_apellido !== null &&
        row.cm_c_i !== null
        ? {
            id_ciudadano: row.cm_id,
            primer_nombre: row.cm_primer_nombre,
            segundo_nombre: row.cm_segundo_nombre,
            primer_apellido: row.cm_primer_apellido,
            segundo_apellido: row.cm_segundo_apellido,
            c_i: row.cm_c_i,
        }
        : null;
    const ciudadanoMenor = row.cmen_id !== null &&
        row.cmen_primer_nombre !== null &&
        row.cmen_primer_apellido !== null
        ? {
            id_menor: row.cmen_id,
            primer_nombre: row.cmen_primer_nombre,
            segundo_nombre: row.cmen_segundo_nombre,
            primer_apellido: row.cmen_primer_apellido,
            segundo_apellido: row.cmen_segundo_apellido,
            padre_id: row.cmen_padre_id,
        }
        : null;
    return {
        id_inmunizacion: row.id_inmunizacion,
        numero_dosis: row.numero_dosis,
        fecha_aplicacion: row.fecha_aplicacion,
        numero_lote: row.numero_lote,
        observaciones: row.observaciones,
        centro_salud_aplicacion: row.centro_salud_aplicacion,
        vacuna_id: row.vacuna_id,
        ciudadano_mayor_edad_id: row.ciudadano_mayor_edad_id,
        ciudadano_mayor_menor_id: row.ciudadano_mayor_menor_id,
        vacuna,
        centro_salud: centro,
        ciudadano_mayor: ciudadanoMayor,
        ciudadano_menor: ciudadanoMenor,
    };
}
export async function queryInmunizaciones(conditions, options) {
    const baseQuery = db
        .select({
        id_inmunizacion: inmunizacion.id_inmunizacion,
        numero_dosis: inmunizacion.numero_dosis,
        fecha_aplicacion: inmunizacion.fecha_aplicacion,
        numero_lote: inmunizacion.numero_lote,
        observaciones: inmunizacion.observaciones,
        centro_salud_aplicacion: inmunizacion.centro_salud_aplicacion,
        vacuna_id: inmunizacion.vacuna_id,
        ciudadano_mayor_edad_id: inmunizacion.ciudadano_mayor_edad_id,
        ciudadano_mayor_menor_id: inmunizacion.ciudadano_mayor_menor_id,
        vac_id: vacunas.id_vacuna,
        vac_nombre: vacunas.nombre_vacuna,
        vac_cantidad_dosis: vacunas.cantidad_dosis,
        cs_id: centroSalud.id_centro,
        cs_nombre: centroSalud.nombre_centro,
        cs_codigo: centroSalud.codigo_centro,
        cs_estado_id: centroSalud.estado_id,
        cm_id: ciudadanoMayorEdad.id_ciudadano,
        cm_primer_nombre: ciudadanoMayorEdad.primer_nombre,
        cm_segundo_nombre: ciudadanoMayorEdad.segundo_nombre,
        cm_primer_apellido: ciudadanoMayorEdad.primer_apellido,
        cm_segundo_apellido: ciudadanoMayorEdad.segundo_apellido,
        cm_c_i: ciudadanoMayorEdad.c_i,
        cmen_id: ciudadanoMenorEdad.id_menor,
        cmen_primer_nombre: ciudadanoMenorEdad.primer_nombre,
        cmen_segundo_nombre: ciudadanoMenorEdad.segundo_nombre,
        cmen_primer_apellido: ciudadanoMenorEdad.primer_apellido,
        cmen_segundo_apellido: ciudadanoMenorEdad.segundo_apellido,
        cmen_padre_id: ciudadanoMenorEdad.padre_id,
    })
        .from(inmunizacion)
        .leftJoin(vacunas, eq(vacunas.id_vacuna, inmunizacion.vacuna_id))
        .leftJoin(centroSalud, eq(centroSalud.id_centro, inmunizacion.centro_salud_aplicacion))
        .leftJoin(ciudadanoMayorEdad, eq(ciudadanoMayorEdad.id_ciudadano, inmunizacion.ciudadano_mayor_edad_id))
        .leftJoin(ciudadanoMenorEdad, eq(ciudadanoMenorEdad.id_menor, inmunizacion.ciudadano_mayor_menor_id));
    const filtered = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const ordered = options?.order === 'asc_dosis'
        ? filtered.orderBy(asc(inmunizacion.vacuna_id), asc(inmunizacion.numero_dosis), asc(inmunizacion.id_inmunizacion))
        : filtered.orderBy(desc(inmunizacion.fecha_aplicacion), desc(inmunizacion.id_inmunizacion));
    const rows = options?.limit !== undefined
        ? await ordered.limit(options.limit).offset(options.offset ?? 0)
        : await ordered;
    return rows.map(mapInmunizacionRow);
}
function assertInmunizacionRecordScope(user, item) {
    if (user.tipo_usuario === 'master') {
        return;
    }
    if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null ||
            item.centro_salud?.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para acceder a inmunizaciones fuera de tu estado.');
        }
        return;
    }
    if (item.centro_salud_aplicacion === null) {
        throw new ForbiddenError('La inmunización no está asociada a tu centro de salud.');
    }
    assertCentroScope(user, item.centro_salud_aplicacion);
}
function buildCartillaResumen(rows) {
    const grouped = new Map();
    for (const item of rows) {
        if (!item.vacuna) {
            continue;
        }
        const existing = grouped.get(item.vacuna.id_vacuna);
        if (existing) {
            existing.push(item);
        }
        else {
            grouped.set(item.vacuna.id_vacuna, [item]);
        }
    }
    const resumenEsquemas = [];
    for (const [idVacuna, historial] of grouped) {
        const first = historial[0];
        if (!first?.vacuna) {
            continue;
        }
        const sortedHistorial = [...historial].sort((a, b) => a.numero_dosis - b.numero_dosis);
        const distinctDoses = new Set(sortedHistorial.map((h) => h.numero_dosis));
        const dosisAplicadas = distinctDoses.size;
        const requeridas = first.vacuna.cantidad_dosis;
        const esquemaCompleto = dosisAplicadas >= requeridas;
        const maxDose = sortedHistorial.reduce((max, item) => Math.max(max, item.numero_dosis), 0);
        resumenEsquemas.push({
            id_vacuna: idVacuna,
            nombre_vacuna: first.vacuna.nombre_vacuna,
            cantidad_dosis_requeridas: requeridas,
            dosis_aplicadas: dosisAplicadas,
            esquema_completo: esquemaCompleto,
            proxima_dosis: esquemaCompleto
                ? null
                : Math.min(maxDose + 1, requeridas),
            historial: sortedHistorial,
        });
    }
    return {
        resumen_esquemas: resumenEsquemas,
        inmunizaciones: rows,
    };
}
export async function listInmunizaciones(user, filters) {
    const conditions = [];
    if (user.tipo_usuario === 'centro_salud_jefe') {
        const assignedCentro = requireAssignedCentro(user);
        if (filters.centro_salud_aplicacion !== undefined &&
            filters.centro_salud_aplicacion !== assignedCentro) {
            throw new ForbiddenError('No tienes autorización para consultar inmunizaciones de otro centro de salud.');
        }
        if (filters.estado_id !== undefined &&
            user.estado_id !== null &&
            filters.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para consultar inmunizaciones de otro estado.');
        }
        conditions.push(eq(inmunizacion.centro_salud_aplicacion, assignedCentro));
    }
    else if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null) {
            throw new ForbiddenError('La subregión autenticada no tiene un estado asignado.');
        }
        if (filters.estado_id !== undefined &&
            filters.estado_id !== user.estado_id) {
            throw new ForbiddenError('No tienes autorización para consultar inmunizaciones de otro estado.');
        }
        conditions.push(eq(centroSalud.estado_id, user.estado_id));
        if (filters.centro_salud_aplicacion !== undefined) {
            conditions.push(eq(inmunizacion.centro_salud_aplicacion, filters.centro_salud_aplicacion));
        }
    }
    else {
        if (filters.centro_salud_aplicacion !== undefined) {
            conditions.push(eq(inmunizacion.centro_salud_aplicacion, filters.centro_salud_aplicacion));
        }
        if (filters.estado_id !== undefined) {
            conditions.push(eq(centroSalud.estado_id, filters.estado_id));
        }
    }
    if (filters.vacuna_id !== undefined) {
        conditions.push(eq(inmunizacion.vacuna_id, filters.vacuna_id));
    }
    if (filters.ciudadano_mayor_edad_id !== undefined) {
        conditions.push(eq(inmunizacion.ciudadano_mayor_edad_id, filters.ciudadano_mayor_edad_id));
    }
    if (filters.ciudadano_mayor_menor_id !== undefined) {
        conditions.push(eq(inmunizacion.ciudadano_mayor_menor_id, filters.ciudadano_mayor_menor_id));
    }
    if (filters.numero_lote) {
        conditions.push(like(inmunizacion.numero_lote, sanitizeSearchPattern(filters.numero_lote)));
    }
    if (filters.fecha_desde !== undefined) {
        conditions.push(gte(inmunizacion.fecha_aplicacion, filters.fecha_desde));
    }
    if (filters.fecha_hasta !== undefined) {
        conditions.push(lte(inmunizacion.fecha_aplicacion, filters.fecha_hasta));
    }
    return queryInmunizaciones(conditions, {
        limit: filters.limit,
        offset: filters.offset,
        order: 'desc_reciente',
    });
}
export async function getInmunizacionById(user, idInmunizacion) {
    const rows = await queryInmunizaciones([
        eq(inmunizacion.id_inmunizacion, idInmunizacion),
    ]);
    const item = rows[0];
    if (!item) {
        throw new NotFoundError(`La inmunización con ID ${idInmunizacion} no existe.`);
    }
    assertInmunizacionRecordScope(user, item);
    return item;
}
export async function getCartillaByCiudadanoMayorId(idCiudadano) {
    const citizenRows = await db
        .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
        .from(ciudadanoMayorEdad)
        .where(eq(ciudadanoMayorEdad.id_ciudadano, idCiudadano))
        .limit(1);
    if (!citizenRows[0]) {
        throw new NotFoundError(`El ciudadano mayor de edad con ID ${idCiudadano} no existe.`);
    }
    const rows = await queryInmunizaciones([eq(inmunizacion.ciudadano_mayor_edad_id, idCiudadano)], { order: 'asc_dosis' });
    return buildCartillaResumen(rows);
}
export async function getCartillaByCiudadanoMenorId(idMenor) {
    const minorRows = await db
        .select({ id_menor: ciudadanoMenorEdad.id_menor })
        .from(ciudadanoMenorEdad)
        .where(eq(ciudadanoMenorEdad.id_menor, idMenor))
        .limit(1);
    if (!minorRows[0]) {
        throw new NotFoundError(`El ciudadano menor de edad con ID ${idMenor} no existe.`);
    }
    const rows = await queryInmunizaciones([eq(inmunizacion.ciudadano_mayor_menor_id, idMenor)], { order: 'asc_dosis' });
    return buildCartillaResumen(rows);
}
export async function getCartillaFamiliarByCedula(ci) {
    const mayorConMenores = await getCiudadanoMayorByCedula(ci);
    const { menores_a_cargo: menores, ...titular } = mayorConMenores;
    const cartillaTitularRows = await queryInmunizaciones([eq(inmunizacion.ciudadano_mayor_edad_id, titular.id_ciudadano)], { order: 'asc_dosis' });
    const menoresConCartilla = await Promise.all(menores.map(async (menor) => {
        const menorRows = await queryInmunizaciones([eq(inmunizacion.ciudadano_mayor_menor_id, menor.id_menor)], { order: 'asc_dosis' });
        return {
            menor,
            cartilla: buildCartillaResumen(menorRows),
        };
    }));
    return {
        titular,
        cartilla_titular: buildCartillaResumen(cartillaTitularRows),
        menores_a_cargo: menoresConCartilla,
    };
}
async function resolveCentroAplicacionId(user, requestedCentroId) {
    if (user.tipo_usuario === 'centro_salud_jefe') {
        const assignedCentro = requireAssignedCentro(user);
        if (requestedCentroId !== undefined &&
            requestedCentroId !== assignedCentro) {
            throw new ForbiddenError('No tienes autorización para registrar inmunizaciones en nombre de otro centro de salud.');
        }
        return assignedCentro;
    }
    if (requestedCentroId === undefined) {
        throw new BadRequestError('Debe especificar centro_salud_aplicacion al registrar la inmunización.');
    }
    const centroRows = await db
        .select({
        id_centro: centroSalud.id_centro,
        estado_id: centroSalud.estado_id,
    })
        .from(centroSalud)
        .where(eq(centroSalud.id_centro, requestedCentroId))
        .limit(1);
    const centro = centroRows[0];
    if (!centro) {
        throw new NotFoundError(`El centro de salud con ID ${requestedCentroId} no existe.`);
    }
    if (user.tipo_usuario === 'subregion') {
        if (user.estado_id === null || centro.estado_id !== user.estado_id) {
            throw new ForbiddenError('Solo puedes registrar inmunizaciones en centros de salud pertenecientes a tu estado.');
        }
    }
    else if (user.tipo_usuario !== 'master') {
        throw new ForbiddenError('No cuentas con permisos para registrar inmunizaciones.');
    }
    return centro.id_centro;
}
export async function createInmunizacion(user, input) {
    const centroAplicacionId = await resolveCentroAplicacionId(user, input.centro_salud_aplicacion);
    const isMayor = input.ciudadano_mayor_edad_id !== undefined &&
        input.ciudadano_mayor_edad_id !== null;
    const mayorId = isMayor ? input.ciudadano_mayor_edad_id : null;
    const menorId = !isMayor ? input.ciudadano_mayor_menor_id : null;
    const createdId = await db.transaction(async (tx) => {
        const vacunaRows = await tx
            .select({
            id_vacuna: vacunas.id_vacuna,
            nombre_vacuna: vacunas.nombre_vacuna,
            cantidad_dosis: vacunas.cantidad_dosis,
        })
            .from(vacunas)
            .where(eq(vacunas.id_vacuna, input.vacuna_id))
            .limit(1);
        const vacuna = vacunaRows[0];
        if (!vacuna) {
            throw new NotFoundError(`La vacuna con ID ${input.vacuna_id} no existe.`);
        }
        if (input.numero_dosis > vacuna.cantidad_dosis) {
            throw new UnprocessableEntityError(`La vacuna "${vacuna.nombre_vacuna}" contempla un máximo de ${vacuna.cantidad_dosis} dosis; no se puede registrar la dosis ${input.numero_dosis}.`);
        }
        if (mayorId !== null) {
            const mayorRows = await tx
                .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
                .from(ciudadanoMayorEdad)
                .where(eq(ciudadanoMayorEdad.id_ciudadano, mayorId))
                .limit(1);
            if (!mayorRows[0]) {
                throw new NotFoundError(`El ciudadano mayor de edad con ID ${mayorId} no existe.`);
            }
        }
        else if (menorId !== null) {
            const menorRows = await tx
                .select({ id_menor: ciudadanoMenorEdad.id_menor })
                .from(ciudadanoMenorEdad)
                .where(eq(ciudadanoMenorEdad.id_menor, menorId))
                .limit(1);
            if (!menorRows[0]) {
                throw new NotFoundError(`El ciudadano menor de edad con ID ${menorId} no existe.`);
            }
        }
        const patientCondition = mayorId !== null
            ? eq(inmunizacion.ciudadano_mayor_edad_id, mayorId)
            : eq(inmunizacion.ciudadano_mayor_menor_id, menorId);
        const prevDoses = await tx
            .select({
            id_inmunizacion: inmunizacion.id_inmunizacion,
            numero_dosis: inmunizacion.numero_dosis,
        })
            .from(inmunizacion)
            .where(and(eq(inmunizacion.vacuna_id, input.vacuna_id), patientCondition));
        const appliedNumbers = new Set(prevDoses.map((d) => d.numero_dosis));
        if (appliedNumbers.has(input.numero_dosis)) {
            throw new ConflictError(`El ciudadano ya tiene registrada la dosis ${input.numero_dosis} de "${vacuna.nombre_vacuna}".`);
        }
        if (input.numero_dosis > 1 && !appliedNumbers.has(input.numero_dosis - 1)) {
            throw new UnprocessableEntityError(`No se puede registrar la dosis ${input.numero_dosis} de "${vacuna.nombre_vacuna}" sin haber aplicado previamente la dosis ${input.numero_dosis - 1}.`);
        }
        const [created] = await tx
            .insert(inmunizacion)
            .values({
            numero_dosis: input.numero_dosis,
            fecha_aplicacion: input.fecha_aplicacion ?? getTodayIsoUtc(),
            numero_lote: input.numero_lote,
            observaciones: input.observaciones ?? null,
            centro_salud_aplicacion: centroAplicacionId,
            vacuna_id: input.vacuna_id,
            ciudadano_mayor_edad_id: mayorId,
            ciudadano_mayor_menor_id: menorId,
        })
            .$returningId();
        if (!created) {
            throw new Error('No se pudo obtener el identificador de la inmunización creada.');
        }
        return created.id_inmunizacion;
    });
    return getInmunizacionById(user, createdId);
}
export async function updateInmunizacion(user, idInmunizacion, input) {
    await getInmunizacionById(user, idInmunizacion);
    await db
        .update(inmunizacion)
        .set({
        ...(input.fecha_aplicacion !== undefined
            ? { fecha_aplicacion: input.fecha_aplicacion }
            : {}),
        ...(input.numero_lote !== undefined
            ? { numero_lote: input.numero_lote }
            : {}),
        ...(input.observaciones !== undefined
            ? { observaciones: input.observaciones }
            : {}),
    })
        .where(eq(inmunizacion.id_inmunizacion, idInmunizacion));
    return getInmunizacionById(user, idInmunizacion);
}
//# sourceMappingURL=inmunizaciones.service.js.map