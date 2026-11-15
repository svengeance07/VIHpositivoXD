import { and, asc, eq, like, or, type SQL } from 'drizzle-orm';

import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../common/errors.js';
import {
  certificado,
  ciudadanoMayorEdad,
  ciudadanoMenorEdad,
  db,
  estados,
  etnias,
  inmunizacion,
  municipios,
  parroquias,
  profesiones,
  reportes,
} from '../../db/index.js';
import { validateUbicacionGeografica } from '../catalogos/index.js';
import type {
  CiudadanoMayorConMenores,
  CiudadanoMayorDetalle,
  CiudadanoMenorDetalle,
  CiudadanosMayoresQuery,
  CiudadanosMenoresQuery,
  CreateCiudadanoMayorBody,
  CreateCiudadanoMenorBody,
  RepresentanteResumen,
  UpdateCiudadanoMayorBody,
  UpdateCiudadanoMenorBody,
} from './ciudadanos.schemas.js';

function sanitizeSearchPattern(term: string): string {
  const escaped = term.replace(/[%_\\]/g, (ch) => `\\${ch}`);
  return `%${escaped}%`;
}

export function calculateAgeInYears(fechaIso: string): number {
  const parts = fechaIso.split('-').map(Number);
  const birthYear = parts[0];
  const birthMonth = parts[1];
  const birthDay = parts[2];

  if (birthYear === undefined || birthMonth === undefined || birthDay === undefined) {
    throw new BadRequestError('Formato de fecha de nacimiento inválido.');
  }

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const currentDay = now.getUTCDate();

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age -= 1;
  }

  if (age < 0) {
    throw new BadRequestError('La fecha de nacimiento no puede estar en el futuro.');
  }

  return age;
}

function assertMayorEdadAge(fechaNacimiento: string): void {
  const age = calculateAgeInYears(fechaNacimiento);
  if (age < 18) {
    throw new UnprocessableEntityError(
      `El ciudadano tiene ${age} años. Debe tener al menos 18 años para registrarse en ciudadano_mayor_edad.`,
    );
  }
}

function assertMenorEdadAge(fechaNacimiento: string): void {
  const age = calculateAgeInYears(fechaNacimiento);
  if (age >= 18) {
    throw new UnprocessableEntityError(
      `El ciudadano tiene ${age} años. Solo personas menores de 18 años pueden registrarse en ciudadano_menor_edad.`,
    );
  }
}

async function assertProfesionExists(profesionId: number): Promise<void> {
  const rows = await db
    .select({ id_profesion: profesiones.id_profesion })
    .from(profesiones)
    .where(eq(profesiones.id_profesion, profesionId))
    .limit(1);

  if (!rows[0]) {
    throw new NotFoundError(`La profesión con ID ${profesionId} no existe.`);
  }
}

async function assertEtniaExists(etniaId: number): Promise<void> {
  const rows = await db
    .select({ id_etnia: etnias.id_etnia })
    .from(etnias)
    .where(eq(etnias.id_etnia, etniaId))
    .limit(1);

  if (!rows[0]) {
    throw new NotFoundError(`La etnia con ID ${etniaId} no existe.`);
  }
}

async function assertRepresentanteExists(padreId: number): Promise<void> {
  const rows = await db
    .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
    .from(ciudadanoMayorEdad)
    .where(eq(ciudadanoMayorEdad.id_ciudadano, padreId))
    .limit(1);

  if (!rows[0]) {
    throw new NotFoundError(`El representante (ciudadano_mayor_edad) con ID ${padreId} no existe.`);
  }
}

// =====================================================================
// CIUDADANO MAYOR DE EDAD
// =====================================================================

