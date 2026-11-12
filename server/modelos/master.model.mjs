import { pool } from '../db.mjs';

/**
 * Módulo de consultas e inserciones para el Administrador Nacional Master (/master).
 * Mapea: `usuarios` ('master'), `subregion`, `centro_salud`, `autoridades`,
 * `vacunas`, `inmunizacion`, `ciudadano_mayor_edad`, `ciudadano_menor_edad`.
 */
export const MasterModel = {
  /**
   * Lista todas las sedes de Subregión de Salud a nivel nacional.
   */
  async listarSubregionesNacionales() {
    const [filas] = await pool.query(`
      SELECT 
        sr.id_subregion AS idSubregion,
        sr.ubicacion,
        sr.estado_id AS estadoId,
        e.nombre_estado AS nombreEstado,
        sr.municipio_id AS municipioId,
        m.nombre_municipio AS nombreMunicipio,
        sr.id_jefe_subregion AS idJefeSubregion,
        CONCAT_WS(' ', a.primer_nombre, a.primer_apellido) AS nombreJefe,
        a.c_i AS ciJefe,
        u.correo_usuario AS correoJefe,
        (SELECT COUNT(*) FROM centro_salud cs WHERE cs.estado_id = sr.estado_id) AS totalCentros
      FROM subregion sr
      LEFT JOIN estados e ON e.id_estado = sr.estado_id
      LEFT JOIN municipios m ON m.id_municipio = sr.municipio_id
      LEFT JOIN autoridades a ON a.id_autoridades = sr.id_jefe_subregion
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      ORDER BY e.nombre_estado ASC
    `);

    return filas;
  },

  /**
   * Crea o actualiza la sede de la Subregión de un estado a nivel nacional.
   */
  async crearSubregionNacional(dto) {
    const [res] = await pool.query(
      `
      INSERT INTO subregion (
        ubicacion, estado_id, municipio_id, parroquia_id, id_jefe_subregion
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        dto.ubicacion,
        dto.estadoId,
        dto.municipioId,
        dto.parroquiaId || null,
        dto.idJefeSubregion || null,
      ],
    );

    return { idSubregion: res.insertId, ...dto };
  },

  /**
   * Lista todos los centros de salud a nivel nacional con filtros opcionales.
   */
  async listarCentrosNacionales(filtroEstadoId = null) {
    let sql = `
      SELECT 
        cs.id_centro AS idCentro,
        cs.codigo_centro AS codigoCentro,
        cs.nombre_centro AS nombreCentro,
        cs.ubicacion_centro AS ubicacionCentro,
        cs.estado_id AS estadoId,
        e.nombre_estado AS nombreEstado,
        cs.municipio_id AS municipioId,
        m.nombre_municipio AS nombreMunicipio,
        cs.id_jefe_centro AS idJefeCentro,
        CONCAT_WS(' ', a.primer_nombre, a.primer_apellido) AS nombreJefe,
        a.c_i AS ciJefe
      FROM centro_salud cs
      LEFT JOIN estados e ON e.id_estado = cs.estado_id
      LEFT JOIN municipios m ON m.id_municipio = cs.municipio_id
      LEFT JOIN autoridades a ON a.id_autoridades = cs.id_jefe_centro
    `;
    const params = [];

    if (filtroEstadoId) {
      sql += ' WHERE cs.estado_id = ?';
      params.push(filtroEstadoId);
    }

    sql += ' ORDER BY cs.nombre_centro ASC';
    const [filas] = await pool.query(sql, params);
    return filas;
  },

  /**
   * Padrón global de autoridades del sector salud a nivel nacional.
   */
  async listarAutoridadesNacionales() {
    const [filas] = await pool.query(`
      SELECT 
        a.id_autoridades AS idAutoridades,
        a.primer_nombre AS primerNombre,
        a.primer_apellido AS primerApellido,
        CONCAT_WS(' ', a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido) AS nombreCompleto,
        a.c_i AS ci,
        a.n_impre AS nImpre,
        a.telefono,
        u.correo_usuario AS correo,
        u.tipo_usuario AS tipoUsuario,
        prof.nombre_profesion AS profesion
      FROM autoridades a
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      LEFT JOIN profesiones prof ON prof.id_profesion = a.profesion_id
      ORDER BY a.primer_apellido ASC
    `);

    return filas;
  },

  /**
   * Catálogo nacional de vacunas y cálculo de stock de dosis.
   */
  async listarCatalogoVacunas() {
    const [filas] = await pool.query(`
      SELECT 
        v.id_vacuna AS idVacuna,
        v.nombre_vacuna AS nombreVacuna,
        v.cantidad_dosis AS cantidadDosis,
        (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.vacuna_id = v.id_vacuna) AS dosisAplicadasTotal
      FROM vacunas v
      ORDER BY v.nombre_vacuna ASC
    `);

    return filas;
  },

  /**
   * Incorpora un nuevo biológico al esquema nacional de inmunización.
   */
  async crearVacunaNacional(dto) {
    const [res] = await pool.query(
      `
      INSERT INTO vacunas (nombre_vacuna, cantidad_dosis)
      VALUES (?, ?)
    `,
      [dto.nombreVacuna, dto.cantidadDosis],
    );

    return { idVacuna: res.insertId, ...dto };
  },

  /**
   * Búsqueda unificada global de ciudadanos (adultos y menores) a nivel nacional.
   */
  async buscarCiudadanosGlobal(termino = '') {
    const term = `%${termino.trim()}%`;

    const [mayores] = await pool.query(
      `
      SELECT 
        cm.id_ciudadano AS idCiudadano,
        false AS esMenor,
        CONCAT_WS(' ', cm.primer_nombre, cm.segundo_nombre, cm.primer_apellido, cm.segundo_apellido) AS nombreCompleto,
        cm.c_i AS cedula,
        cm.fecha_nacimiento AS fechaNacimiento,
        cm.sexo,
        e.nombre_estado AS estadoNombre,
        m.nombre_municipio AS municipioNombre,
        (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.ciudadano_mayor_edad_id = cm.id_ciudadano) AS totalDosisAplicadas
      FROM ciudadano_mayor_edad cm
      LEFT JOIN estados e ON e.id_estado = cm.estado_id
      LEFT JOIN municipios m ON m.id_municipio = cm.municipio_id
      WHERE CAST(cm.c_i AS CHAR) LIKE ? OR cm.primer_nombre LIKE ? OR cm.primer_apellido LIKE ?
      LIMIT 25
    `,
      [term, term, term],
    );

    const [menores] = await pool.query(
      `
      SELECT 
        mn.id_menor AS idCiudadano,
        true AS esMenor,
        CONCAT_WS(' ', mn.primer_nombre, mn.segundo_nombre, mn.primer_apellido, mn.segundo_apellido) AS nombreCompleto,
        NULL AS cedula,
        mn.fecha_nacimiento AS fechaNacimiento,
        mn.sexo,
        e.nombre_estado AS estadoNombre,
        m.nombre_municipio AS municipioNombre,
        (SELECT COUNT(*) FROM inmunizacion inm WHERE inm.ciudadano_mayor_menor_id = mn.id_menor) AS totalDosisAplicadas
      FROM ciudadano_menor_edad mn
      LEFT JOIN estados e ON e.id_estado = mn.estado_id
      LEFT JOIN municipios m ON m.id_municipio = mn.municipio_id
      WHERE mn.primer_nombre LIKE ? OR mn.primer_apellido LIKE ?
      LIMIT 25
    `,
      [term, term],
    );

    return [...mayores, ...menores];
  },

  /**
   * Telemetría macro e indicadores agregados a nivel nacional.
   */
  async obtenerMetricasNacionales() {
    const [[subregiones]] = await pool.query('SELECT COUNT(*) AS total FROM subregion');
    const [[centros]] = await pool.query('SELECT COUNT(*) AS total FROM centro_salud');
    const [[autoridades]] = await pool.query('SELECT COUNT(*) AS total FROM autoridades');
    const [[dosis]] = await pool.query('SELECT COUNT(*) AS total FROM inmunizacion');

    const [rankingEstados] = await pool.query(`
      SELECT 
        e.id_estado AS estadoId,
        e.nombre_estado AS estadoNombre,
        COUNT(inm.id_inmunizacion) AS totalDosis
      FROM estados e
      LEFT JOIN centro_salud cs ON cs.estado_id = e.id_estado
      LEFT JOIN inmunizacion inm ON inm.centro_salud_aplicacion = cs.id_centro
      GROUP BY e.id_estado, e.nombre_estado
      ORDER BY totalDosis DESC
      LIMIT 10
    `);

    return {
      totalSubregiones: subregiones.total,
      totalCentros: centros.total,
      totalAutoridades: autoridades.total,
      totalDosisAplicadasNacional: dosis.total,
      rankingDosisPorEstado: rankingEstados,
    };
  },
};

