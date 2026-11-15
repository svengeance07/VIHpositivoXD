import { eq, type SQL } from 'drizzle-orm';

import { UnauthorizedError } from '../../common/errors.js';
import { autoridades, centroSalud, db, profesiones, subregion, usuarios } from '../../db/index.js';
import { verifyDummyPassword, verifyPassword } from './auth.password.js';
import type {
  AuthUserContext,
  AuthUserProfile,
  AutoridadResumen,
  CentroSaludResumen,
  SubregionResumen,
} from './auth.schemas.js';

interface JoinedAuthRow {
  readonly id_usuarios: number;
  readonly correo_usuario: string | null;
  readonly contrasena: string | null;
  readonly tipo_usuario: AuthUserContext['tipo_usuario'] | null;
  readonly id_autoridades: number | null;
  readonly primer_nombre: string | null;
  readonly segundo_nombre: string | null;
  readonly primer_apellido: string | null;
  readonly segundo_apellido: string | null;
  readonly c_i: number | null;
  readonly n_impre: number | null;
  readonly domicilio: string | null;
  readonly telefono: string | null;
  readonly profesion_id: number | null;
  readonly nombre_profesion: string | null;
  readonly id_centro: number | null;
  readonly nombre_centro: string | null;
  readonly ubicacion_centro: string | null;
  readonly codigo_centro: string | null;
  readonly centro_parroquia_id: number | null;
  readonly centro_municipio_id: number | null;
  readonly centro_estado_id: number | null;
  readonly id_subregion: number | null;
  readonly subregion_ubicacion: string | null;
  readonly subregion_parroquia_id: number | null;
  readonly subregion_municipio_id: number | null;
  readonly subregion_estado_id: number | null;
}

async function fetchUserAuthRow(whereClause: SQL): Promise<JoinedAuthRow | null> {
  const rows = await db
    .select({
      id_usuarios: usuarios.id_usuarios,
      correo_usuario: usuarios.correo_usuario,
      contrasena: usuarios.contrasena,
      tipo_usuario: usuarios.tipo_usuario,
      id_autoridades: autoridades.id_autoridades,
      primer_nombre: autoridades.primer_nombre,
      segundo_nombre: autoridades.segundo_nombre,
      primer_apellido: autoridades.primer_apellido,
      segundo_apellido: autoridades.segundo_apellido,
      c_i: autoridades.c_i,
      n_impre: autoridades.n_impre,
      domicilio: autoridades.domicilio,
      telefono: autoridades.telefono,
      profesion_id: autoridades.profesion_id,
      nombre_profesion: profesiones.nombre_profesion,
      id_centro: centroSalud.id_centro,
      nombre_centro: centroSalud.nombre_centro,
      ubicacion_centro: centroSalud.ubicacion_centro,
      codigo_centro: centroSalud.codigo_centro,
      centro_parroquia_id: centroSalud.parroquia_id,
      centro_municipio_id: centroSalud.municipio_id,
      centro_estado_id: centroSalud.estado_id,
      id_subregion: subregion.id_subregion,
      subregion_ubicacion: subregion.ubicacion,
      subregion_parroquia_id: subregion.parroquia_id,
      subregion_municipio_id: subregion.municipio_id,
      subregion_estado_id: subregion.estado_id,
    })
    .from(usuarios)
    .leftJoin(autoridades, eq(autoridades.usuario_id, usuarios.id_usuarios))
    .leftJoin(profesiones, eq(profesiones.id_profesion, autoridades.profesion_id))
    .leftJoin(centroSalud, eq(centroSalud.id_jefe_centro, autoridades.id_autoridades))
    .leftJoin(subregion, eq(subregion.id_jefe_subregion, autoridades.id_autoridades))
    .where(whereClause)
    .limit(1);

  return rows[0] ?? null;
}

