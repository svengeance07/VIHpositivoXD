import { and, desc, eq, gte, inArray, lte, sql, type SQL } from 'drizzle-orm';

import { ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../common/errors.js';
import {
  centroSalud,
  certificado,
  ciudadanoMayorEdad,
  ciudadanoMenorEdad,
  db,
  examenes,
  inmunizacion,
  reportes,
  sintomasComunes,
  vacunas,
} from '../../db/index.js';
import { assertCentroScope, requireAssignedCentro, type AuthUserContext } from '../auth/index.js';
import { getTodayIsoUtc, queryInmunizaciones } from '../inmunizaciones/index.js';
import type {
  CertificadoCiudadano,
  CertificadoDetalle,
  CertificadosQuery,
  ConsultaCertificadosCedula,
  CreateCertificadoBody,
  CreateReporteBody,
  ReporteDetalle,
  ReportesQuery,
  UpdateCertificadoBody,
  UpdateReporteBody,
  ValidacionCertificado,
} from './reportes.schemas.js';

// =====================================================================
// REPORTES POST-VACUNACIÓN
// =====================================================================

interface JoinedReporteRow {
  id_reportes: number;
  nivel_gravedad: ReporteDetalle['nivel_gravedad'];
  recomendaciones: string;
  inmunizacion_id: number | null;
  ciudadano_mayor_id: number | null;
  ciudadano_menor_id: number | null;
  sintoma_id: number | null;
  descripcion_sintoma: string | null;
  inm_id: number | null;
  inm_numero_dosis: number | null;
  inm_fecha_aplicacion: string | null;
  inm_numero_lote: string | null;
  inm_centro_id: number | null;
  cs_nombre: string | null;
  cs_estado_id: number | null;
  vac_id: number | null;
  vac_nombre: string | null;
  cm_id: number | null;
  cm_primer_nombre: string | null;
  cm_segundo_nombre: string | null;
  cm_primer_apellido: string | null;
  cm_segundo_apellido: string | null;
  cm_c_i: number | null;
  cmen_id: number | null;
  cmen_primer_nombre: string | null;
  cmen_segundo_nombre: string | null;
  cmen_primer_apellido: string | null;
  cmen_segundo_apellido: string | null;
  cmen_padre_id: number | null;
}

function mapReporteRow(row: JoinedReporteRow): ReporteDetalle {
  const inmResumen =
    row.inm_id !== null && row.inm_numero_dosis !== null
      ? {
          id_inmunizacion: row.inm_id,
          numero_dosis: row.inm_numero_dosis,
          fecha_aplicacion: row.inm_fecha_aplicacion,
          numero_lote: row.inm_numero_lote,
          centro_salud_aplicacion: row.inm_centro_id,
          nombre_centro: row.cs_nombre,
          estado_id: row.cs_estado_id,
          vacuna_id: row.vac_id,
          nombre_vacuna: row.vac_nombre,
        }
      : null;

  const ciudadanoMayor =
    row.cm_id !== null &&
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

  const ciudadanoMenor =
    row.cmen_id !== null && row.cmen_primer_nombre !== null && row.cmen_primer_apellido !== null
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
    id_reportes: row.id_reportes,
    nivel_gravedad: row.nivel_gravedad,
    recomendaciones: row.recomendaciones,
    inmunizacion_id: row.inmunizacion_id,
    ciudadano_mayor_id: row.ciudadano_mayor_id,
    ciudadano_menor_id: row.ciudadano_menor_id,
    sintoma_id: row.sintoma_id,
    descripcion_sintoma: row.descripcion_sintoma,
    inmunizacion: inmResumen,
    ciudadano_mayor: ciudadanoMayor,
    ciudadano_menor: ciudadanoMenor,
  };
}

