import { pool } from '../db.mjs';

/** Formatea una cédula entera (`14567890`) en formato con puntos (`14.567.890`). */
export function formatearCedula(ci) {
  if (!ci) return undefined;
  return String(ci).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Modelo de base de datos para `centro_salud`, `autoridades`, `usuarios` y `profesiones` (`example.sql`).
 */
export const CentroSaludModel = {
  /**
   * Obtiene el centro de salud principal de la sesión (`centro_salud`).
   */
  async obtenerCentroPrincipal() {
    const [centrosRows] = await pool.query(`
      SELECT
        id_centro,
        nombre_centro,
        ubicacion_centro,
        codigo_centro,
        id_jefe_centro,
        parroquia_id,
        municipio_id,
        estado_id
      FROM centro_salud
      ORDER BY id_centro ASC
    `);

    const fila = centrosRows[0] || {
      id_centro: 1,
      nombre_centro: 'Centro de Salud La Pastora',
      ubicacion_centro: 'Av. Sucre, Parroquia La Pastora, Municipio Libertador, Distrito Capital',
      codigo_centro: 'CS-DC-001',
      id_jefe_centro: 1,
      parroquia_id: 1,
      municipio_id: 1,
      estado_id: 1,
    };

    return {
      fila,
      dto: {
        idCentro: fila.id_centro,
        nombreCentro: fila.nombre_centro,
        ubicacionCentro: fila.ubicacion_centro,
        codigoCentro: fila.codigo_centro,
        idJefeCentro: fila.id_jefe_centro || 1,
        parroquiaId: fila.parroquia_id ?? 1,
        municipioId: fila.municipio_id ?? 1,
        estadoId: fila.estado_id ?? 1,
      },
    };
  },

  /**
   * Lista las autoridades del centro (`autoridades` + `usuarios` + `profesiones`).
   */
  async listarAutoridadesCentro(
    idJefeCentro = 1,
    nombreCentro = '',
    ubicacionCentro = '',
    codigoCentro = 'CS-DC-001',
    totalHoy = 0,
    totalHistorico = 0,
  ) {
    const [autoridadesRows] = await pool.query(
      `
      SELECT
        a.id_autoridades,
        a.primer_nombre,
        a.segundo_nombre,
        a.primer_apellido,
        a.segundo_apellido,
        a.c_i,
        a.n_impre,
        a.domicilio,
        a.telefono,
        a.usuario_id,
        a.profesion_id,
        u.correo_usuario,
        u.tipo_usuario,
        p.nombre_profesion
      FROM autoridades a
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      LEFT JOIN profesiones p ON p.id_profesion = a.profesion_id
      WHERE u.tipo_usuario = 'centro_salud_jefe' OR a.id_autoridades = ?
      ORDER BY a.id_autoridades ASC
    `,
      [idJefeCentro],
    );

    const jefeNombre = autoridadesRows[0]
      ? `Dra. ${[
          autoridadesRows[0].primer_nombre,
          autoridadesRows[0].segundo_nombre,
          autoridadesRows[0].primer_apellido,
          autoridadesRows[0].segundo_apellido,
        ]
          .filter(Boolean)
          .join(' ')}`
      : 'Dra. María Elena Pérez Mendoza';

    const enfermeros = autoridadesRows.map((aut) => ({
      id: `enf-0${aut.id_autoridades}`,
      idAutoridades: aut.id_autoridades,
      primerNombre: aut.primer_nombre,
      segundoNombre: aut.segundo_nombre,
      primerApellido: aut.primer_apellido,
      segundoApellido: aut.segundo_apellido,
      nombre: `Dra. ${[
        aut.primer_nombre,
        aut.segundo_nombre,
        aut.primer_apellido,
        aut.segundo_apellido,
      ]
        .filter(Boolean)
        .join(' ')}`,
      ci: aut.c_i,
      cedula: formatearCedula(aut.c_i) || String(aut.c_i),
      nImpre: aut.n_impre,
      idProfesional: String(aut.n_impre),
      correo: aut.correo_usuario || 'centro@vih.gob.ve',
      domicilio: aut.domicilio || ubicacionCentro,
      telefono: aut.telefono,
      usuarioId: aut.usuario_id || 2,
      tipoUsuario: aut.tipo_usuario || 'centro_salud_jefe',
      profesionId: String(aut.profesion_id || 1),
      nombreProfesion: aut.nombre_profesion || 'Médico/a cirujano/a',
      centroId: 'centro-la-pastora',
      codigoCentro,
      ubicacionCentro,
      activo: true,
      vacunasAplicadasHoy: totalHoy,
      vacunasAplicadasTotal: 1120 + totalHistorico,
    }));

    return { jefeNombre, enfermeros };
  },
};