function buildAutoridadResumen(row: JoinedAuthRow): AutoridadResumen | null {
  if (
    row.id_autoridades === null ||
    row.primer_nombre === null ||
    row.segundo_nombre === null ||
    row.primer_apellido === null ||
    row.segundo_apellido === null ||
    row.c_i === null ||
    row.n_impre === null ||
    row.telefono === null
  ) {
    return null;
  }

  return {
    id_autoridades: row.id_autoridades,
    primer_nombre: row.primer_nombre,
    segundo_nombre: row.segundo_nombre,
    primer_apellido: row.primer_apellido,
    segundo_apellido: row.segundo_apellido,
    c_i: row.c_i,
    n_impre: row.n_impre,
    domicilio: row.domicilio,
    telefono: row.telefono,
    profesion_id: row.profesion_id,
    nombre_profesion: row.nombre_profesion,
  };
}

function buildCentroResumen(row: JoinedAuthRow): CentroSaludResumen | null {
  if (
    row.id_centro === null ||
    row.nombre_centro === null ||
    row.ubicacion_centro === null ||
    row.codigo_centro === null
  ) {
    return null;
  }

  return {
    id_centro: row.id_centro,
    nombre_centro: row.nombre_centro,
    ubicacion_centro: row.ubicacion_centro,
    codigo_centro: row.codigo_centro,
    parroquia_id: row.centro_parroquia_id,
    municipio_id: row.centro_municipio_id,
    estado_id: row.centro_estado_id,
  };
}

function buildSubregionResumen(row: JoinedAuthRow): SubregionResumen | null {
  if (row.id_subregion === null || row.subregion_ubicacion === null) {
    return null;
  }

  return {
    id_subregion: row.id_subregion,
    ubicacion: row.subregion_ubicacion,
    parroquia_id: row.subregion_parroquia_id,
    municipio_id: row.subregion_municipio_id,
    estado_id: row.subregion_estado_id,
  };
}

function mapRowToContextAndProfile(
  row: JoinedAuthRow,
): { context: AuthUserContext; profile: AuthUserProfile } | null {
  if (!row.correo_usuario || !row.tipo_usuario) {
    return null;
  }

  const autoridad = buildAutoridadResumen(row);
  const centro = buildCentroResumen(row);
  const subregionEntity = buildSubregionResumen(row);

  const estadoId =
    row.tipo_usuario === 'subregion'
      ? (subregionEntity?.estado_id ?? centro?.estado_id ?? null)
      : (centro?.estado_id ?? subregionEntity?.estado_id ?? null);

  const context: AuthUserContext = {
    id_usuarios: row.id_usuarios,
    correo_usuario: row.correo_usuario,
    tipo_usuario: row.tipo_usuario,
    id_autoridades: autoridad?.id_autoridades ?? null,
    id_centro: centro?.id_centro ?? null,
    id_subregion: subregionEntity?.id_subregion ?? null,
    estado_id: estadoId,
  };

  const profile: AuthUserProfile = {
    ...context,
    autoridad,
    centro_salud: centro,
    subregion: subregionEntity,
  };

  return { context, profile };
}

export async function resolveAuthContextByUserId(userId: number): Promise<AuthUserContext | null> {
  const row = await fetchUserAuthRow(eq(usuarios.id_usuarios, userId));
  if (!row) {
    return null;
  }

  const mapped = mapRowToContextAndProfile(row);
  return mapped ? mapped.context : null;
}

export async function getAuthProfileByUserId(userId: number): Promise<AuthUserProfile> {
  const row = await fetchUserAuthRow(eq(usuarios.id_usuarios, userId));
  const mapped = row ? mapRowToContextAndProfile(row) : null;

  if (!mapped) {
    throw new UnauthorizedError(
      'El usuario autenticado ya no existe o tiene una configuración incompleta.',
    );
  }

  return mapped.profile;
}

export async function authenticateUser(
  correo: string,
  contrasena: string,
): Promise<{ context: AuthUserContext; profile: AuthUserProfile }> {
  const row = await fetchUserAuthRow(eq(usuarios.correo_usuario, correo));

  if (!row || !row.contrasena || !row.tipo_usuario || !row.correo_usuario) {
    await verifyDummyPassword(contrasena);
    throw new UnauthorizedError('Correo electrónico o contraseña incorrectos.');
  }

  const isPasswordValid = await verifyPassword(row.contrasena, contrasena);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Correo electrónico o contraseña incorrectos.');
  }

  const mapped = mapRowToContextAndProfile(row);
  if (!mapped) {
    throw new UnauthorizedError('Correo electrónico o contraseña incorrectos.');
  }

  return mapped;
}