async function queryReportes(
  conditions: SQL[],
  pagination?: { limit: number; offset: number },
): Promise<ReporteDetalle[]> {
  const baseQuery = db
    .select({
      id_reportes: reportes.id_reportes,
      nivel_gravedad: reportes.nivel_gravedad,
      recomendaciones: reportes.recomendaciones,
      inmunizacion_id: reportes.inmunizacion_id,
      ciudadano_mayor_id: reportes.ciudadano_mayor_id,
      ciudadano_menor_id: reportes.ciudadano_menor_id,
      sintoma_id: reportes.sintoma_id,
      descripcion_sintoma: sintomasComunes.descripcion_sintoma,
      inm_id: inmunizacion.id_inmunizacion,
      inm_numero_dosis: inmunizacion.numero_dosis,
      inm_fecha_aplicacion: inmunizacion.fecha_aplicacion,
      inm_numero_lote: inmunizacion.numero_lote,
      inm_centro_id: inmunizacion.centro_salud_aplicacion,
      cs_nombre: centroSalud.nombre_centro,
      cs_estado_id: centroSalud.estado_id,
      vac_id: vacunas.id_vacuna,
      vac_nombre: vacunas.nombre_vacuna,
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
    .from(reportes)
    .leftJoin(sintomasComunes, eq(sintomasComunes.id_sintoma, reportes.sintoma_id))
    .leftJoin(inmunizacion, eq(inmunizacion.id_inmunizacion, reportes.inmunizacion_id))
    .leftJoin(centroSalud, eq(centroSalud.id_centro, inmunizacion.centro_salud_aplicacion))
    .leftJoin(vacunas, eq(vacunas.id_vacuna, inmunizacion.vacuna_id))
    .leftJoin(ciudadanoMayorEdad, eq(ciudadanoMayorEdad.id_ciudadano, reportes.ciudadano_mayor_id))
    .leftJoin(ciudadanoMenorEdad, eq(ciudadanoMenorEdad.id_menor, reportes.ciudadano_menor_id));

  const filtered = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const ordered = filtered.orderBy(desc(reportes.id_reportes));

  const rows = pagination
    ? await ordered.limit(pagination.limit).offset(pagination.offset)
    : await ordered;

  return rows.map(mapReporteRow);
}

function assertCentroAndEstadoScope(
  user: AuthUserContext,
  centroId: number | null,
  estadoId: number | null,
): void {
  if (user.tipo_usuario === 'master') {
    return;
  }

  if (user.tipo_usuario === 'subregion') {
    if (user.estado_id === null || estadoId !== user.estado_id) {
      throw new ForbiddenError(
        'No tienes autorización para acceder u operar reportes de otro estado.',
      );
    }
    return;
  }

  if (centroId === null) {
    throw new ForbiddenError('El reporte no está asociado a ningún centro de salud autorizado.');
  }

  assertCentroScope(user, centroId);
}

async function assertSintomaExists(sintomaId: number): Promise<void> {
  const rows = await db
    .select({ id_sintoma: sintomasComunes.id_sintoma })
    .from(sintomasComunes)
    .where(eq(sintomasComunes.id_sintoma, sintomaId))
    .limit(1);

  if (!rows[0]) {
    throw new NotFoundError(`El síntoma común con ID ${sintomaId} no existe.`);
  }
}

export async function listReportes(
  user: AuthUserContext,
  filters: ReportesQuery,
): Promise<ReporteDetalle[]> {
  const conditions: SQL[] = [];

  if (user.tipo_usuario === 'centro_salud_jefe') {
    const assignedCentro = requireAssignedCentro(user);
    if (filters.centro_salud_id !== undefined && filters.centro_salud_id !== assignedCentro) {
      throw new ForbiddenError(
        'No tienes autorización para consultar reportes de otro centro de salud.',
      );
    }
    if (
      filters.estado_id !== undefined &&
      user.estado_id !== null &&
      filters.estado_id !== user.estado_id
    ) {
      throw new ForbiddenError('No tienes autorización para consultar reportes de otro estado.');
    }
    conditions.push(eq(inmunizacion.centro_salud_aplicacion, assignedCentro));
  } else if (user.tipo_usuario === 'subregion') {
    if (user.estado_id === null) {
      throw new ForbiddenError('La subregión autenticada no tiene un estado asignado.');
    }
    if (filters.estado_id !== undefined && filters.estado_id !== user.estado_id) {
      throw new ForbiddenError('No tienes autorización para consultar reportes de otro estado.');
    }
    conditions.push(eq(centroSalud.estado_id, user.estado_id));
    if (filters.centro_salud_id !== undefined) {
      conditions.push(eq(inmunizacion.centro_salud_aplicacion, filters.centro_salud_id));
    }
  } else {
    if (filters.centro_salud_id !== undefined) {
      conditions.push(eq(inmunizacion.centro_salud_aplicacion, filters.centro_salud_id));
    }
    if (filters.estado_id !== undefined) {
      conditions.push(eq(centroSalud.estado_id, filters.estado_id));
    }
  }

  if (filters.nivel_gravedad !== undefined) {
    conditions.push(eq(reportes.nivel_gravedad, filters.nivel_gravedad));
  }
  if (filters.sintoma_id !== undefined) {
    conditions.push(eq(reportes.sintoma_id, filters.sintoma_id));
  }
  if (filters.inmunizacion_id !== undefined) {
    conditions.push(eq(reportes.inmunizacion_id, filters.inmunizacion_id));
  }
  if (filters.ciudadano_mayor_id !== undefined) {
    conditions.push(eq(reportes.ciudadano_mayor_id, filters.ciudadano_mayor_id));
  }
  if (filters.ciudadano_menor_id !== undefined) {
    conditions.push(eq(reportes.ciudadano_menor_id, filters.ciudadano_menor_id));
  }

  return queryReportes(conditions, {
    limit: filters.limit,
    offset: filters.offset,
  });
}

export async function getReporteById(
  user: AuthUserContext,
  idReporte: number,
): Promise<ReporteDetalle> {
  const rows = await queryReportes([eq(reportes.id_reportes, idReporte)]);
  const reporte = rows[0];
  if (!reporte) {
    throw new NotFoundError(`El reporte con ID ${idReporte} no existe.`);
  }

  assertCentroAndEstadoScope(
    user,
    reporte.inmunizacion?.centro_salud_aplicacion ?? null,
    reporte.inmunizacion?.estado_id ?? null,
  );

  return reporte;
}

export async function createReporte(
  user: AuthUserContext,
  input: CreateReporteBody,
): Promise<ReporteDetalle> {
  const [inmRows] = await Promise.all([
    db
      .select({
        id_inmunizacion: inmunizacion.id_inmunizacion,
        centro_salud_aplicacion: inmunizacion.centro_salud_aplicacion,
        estado_id: centroSalud.estado_id,
        ciudadano_mayor_edad_id: inmunizacion.ciudadano_mayor_edad_id,
        ciudadano_mayor_menor_id: inmunizacion.ciudadano_mayor_menor_id,
      })
      .from(inmunizacion)
      .leftJoin(centroSalud, eq(centroSalud.id_centro, inmunizacion.centro_salud_aplicacion))
      .where(eq(inmunizacion.id_inmunizacion, input.inmunizacion_id))
      .limit(1),
    assertSintomaExists(input.sintoma_id),
  ]);

  const inm = inmRows[0];
  if (!inm) {
    throw new NotFoundError(`La inmunización con ID ${input.inmunizacion_id} no existe.`);
  }

  assertCentroAndEstadoScope(user, inm.centro_salud_aplicacion, inm.estado_id);

  if (inm.ciudadano_mayor_edad_id === null && inm.ciudadano_mayor_menor_id === null) {
    throw new UnprocessableEntityError('La inmunización indicada no tiene un ciudadano asociado.');
  }

  if (
    input.ciudadano_mayor_id !== undefined &&
    input.ciudadano_mayor_id !== inm.ciudadano_mayor_edad_id
  ) {
    throw new UnprocessableEntityError(
      'El ciudadano_mayor_id proporcionado no coincide con el paciente de la inmunización.',
    );
  }

  if (
    input.ciudadano_menor_id !== undefined &&
    input.ciudadano_menor_id !== inm.ciudadano_mayor_menor_id
  ) {
    throw new UnprocessableEntityError(
      'El ciudadano_menor_id proporcionado no coincide con el paciente de la inmunización.',
    );
  }

  const [created] = await db
    .insert(reportes)
    .values({
      nivel_gravedad: input.nivel_gravedad,
      recomendaciones: input.recomendaciones,
      inmunizacion_id: input.inmunizacion_id,
      ciudadano_mayor_id: inm.ciudadano_mayor_edad_id,
      ciudadano_menor_id: inm.ciudadano_mayor_menor_id,
      sintoma_id: input.sintoma_id,
    })
    .$returningId();

  if (!created) {
    throw new Error('No se pudo obtener el identificador del reporte creado.');
  }

  return getReporteById(user, created.id_reportes);
}

export async function updateReporte(
  user: AuthUserContext,
  idReporte: number,
  input: UpdateReporteBody,
): Promise<ReporteDetalle> {
  await getReporteById(user, idReporte);

  if (input.sintoma_id !== undefined) {
    await assertSintomaExists(input.sintoma_id);
  }

  await db
    .update(reportes)
    .set({
      ...(input.nivel_gravedad !== undefined ? { nivel_gravedad: input.nivel_gravedad } : {}),
      ...(input.recomendaciones !== undefined ? { recomendaciones: input.recomendaciones } : {}),
      ...(input.sintoma_id !== undefined ? { sintoma_id: input.sintoma_id } : {}),
    })
    .where(eq(reportes.id_reportes, idReporte));

  return getReporteById(user, idReporte);
}

// =====================================================================
// CERTIFICADOS Y VALIDACIÓN CLÍNICA / PÚBLICA
// =====================================================================

interface JoinedCertificadoRow {
  id_certificado: number;
  fecha_emision: string;
  estatus: CertificadoDetalle['estatus'];
  ciudadano_mayor_id: number | null;
  examen_id: number | null;
  nombre_examen: string | null;
  cm_id: number | null;
  cm_primer_nombre: string | null;
  cm_segundo_nombre: string | null;
  cm_primer_apellido: string | null;
  cm_segundo_apellido: string | null;
  cm_c_i: number | null;
  cm_fecha_nacimiento: string | null;
  cm_sexo: CertificadoCiudadano['sexo'] | null;
  cm_tipo_sangre: CertificadoCiudadano['tipo_sangre'] | null;
}

async function countInmunizacionesByCiudadanos(
  ciudadanoIds: number[],
): Promise<Map<number, number>> {
  if (ciudadanoIds.length === 0) {
    return new Map();
  }

  const counts = await db
    .select({
      ciudadano_id: inmunizacion.ciudadano_mayor_edad_id,
      total: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(inmunizacion)
    .where(inArray(inmunizacion.ciudadano_mayor_edad_id, ciudadanoIds))
    .groupBy(inmunizacion.ciudadano_mayor_edad_id);

  const map = new Map<number, number>();
  for (const row of counts) {
    if (row.ciudadano_id !== null) {
      map.set(row.ciudadano_id, row.total);
    }
  }
  return map;
}

function mapCertificadoRow(
  row: JoinedCertificadoRow,
  totalInmunizaciones: number,
): CertificadoDetalle {
  const ciudadano: CertificadoCiudadano | null =
    row.cm_id !== null &&
    row.cm_primer_nombre !== null &&
    row.cm_primer_apellido !== null &&
    row.cm_c_i !== null &&
    row.cm_fecha_nacimiento !== null &&
    row.cm_sexo !== null &&
    row.cm_tipo_sangre !== null
      ? {
          id_ciudadano: row.cm_id,
          primer_nombre: row.cm_primer_nombre,
          segundo_nombre: row.cm_segundo_nombre,
          primer_apellido: row.cm_primer_apellido,
          segundo_apellido: row.cm_segundo_apellido,
          c_i: row.cm_c_i,
          fecha_nacimiento: row.cm_fecha_nacimiento,
          sexo: row.cm_sexo,
          tipo_sangre: row.cm_tipo_sangre,
        }
      : null;

  return {
    id_certificado: row.id_certificado,
    fecha_emision: row.fecha_emision,
    estatus: row.estatus,
    ciudadano_mayor_id: row.ciudadano_mayor_id,
    examen_id: row.examen_id,
    nombre_examen: row.nombre_examen,
    ciudadano,
    total_inmunizaciones_registradas: totalInmunizaciones,
  };
}

async function queryCertificados(
  conditions: SQL[],
  pagination?: { limit: number; offset: number },
): Promise<CertificadoDetalle[]> {
  const baseQuery = db
    .select({
      id_certificado: certificado.id_certificado,
      fecha_emision: certificado.fecha_emision,
      estatus: certificado.estatus,
      ciudadano_mayor_id: certificado.ciudadano_mayor_id,
      examen_id: certificado.examen_id,
      nombre_examen: examenes.nombre_examen,
      cm_id: ciudadanoMayorEdad.id_ciudadano,
      cm_primer_nombre: ciudadanoMayorEdad.primer_nombre,
      cm_segundo_nombre: ciudadanoMayorEdad.segundo_nombre,
      cm_primer_apellido: ciudadanoMayorEdad.primer_apellido,
      cm_segundo_apellido: ciudadanoMayorEdad.segundo_apellido,
      cm_c_i: ciudadanoMayorEdad.c_i,
      cm_fecha_nacimiento: ciudadanoMayorEdad.fecha_nacimiento,
      cm_sexo: ciudadanoMayorEdad.sexo,
      cm_tipo_sangre: ciudadanoMayorEdad.tipo_sangre,
    })
    .from(certificado)
    .leftJoin(examenes, eq(examenes.id_examenes, certificado.examen_id))
    .leftJoin(
      ciudadanoMayorEdad,
      eq(ciudadanoMayorEdad.id_ciudadano, certificado.ciudadano_mayor_id),
    );

  const filtered = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
  const ordered = filtered.orderBy(
    desc(certificado.fecha_emision),
    desc(certificado.id_certificado),
  );

  const rows = pagination
    ? await ordered.limit(pagination.limit).offset(pagination.offset)
    : await ordered;

  const uniqueCitizenIds = Array.from(
    new Set(rows.map((r) => r.ciudadano_mayor_id).filter((id): id is number => id !== null)),
  );
  const countMap = await countInmunizacionesByCiudadanos(uniqueCitizenIds);

  return rows.map((row) =>
    mapCertificadoRow(
      row,
      row.ciudadano_mayor_id !== null ? (countMap.get(row.ciudadano_mayor_id) ?? 0) : 0,
    ),
  );
}

function buildCertificadoValidacionMeta(item: CertificadoDetalle): {
  valido: boolean;
  motivo: string;
} {
  if (item.estatus === 'APROBADO') {
    return {
      valido: true,
      motivo:
        item.total_inmunizaciones_registradas > 0
          ? `Certificado aprobado con ${item.total_inmunizaciones_registradas} inmunización(es) registrada(s).`
          : 'Certificado aprobado en el sistema nacional.',
    };
  }

  return {
    valido: false,
    motivo: 'El certificado figura con estatus RECHAZADO en el sistema.',
  };
}

async function assertExamenExists(examenId: number): Promise<void> {
  const rows = await db
    .select({ id_examenes: examenes.id_examenes })
    .from(examenes)
    .where(eq(examenes.id_examenes, examenId))
    .limit(1);

  if (!rows[0]) {
    throw new NotFoundError(`El examen con ID ${examenId} no existe.`);
  }
}

export async function listCertificados(
  _user: AuthUserContext,
  filters: CertificadosQuery,
): Promise<CertificadoDetalle[]> {
  const conditions: SQL[] = [];

  if (filters.ciudadano_mayor_id !== undefined) {
    conditions.push(eq(certificado.ciudadano_mayor_id, filters.ciudadano_mayor_id));
  }
  if (filters.c_i !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.c_i, filters.c_i));
  }
  if (filters.examen_id !== undefined) {
    conditions.push(eq(certificado.examen_id, filters.examen_id));
  }
  if (filters.estatus !== undefined) {
    conditions.push(eq(certificado.estatus, filters.estatus));
  }
  if (filters.fecha_desde !== undefined) {
    conditions.push(gte(certificado.fecha_emision, filters.fecha_desde));
  }
  if (filters.fecha_hasta !== undefined) {
    conditions.push(lte(certificado.fecha_emision, filters.fecha_hasta));
  }

  return queryCertificados(conditions, {
    limit: filters.limit,
    offset: filters.offset,
  });
}

export async function getCertificadoById(idCertificado: number): Promise<CertificadoDetalle> {
  const rows = await queryCertificados([eq(certificado.id_certificado, idCertificado)]);
  const item = rows[0];
  if (!item) {
    throw new NotFoundError(`El certificado con ID ${idCertificado} no existe.`);
  }

  return item;
}

export async function createCertificado(
  user: AuthUserContext,
  input: CreateCertificadoBody,
): Promise<CertificadoDetalle> {
  if (
    user.tipo_usuario !== 'master' &&
    user.tipo_usuario !== 'subregion' &&
    user.tipo_usuario !== 'centro_salud_jefe'
  ) {
    throw new ForbiddenError('No cuentas con permisos para emitir certificados.');
  }

  const [citizenRows] = await Promise.all([
    db
      .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
      .from(ciudadanoMayorEdad)
      .where(eq(ciudadanoMayorEdad.id_ciudadano, input.ciudadano_mayor_id))
      .limit(1),
    assertExamenExists(input.examen_id),
  ]);

  if (!citizenRows[0]) {
    throw new NotFoundError(
      `El ciudadano mayor de edad con ID ${input.ciudadano_mayor_id} no existe.`,
    );
  }

  const [created] = await db
    .insert(certificado)
    .values({
      fecha_emision: input.fecha_emision ?? getTodayIsoUtc(),
      estatus: input.estatus,
      ciudadano_mayor_id: input.ciudadano_mayor_id,
      examen_id: input.examen_id,
    })
    .$returningId();

  if (!created) {
    throw new Error('No se pudo obtener el identificador del certificado emitido.');
  }

  return getCertificadoById(created.id_certificado);
}

export async function updateCertificado(
  user: AuthUserContext,
  idCertificado: number,
  input: UpdateCertificadoBody,
): Promise<CertificadoDetalle> {
  if (user.tipo_usuario !== 'master' && user.tipo_usuario !== 'subregion') {
    throw new ForbiddenError(
      'Solo un usuario master o subregion puede actualizar el estatus de certificados.',
    );
  }

  await getCertificadoById(idCertificado);

  if (input.examen_id !== undefined) {
    await assertExamenExists(input.examen_id);
  }

  await db
    .update(certificado)
    .set({
      ...(input.estatus !== undefined ? { estatus: input.estatus } : {}),
      ...(input.examen_id !== undefined ? { examen_id: input.examen_id } : {}),
      ...(input.fecha_emision !== undefined ? { fecha_emision: input.fecha_emision } : {}),
    })
    .where(eq(certificado.id_certificado, idCertificado));

  return getCertificadoById(idCertificado);
}

export async function validateCertificadoById(
  idCertificado: number,
): Promise<ValidacionCertificado> {
  const item = await getCertificadoById(idCertificado);
  const meta = buildCertificadoValidacionMeta(item);

  const inmunizacionesList =
    item.ciudadano_mayor_id !== null
      ? await queryInmunizaciones(
          [eq(inmunizacion.ciudadano_mayor_edad_id, item.ciudadano_mayor_id)],
          { order: 'asc_dosis' },
        )
      : [];

  return {
    valido: meta.valido,
    motivo: meta.motivo,
    certificado: item,
    inmunizaciones: inmunizacionesList,
  };
}

export async function getCertificadosByCedula(ci: number): Promise<ConsultaCertificadosCedula> {
  const citizenRows = await db
    .select({
      id_ciudadano: ciudadanoMayorEdad.id_ciudadano,
      primer_nombre: ciudadanoMayorEdad.primer_nombre,
      segundo_nombre: ciudadanoMayorEdad.segundo_nombre,
      primer_apellido: ciudadanoMayorEdad.primer_apellido,
      segundo_apellido: ciudadanoMayorEdad.segundo_apellido,
      c_i: ciudadanoMayorEdad.c_i,
      fecha_nacimiento: ciudadanoMayorEdad.fecha_nacimiento,
      sexo: ciudadanoMayorEdad.sexo,
      tipo_sangre: ciudadanoMayorEdad.tipo_sangre,
    })
    .from(ciudadanoMayorEdad)
    .where(eq(ciudadanoMayorEdad.c_i, ci))
    .limit(1);

  const ciudadano = citizenRows[0];
  if (!ciudadano) {
    throw new NotFoundError(`No existe ningún ciudadano registrado con la cédula ${ci}.`);
  }

  const [certificadosList, inmunizacionesList] = await Promise.all([
    queryCertificados([eq(certificado.ciudadano_mayor_id, ciudadano.id_ciudadano)]),
    queryInmunizaciones([eq(inmunizacion.ciudadano_mayor_edad_id, ciudadano.id_ciudadano)], {
      order: 'asc_dosis',
    }),
  ]);

  return {
    ciudadano,
    certificados: certificadosList.map((cert) => ({
      ...buildCertificadoValidacionMeta(cert),
      certificado: cert,
    })),
    inmunizaciones: inmunizacionesList,
  };
}
