import { pool } from '../db.mjs';

/**
 * Módulo de consultas e inserciones para la Subregión de Salud (/SRS).
 * Mapea: `subregion`, `centro_salud`, `autoridades`, `certificado`, `examenes`,
 * `inmunizacion`, `ciudadano_mayor_edad`, `ciudadano_menor_edad` y geografía.
 */
export const SrsModel = {
  /**
   * Obtiene la sede de la Subregión y su Jefe Titular por ID de estado.
   */
  async obtenerSedePorEstado(estadoId = 1) {
    const [filas] = await pool.query(
      `
      SELECT 
        sr.id_subregion AS idSubregion,
        sr.ubicacion,
        sr.estado_id AS estadoId,
        e.nombre_estado AS nombreEstado,
        sr.municipio_id AS municipioId,
        m.nombre_municipio AS nombreMunicipio,
        sr.parroquia_id AS parroquiaId,
        p.nombre_parroquia AS nombreParroquia,
        sr.id_jefe_subregion AS idJefeSubregion,
        a.primer_nombre AS jefePrimerNombre,
        a.primer_apellido AS jefePrimerApellido,
        a.c_i AS jefeCi,
        a.n_impre AS jefeNimpre,
        a.telefono AS jefeTelefono,
        u.correo_usuario AS jefeCorreo,
        prof.nombre_profesion AS jefeProfesion
      FROM subregion sr
      LEFT JOIN estados e ON e.id_estado = sr.estado_id
      LEFT JOIN municipios m ON m.id_municipio = sr.municipio_id
      LEFT JOIN parroquias p ON p.id_parroquia = sr.parroquia_id
      LEFT JOIN autoridades a ON a.id_autoridades = sr.id_jefe_subregion
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      LEFT JOIN profesiones prof ON prof.id_profesion = a.profesion_id
      WHERE sr.estado_id = ?
    `,
      [estadoId],
    );

    return filas[0] || null;
  },

  /**
   * Lista todos los Centros de Salud adscritos a la Subregión del estado.
   */
  async listarCentrosAdscritos(estadoId = 1) {
    const [filas] = await pool.query(
      `
      SELECT 
        cs.id_centro AS idCentro,
        cs.codigo_centro AS codigoCentro,
        cs.nombre_centro AS nombreCentro,
        cs.ubicacion_centro AS ubicacionCentro,
        cs.estado_id AS estadoId,
        cs.municipio_id AS municipioId,
        m.nombre_municipio AS municipioNombre,
        cs.parroquia_id AS parroquiaId,
        p.nombre_parroquia AS parroquiaNombre,
        cs.id_jefe_centro AS idJefeCentro,
        a.c_i AS jefeCi,
        a.n_impre AS jefeNimpre,
        a.telefono AS jefeTelefono,
        CONCAT_WS(' ', a.primer_nombre, a.primer_apellido) AS jefeNombreCompleto,
        prof.nombre_profesion AS jefeProfesion,
        (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.centro_salud_aplicacion = cs.id_centro) AS totalInmunizaciones
      FROM centro_salud cs
      LEFT JOIN municipios m ON m.id_municipio = cs.municipio_id
      LEFT JOIN parroquias p ON p.id_parroquia = cs.parroquia_id
      LEFT JOIN autoridades a ON a.id_autoridades = cs.id_jefe_centro
      LEFT JOIN profesiones prof ON prof.id_profesion = a.profesion_id
      WHERE cs.estado_id = ?
      ORDER BY cs.id_centro ASC
    `,
      [estadoId],
    );

    return filas;
  },

  /**
   * Registra un nuevo centro de salud dentro de la jurisdicción de la subregión.
   */
  async crearCentro(dto) {
    const [res] = await pool.query(
      `
      INSERT INTO centro_salud (
        nombre_centro, codigo_centro, ubicacion_centro,
        estado_id, municipio_id, parroquia_id, id_jefe_centro
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        dto.nombreCentro,
        dto.codigoCentro,
        dto.ubicacionCentro,
        dto.estadoId,
        dto.municipioId,
        dto.parroquiaId,
        dto.idJefeCentro || null,
      ],
    );

    return { idCentro: res.insertId, ...dto };
  },

  /**
   * Lista el personal médico y autoridades adscritos a los centros del estado.
   */
  async listarPersonalEstadal(estadoId = 1) {
    const [filas] = await pool.query(
      `
      SELECT 
        a.id_autoridades AS idAutoridades,
        a.primer_nombre AS primerNombre,
        a.segundo_nombre AS segundoNombre,
        a.primer_apellido AS primerApellido,
        a.segundo_apellido AS segundoApellido,
        CONCAT_WS(' ', a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido) AS nombreCompleto,
        a.c_i AS ci,
        a.n_impre AS nImpre,
        a.telefono,
        a.domicilio,
        u.correo_usuario AS correo,
        p.id_profesion AS profesionId,
        p.nombre_profesion AS nombreProfesion,
        cs.id_centro AS centroId,
        cs.nombre_centro AS nombreCentro,
        cs.codigo_centro AS codigoCentro,
        m.nombre_municipio AS municipioNombre,
        (cs.id_jefe_centro = a.id_autoridades) AS esJefe
      FROM autoridades a
      INNER JOIN centro_salud cs ON cs.id_jefe_centro = a.id_autoridades OR cs.estado_id = ?
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      LEFT JOIN profesiones p ON p.id_profesion = a.profesion_id
      LEFT JOIN municipios m ON m.id_municipio = cs.municipio_id
      WHERE cs.estado_id = ?
      GROUP BY a.id_autoridades
      ORDER BY a.primer_apellido ASC
    `,
      [estadoId, estadoId],
    );

    return filas;
  },

  /**
   * Registra una nueva autoridad o profesional de salud adscrito a un centro.
   */
  async crearTrabajador(dto) {
    // 1. Crear el usuario del sistema institucional
    const [resUsuario] = await pool.query(
      `
      INSERT INTO usuarios (correo_usuario, contrasena, tipo_usuario)
      VALUES (?, ?, 'centro_salud_jefe')
    `,
      [dto.correo, dto.contrasenaInicial || 'Cambiar2026!'],
    );

    // 2. Crear la autoridad vinculada
    const [resAutoridad] = await pool.query(
      `
      INSERT INTO autoridades (
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        c_i, n_impre, domicilio, telefono, usuario_id, profesion_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        dto.primerNombre,
        dto.segundoNombre || '',
        dto.primerApellido,
        dto.segundoApellido || '',
        dto.ci,
        dto.nImpre,
        dto.domicilio || null,
        dto.telefono,
        resUsuario.insertId,
        dto.profesionId || 1,
      ],
    );

    // 3. Si se marcó como jefe de centro, actualizar `centro_salud`
    if (dto.esJefeCentro && dto.centroId) {
      await pool.query(
        `
        UPDATE centro_salud SET id_jefe_centro = ? WHERE id_centro = ?
      `,
        [resAutoridad.insertId, dto.centroId],
      );
    }

    return { idAutoridades: resAutoridad.insertId, usuarioId: resUsuario.insertId, ...dto };
  },

  /**
   * Lista todos los certificados emitidos o en revisión en el estado.
   */
  async listarCertificados(estadoId = 1) {
    const [filas] = await pool.query(
      `
      SELECT 
        c.id_certificado AS idCertificado,
        c.fecha_emision AS fechaEmision,
        c.estatus,
        c.ciudadano_mayor_id AS ciudadanoId,
        CONCAT_WS(' ', cm.primer_nombre, cm.primer_apellido) AS ciudadanoNombre,
        cm.c_i AS ciudadanoCedula,
        cm.correo_electronico AS ciudadanoCorreo,
        c.examen_id AS examenId,
        ex.nombre_examen AS examenNombre
      FROM certificado c
      LEFT JOIN ciudadano_mayor_edad cm ON cm.id_ciudadano = c.ciudadano_mayor_id
      LEFT JOIN examenes ex ON ex.id_examenes = c.examen_id
      WHERE cm.estado_id = ?
      ORDER BY c.id_certificado DESC
    `,
      [estadoId],
    );

    return filas;
  },

  /**
   * Dictamina (aprueba o rechaza) una solicitud de certificado de salud.
   */
  async revisarCertificado(dto) {
    await pool.query(
      `
      UPDATE certificado 
      SET estatus = ?, fecha_emision = ?
      WHERE id_certificado = ?
    `,
      [dto.estatus, new Date().toISOString().slice(0, 10), dto.idCertificado],
    );

    return { ok: true, idCertificado: dto.idCertificado, estatus: dto.estatus };
  },

  /**
   * Resumen estadístico y telemetría de salud pública del estado.
   */
  async obtenerMetricasEstadales(estadoId = 1) {
    const [[centros]] = await pool.query(
      `
      SELECT COUNT(*) AS total FROM centro_salud WHERE estado_id = ?
    `,
      [estadoId],
    );

    const [[ciudadanos]] = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM ciudadano_mayor_edad WHERE estado_id = ?) +
        (SELECT COUNT(*) FROM ciudadano_menor_edad WHERE estado_id = ?) AS total
    `,
      [estadoId, estadoId],
    );

    const [[certificados]] = await pool.query(
      `
      SELECT 
        SUM(CASE WHEN c.estatus = 'APROBADO' THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN c.estatus = 'RECHAZADO' THEN 1 ELSE 0 END) AS rechazados
      FROM certificado c
      LEFT JOIN ciudadano_mayor_edad cm ON cm.id_ciudadano = c.ciudadano_mayor_id
      WHERE cm.estado_id = ?
    `,
      [estadoId],
    );

    return {
      estadoId,
      totalCentros: centros.total,
      totalCiudadanos: ciudadanos.total,
      certificadosAprobados: certificados.aprobados || 0,
      certificadosRechazados: certificados.rechazados || 0,
    };
  },
};