async function queryCiudadanosMayores(
  conditions: SQL[],
  pagination?: { limit: number; offset: number },
): Promise<CiudadanoMayorDetalle[]> {
  const baseQuery = db
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
      estatura: ciudadanoMayorEdad.estatura,
      correo_electronico: ciudadanoMayorEdad.correo_electronico,
      telefono_celular: ciudadanoMayorEdad.telefono_celular,
      telefono_domicilio: ciudadanoMayorEdad.telefono_domicilio,
      domicilio: ciudadanoMayorEdad.domicilio,
      profesion_id: ciudadanoMayorEdad.profesion_id,
      parroquia_id: ciudadanoMayorEdad.parroquia_id,
      municipio_id: ciudadanoMayorEdad.municipio_id,
      estado_id: ciudadanoMayorEdad.estado_id,
      etnia_id: ciudadanoMayorEdad.etnia_id,
      nombre_profesion: profesiones.nombre_profesion,
      nombre_etnia: etnias.nombre_etnia,
      nombre_estado: estados.nombre_estado,
      nombre_municipio: municipios.nombre_municipio,
      nombre_parroquia: parroquias.nombre_parroquia,
    })
    .from(ciudadanoMayorEdad)
    .leftJoin(profesiones, eq(profesiones.id_profesion, ciudadanoMayorEdad.profesion_id))
    .leftJoin(etnias, eq(etnias.id_etnia, ciudadanoMayorEdad.etnia_id))
    .leftJoin(estados, eq(estados.id_estado, ciudadanoMayorEdad.estado_id))
    .leftJoin(municipios, eq(municipios.id_municipio, ciudadanoMayorEdad.municipio_id))
    .leftJoin(parroquias, eq(parroquias.id_parroquia, ciudadanoMayorEdad.parroquia_id));

  const filtered = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  const ordered = filtered.orderBy(
    asc(ciudadanoMayorEdad.primer_apellido),
    asc(ciudadanoMayorEdad.primer_nombre),
  );

  if (pagination) {
    return ordered.limit(pagination.limit).offset(pagination.offset);
  }

  return ordered;
}

export async function listCiudadanosMayores(
  filters: CiudadanosMayoresQuery,
): Promise<CiudadanoMayorDetalle[]> {
  const conditions: SQL[] = [];

  if (filters.c_i !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.c_i, filters.c_i));
  }
  if (filters.estado_id !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.estado_id, filters.estado_id));
  }
  if (filters.municipio_id !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.municipio_id, filters.municipio_id));
  }
  if (filters.parroquia_id !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.parroquia_id, filters.parroquia_id));
  }
  if (filters.etnia_id !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.etnia_id, filters.etnia_id));
  }
  if (filters.profesion_id !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.profesion_id, filters.profesion_id));
  }
  if (filters.sexo !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.sexo, filters.sexo));
  }
  if (filters.tipo_sangre !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.tipo_sangre, filters.tipo_sangre));
  }
  if (filters.search) {
    const pattern = sanitizeSearchPattern(filters.search);
    const searchCondition = or(
      like(ciudadanoMayorEdad.primer_nombre, pattern),
      like(ciudadanoMayorEdad.segundo_nombre, pattern),
      like(ciudadanoMayorEdad.primer_apellido, pattern),
      like(ciudadanoMayorEdad.segundo_apellido, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return queryCiudadanosMayores(conditions, {
    limit: filters.limit,
    offset: filters.offset,
  });
}

async function hydrateCiudadanoMayorConMenores(
  ciudadano: CiudadanoMayorDetalle,
): Promise<CiudadanoMayorConMenores> {
  const menores = await queryCiudadanosMenores([
    eq(ciudadanoMenorEdad.padre_id, ciudadano.id_ciudadano),
  ]);

  return {
    ...ciudadano,
    menores_a_cargo: menores,
  };
}

export async function getCiudadanoMayorById(
  idCiudadano: number,
): Promise<CiudadanoMayorConMenores> {
  const rows = await queryCiudadanosMayores([eq(ciudadanoMayorEdad.id_ciudadano, idCiudadano)]);
  const ciudadano = rows[0];
  if (!ciudadano) {
    throw new NotFoundError(`El ciudadano mayor de edad con ID ${idCiudadano} no existe.`);
  }

  return hydrateCiudadanoMayorConMenores(ciudadano);
}

export async function getCiudadanoMayorByCedula(ci: number): Promise<CiudadanoMayorConMenores> {
  const rows = await queryCiudadanosMayores([eq(ciudadanoMayorEdad.c_i, ci)]);
  const ciudadano = rows[0];
  if (!ciudadano) {
    throw new NotFoundError(`No existe ningún ciudadano registrado con la cédula ${ci}.`);
  }

  return hydrateCiudadanoMayorConMenores(ciudadano);
}

export async function createCiudadanoMayor(
  input: CreateCiudadanoMayorBody,
): Promise<CiudadanoMayorConMenores> {
  assertMayorEdadAge(input.fecha_nacimiento);

  const existingCi = await db
    .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
    .from(ciudadanoMayorEdad)
    .where(eq(ciudadanoMayorEdad.c_i, input.c_i))
    .limit(1);

  if (existingCi[0]) {
    throw new ConflictError(`Ya existe un ciudadano registrado con la cédula ${input.c_i}.`);
  }

  await Promise.all([
    assertProfesionExists(input.profesion_id),
    assertEtniaExists(input.etnia_id),
    validateUbicacionGeografica({
      estado_id: input.estado_id,
      municipio_id: input.municipio_id,
      parroquia_id: input.parroquia_id,
    }),
  ]);

  const [created] = await db
    .insert(ciudadanoMayorEdad)
    .values({
      primer_nombre: input.primer_nombre,
      segundo_nombre: input.segundo_nombre ?? null,
      primer_apellido: input.primer_apellido,
      segundo_apellido: input.segundo_apellido ?? null,
      c_i: input.c_i,
      fecha_nacimiento: input.fecha_nacimiento,
      sexo: input.sexo,
      tipo_sangre: input.tipo_sangre,
      estatura: input.estatura,
      correo_electronico: input.correo_electronico ?? null,
      telefono_celular: input.telefono_celular ?? null,
      telefono_domicilio: input.telefono_domicilio ?? null,
      domicilio: input.domicilio,
      profesion_id: input.profesion_id,
      parroquia_id: input.parroquia_id,
      municipio_id: input.municipio_id,
      estado_id: input.estado_id,
      etnia_id: input.etnia_id,
    })
    .$returningId();

  if (!created) {
    throw new Error('No se pudo obtener el identificador del ciudadano mayor creado.');
  }

  return getCiudadanoMayorById(created.id_ciudadano);
}

export async function updateCiudadanoMayor(
  idCiudadano: number,
  input: UpdateCiudadanoMayorBody,
): Promise<CiudadanoMayorConMenores> {
  const existing = await getCiudadanoMayorById(idCiudadano);

  if (input.fecha_nacimiento !== undefined) {
    assertMayorEdadAge(input.fecha_nacimiento);
  }

  if (input.c_i !== undefined && input.c_i !== existing.c_i) {
    const existingCi = await db
      .select({ id_ciudadano: ciudadanoMayorEdad.id_ciudadano })
      .from(ciudadanoMayorEdad)
      .where(eq(ciudadanoMayorEdad.c_i, input.c_i))
      .limit(1);

    if (existingCi[0] && existingCi[0].id_ciudadano !== idCiudadano) {
      throw new ConflictError(`Ya existe otro ciudadano registrado con la cédula ${input.c_i}.`);
    }
  }

  const validations: Promise<void>[] = [];

  if (input.profesion_id !== undefined) {
    validations.push(assertProfesionExists(input.profesion_id));
  }
  if (input.etnia_id !== undefined) {
    validations.push(assertEtniaExists(input.etnia_id));
  }
  if (
    input.estado_id !== undefined ||
    input.municipio_id !== undefined ||
    input.parroquia_id !== undefined
  ) {
    const estadoId = input.estado_id ?? existing.estado_id;
    const municipioId = input.municipio_id ?? existing.municipio_id;
    const parroquiaId = input.parroquia_id ?? existing.parroquia_id;

    if (estadoId === null || municipioId === null || parroquiaId === null) {
      throw new BadRequestError(
        'Debe especificar estado_id, municipio_id y parroquia_id completos.',
      );
    }

    validations.push(
      validateUbicacionGeografica({
        estado_id: estadoId,
        municipio_id: municipioId,
        parroquia_id: parroquiaId,
      }),
    );
  }

  await Promise.all(validations);

  await db
    .update(ciudadanoMayorEdad)
    .set({
      ...(input.primer_nombre !== undefined ? { primer_nombre: input.primer_nombre } : {}),
      ...(input.segundo_nombre !== undefined ? { segundo_nombre: input.segundo_nombre } : {}),
      ...(input.primer_apellido !== undefined ? { primer_apellido: input.primer_apellido } : {}),
      ...(input.segundo_apellido !== undefined ? { segundo_apellido: input.segundo_apellido } : {}),
      ...(input.c_i !== undefined ? { c_i: input.c_i } : {}),
      ...(input.fecha_nacimiento !== undefined ? { fecha_nacimiento: input.fecha_nacimiento } : {}),
      ...(input.sexo !== undefined ? { sexo: input.sexo } : {}),
      ...(input.tipo_sangre !== undefined ? { tipo_sangre: input.tipo_sangre } : {}),
      ...(input.estatura !== undefined ? { estatura: input.estatura } : {}),
      ...(input.correo_electronico !== undefined
        ? { correo_electronico: input.correo_electronico }
        : {}),
      ...(input.telefono_celular !== undefined ? { telefono_celular: input.telefono_celular } : {}),
      ...(input.telefono_domicilio !== undefined
        ? { telefono_domicilio: input.telefono_domicilio }
        : {}),
      ...(input.domicilio !== undefined ? { domicilio: input.domicilio } : {}),
      ...(input.profesion_id !== undefined ? { profesion_id: input.profesion_id } : {}),
      ...(input.parroquia_id !== undefined ? { parroquia_id: input.parroquia_id } : {}),
      ...(input.municipio_id !== undefined ? { municipio_id: input.municipio_id } : {}),
      ...(input.estado_id !== undefined ? { estado_id: input.estado_id } : {}),
      ...(input.etnia_id !== undefined ? { etnia_id: input.etnia_id } : {}),
    })
    .where(eq(ciudadanoMayorEdad.id_ciudadano, idCiudadano));

  return getCiudadanoMayorById(idCiudadano);
}

export async function deleteCiudadanoMayor(idCiudadano: number): Promise<void> {
  await getCiudadanoMayorById(idCiudadano);

  const [menorRef, inmunizacionRef, reporteRef, certificadoRef] = await Promise.all([
    db
      .select({ id_menor: ciudadanoMenorEdad.id_menor })
      .from(ciudadanoMenorEdad)
      .where(eq(ciudadanoMenorEdad.padre_id, idCiudadano))
      .limit(1),
    db
      .select({ id_inmunizacion: inmunizacion.id_inmunizacion })
      .from(inmunizacion)
      .where(eq(inmunizacion.ciudadano_mayor_edad_id, idCiudadano))
      .limit(1),
    db
      .select({ id_reportes: reportes.id_reportes })
      .from(reportes)
      .where(eq(reportes.ciudadano_mayor_id, idCiudadano))
      .limit(1),
    db
      .select({ id_certificado: certificado.id_certificado })
      .from(certificado)
      .where(eq(certificado.ciudadano_mayor_id, idCiudadano))
      .limit(1),
  ]);

  if (menorRef[0]) {
    throw new ConflictError(
      'No se puede eliminar el ciudadano porque tiene menores de edad vinculados a su cargo.',
    );
  }
  if (inmunizacionRef[0] || reporteRef[0] || certificadoRef[0]) {
    throw new ConflictError(
      'No se puede eliminar el ciudadano porque posee historial clínico, reportes o certificados emitidos.',
    );
  }

  await db.delete(ciudadanoMayorEdad).where(eq(ciudadanoMayorEdad.id_ciudadano, idCiudadano));
}

// =====================================================================
// CIUDADANO MENOR DE EDAD
// =====================================================================

interface JoinedMenorRow {
  id_menor: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string;
  sexo: CiudadanoMenorDetalle['sexo'];
  tipo_sangre: CiudadanoMenorDetalle['tipo_sangre'];
  estatura: number;
  domicilio: string;
  parroquia_id: number | null;
  municipio_id: number | null;
  estado_id: number | null;
  etnia_id: number | null;
  padre_id: number | null;
  nombre_etnia: string | null;
  nombre_estado: string | null;
  nombre_municipio: string | null;
  nombre_parroquia: string | null;
  rep_id_ciudadano: number | null;
  rep_primer_nombre: string | null;
  rep_segundo_nombre: string | null;
  rep_primer_apellido: string | null;
  rep_segundo_apellido: string | null;
  rep_c_i: number | null;
  rep_telefono_celular: string | null;
  rep_telefono_domicilio: string | null;
}

function mapMenorRow(row: JoinedMenorRow): CiudadanoMenorDetalle {
  const representante: RepresentanteResumen | null =
    row.rep_id_ciudadano !== null &&
    row.rep_primer_nombre !== null &&
    row.rep_primer_apellido !== null &&
    row.rep_c_i !== null
      ? {
          id_ciudadano: row.rep_id_ciudadano,
          primer_nombre: row.rep_primer_nombre,
          segundo_nombre: row.rep_segundo_nombre,
          primer_apellido: row.rep_primer_apellido,
          segundo_apellido: row.rep_segundo_apellido,
          c_i: row.rep_c_i,
          telefono_celular: row.rep_telefono_celular,
          telefono_domicilio: row.rep_telefono_domicilio,
        }
      : null;

  return {
    id_menor: row.id_menor,
    primer_nombre: row.primer_nombre,
    segundo_nombre: row.segundo_nombre,
    primer_apellido: row.primer_apellido,
    segundo_apellido: row.segundo_apellido,
    fecha_nacimiento: row.fecha_nacimiento,
    sexo: row.sexo,
    tipo_sangre: row.tipo_sangre,
    estatura: row.estatura,
    domicilio: row.domicilio,
    parroquia_id: row.parroquia_id,
    municipio_id: row.municipio_id,
    estado_id: row.estado_id,
    etnia_id: row.etnia_id,
    padre_id: row.padre_id,
    nombre_etnia: row.nombre_etnia,
    nombre_estado: row.nombre_estado,
    nombre_municipio: row.nombre_municipio,
    nombre_parroquia: row.nombre_parroquia,
    representante,
  };
}

async function queryCiudadanosMenores(
  conditions: SQL[],
  pagination?: { limit: number; offset: number },
): Promise<CiudadanoMenorDetalle[]> {
  const baseQuery = db
    .select({
      id_menor: ciudadanoMenorEdad.id_menor,
      primer_nombre: ciudadanoMenorEdad.primer_nombre,
      segundo_nombre: ciudadanoMenorEdad.segundo_nombre,
      primer_apellido: ciudadanoMenorEdad.primer_apellido,
      segundo_apellido: ciudadanoMenorEdad.segundo_apellido,
      fecha_nacimiento: ciudadanoMenorEdad.fecha_nacimiento,
      sexo: ciudadanoMenorEdad.sexo,
      tipo_sangre: ciudadanoMenorEdad.tipo_sangre,
      estatura: ciudadanoMenorEdad.estatura,
      domicilio: ciudadanoMenorEdad.domicilio,
      parroquia_id: ciudadanoMenorEdad.parroquia_id,
      municipio_id: ciudadanoMenorEdad.municipio_id,
      estado_id: ciudadanoMenorEdad.estado_id,
      etnia_id: ciudadanoMenorEdad.etnia_id,
      padre_id: ciudadanoMenorEdad.padre_id,
      nombre_etnia: etnias.nombre_etnia,
      nombre_estado: estados.nombre_estado,
      nombre_municipio: municipios.nombre_municipio,
      nombre_parroquia: parroquias.nombre_parroquia,
      rep_id_ciudadano: ciudadanoMayorEdad.id_ciudadano,
      rep_primer_nombre: ciudadanoMayorEdad.primer_nombre,
      rep_segundo_nombre: ciudadanoMayorEdad.segundo_nombre,
      rep_primer_apellido: ciudadanoMayorEdad.primer_apellido,
      rep_segundo_apellido: ciudadanoMayorEdad.segundo_apellido,
      rep_c_i: ciudadanoMayorEdad.c_i,
      rep_telefono_celular: ciudadanoMayorEdad.telefono_celular,
      rep_telefono_domicilio: ciudadanoMayorEdad.telefono_domicilio,
    })
    .from(ciudadanoMenorEdad)
    .leftJoin(etnias, eq(etnias.id_etnia, ciudadanoMenorEdad.etnia_id))
    .leftJoin(estados, eq(estados.id_estado, ciudadanoMenorEdad.estado_id))
    .leftJoin(municipios, eq(municipios.id_municipio, ciudadanoMenorEdad.municipio_id))
    .leftJoin(parroquias, eq(parroquias.id_parroquia, ciudadanoMenorEdad.parroquia_id))
    .leftJoin(ciudadanoMayorEdad, eq(ciudadanoMayorEdad.id_ciudadano, ciudadanoMenorEdad.padre_id));

  const filtered = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  const ordered = filtered.orderBy(
    asc(ciudadanoMenorEdad.primer_apellido),
    asc(ciudadanoMenorEdad.primer_nombre),
  );

  const rows = pagination
    ? await ordered.limit(pagination.limit).offset(pagination.offset)
    : await ordered;

  return rows.map(mapMenorRow);
}

export async function listCiudadanosMenores(
  filters: CiudadanosMenoresQuery,
): Promise<CiudadanoMenorDetalle[]> {
  const conditions: SQL[] = [];

  if (filters.padre_id !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.padre_id, filters.padre_id));
  }
  if (filters.padre_ci !== undefined) {
    conditions.push(eq(ciudadanoMayorEdad.c_i, filters.padre_ci));
  }
  if (filters.estado_id !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.estado_id, filters.estado_id));
  }
  if (filters.municipio_id !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.municipio_id, filters.municipio_id));
  }
  if (filters.parroquia_id !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.parroquia_id, filters.parroquia_id));
  }
  if (filters.etnia_id !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.etnia_id, filters.etnia_id));
  }
  if (filters.sexo !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.sexo, filters.sexo));
  }
  if (filters.tipo_sangre !== undefined) {
    conditions.push(eq(ciudadanoMenorEdad.tipo_sangre, filters.tipo_sangre));
  }
  if (filters.search) {
    const pattern = sanitizeSearchPattern(filters.search);
    const searchCondition = or(
      like(ciudadanoMenorEdad.primer_nombre, pattern),
      like(ciudadanoMenorEdad.segundo_nombre, pattern),
      like(ciudadanoMenorEdad.primer_apellido, pattern),
      like(ciudadanoMenorEdad.segundo_apellido, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return queryCiudadanosMenores(conditions, {
    limit: filters.limit,
    offset: filters.offset,
  });
}

export async function listMenoresByPadreId(padreId: number): Promise<CiudadanoMenorDetalle[]> {
  await assertRepresentanteExists(padreId);
  return queryCiudadanosMenores([eq(ciudadanoMenorEdad.padre_id, padreId)]);
}

export async function getCiudadanoMenorById(idMenor: number): Promise<CiudadanoMenorDetalle> {
  const rows = await queryCiudadanosMenores([eq(ciudadanoMenorEdad.id_menor, idMenor)]);
  const menor = rows[0];
  if (!menor) {
    throw new NotFoundError(`El ciudadano menor de edad con ID ${idMenor} no existe.`);
  }

  return menor;
}

export async function createCiudadanoMenor(
  input: CreateCiudadanoMenorBody,
): Promise<CiudadanoMenorDetalle> {
  assertMenorEdadAge(input.fecha_nacimiento);

  await Promise.all([
    assertRepresentanteExists(input.padre_id),
    assertEtniaExists(input.etnia_id),
    validateUbicacionGeografica({
      estado_id: input.estado_id,
      municipio_id: input.municipio_id,
      parroquia_id: input.parroquia_id,
    }),
  ]);

  const [created] = await db
    .insert(ciudadanoMenorEdad)
    .values({
      primer_nombre: input.primer_nombre,
      segundo_nombre: input.segundo_nombre ?? null,
      primer_apellido: input.primer_apellido,
      segundo_apellido: input.segundo_apellido ?? null,
      fecha_nacimiento: input.fecha_nacimiento,
      sexo: input.sexo,
      tipo_sangre: input.tipo_sangre,
      estatura: input.estatura,
      domicilio: input.domicilio,
      parroquia_id: input.parroquia_id,
      municipio_id: input.municipio_id,
      estado_id: input.estado_id,
      etnia_id: input.etnia_id,
      padre_id: input.padre_id,
    })
    .$returningId();

  if (!created) {
    throw new Error('No se pudo obtener el identificador del ciudadano menor creado.');
  }

  return getCiudadanoMenorById(created.id_menor);
}

export async function updateCiudadanoMenor(
  idMenor: number,
  input: UpdateCiudadanoMenorBody,
): Promise<CiudadanoMenorDetalle> {
  const existing = await getCiudadanoMenorById(idMenor);

  if (input.fecha_nacimiento !== undefined) {
    assertMenorEdadAge(input.fecha_nacimiento);
  }

  const validations: Promise<void>[] = [];

  if (input.padre_id !== undefined) {
    validations.push(assertRepresentanteExists(input.padre_id));
  }
  if (input.etnia_id !== undefined) {
    validations.push(assertEtniaExists(input.etnia_id));
  }
  if (
    input.estado_id !== undefined ||
    input.municipio_id !== undefined ||
    input.parroquia_id !== undefined
  ) {
    const estadoId = input.estado_id ?? existing.estado_id;
    const municipioId = input.municipio_id ?? existing.municipio_id;
    const parroquiaId = input.parroquia_id ?? existing.parroquia_id;

    if (estadoId === null || municipioId === null || parroquiaId === null) {
      throw new BadRequestError(
        'Debe especificar estado_id, municipio_id y parroquia_id completos.',
      );
    }

    validations.push(
      validateUbicacionGeografica({
        estado_id: estadoId,
        municipio_id: municipioId,
        parroquia_id: parroquiaId,
      }),
    );
  }

  await Promise.all(validations);

  await db
    .update(ciudadanoMenorEdad)
    .set({
      ...(input.primer_nombre !== undefined ? { primer_nombre: input.primer_nombre } : {}),
      ...(input.segundo_nombre !== undefined ? { segundo_nombre: input.segundo_nombre } : {}),
      ...(input.primer_apellido !== undefined ? { primer_apellido: input.primer_apellido } : {}),
      ...(input.segundo_apellido !== undefined ? { segundo_apellido: input.segundo_apellido } : {}),
      ...(input.fecha_nacimiento !== undefined ? { fecha_nacimiento: input.fecha_nacimiento } : {}),
      ...(input.sexo !== undefined ? { sexo: input.sexo } : {}),
      ...(input.tipo_sangre !== undefined ? { tipo_sangre: input.tipo_sangre } : {}),
      ...(input.estatura !== undefined ? { estatura: input.estatura } : {}),
      ...(input.domicilio !== undefined ? { domicilio: input.domicilio } : {}),
      ...(input.parroquia_id !== undefined ? { parroquia_id: input.parroquia_id } : {}),
      ...(input.municipio_id !== undefined ? { municipio_id: input.municipio_id } : {}),
      ...(input.estado_id !== undefined ? { estado_id: input.estado_id } : {}),
      ...(input.etnia_id !== undefined ? { etnia_id: input.etnia_id } : {}),
      ...(input.padre_id !== undefined ? { padre_id: input.padre_id } : {}),
    })
    .where(eq(ciudadanoMenorEdad.id_menor, idMenor));

  return getCiudadanoMenorById(idMenor);
}

export async function deleteCiudadanoMenor(idMenor: number): Promise<void> {
  await getCiudadanoMenorById(idMenor);

  const [inmunizacionRef, reporteRef] = await Promise.all([
    db
      .select({ id_inmunizacion: inmunizacion.id_inmunizacion })
      .from(inmunizacion)
      .where(eq(inmunizacion.ciudadano_mayor_menor_id, idMenor))
      .limit(1),
    db
      .select({ id_reportes: reportes.id_reportes })
      .from(reportes)
      .where(eq(reportes.ciudadano_menor_id, idMenor))
      .limit(1),
  ]);

  if (inmunizacionRef[0] || reporteRef[0]) {
    throw new ConflictError(
      'No se puede eliminar el ciudadano menor porque posee historial de inmunizaciones o reportes asociados.',
    );
  }

  await db.delete(ciudadanoMenorEdad).where(eq(ciudadanoMenorEdad.id_menor, idMenor));
}
