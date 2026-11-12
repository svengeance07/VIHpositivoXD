import { pool } from '../db.mjs';

/**
 * Módulo de consultas e inserciones para el rol Personal de Salud (/PS).
 * Basado en las tablas: `ciudadano_mayor_edad`, `ciudadano_menor_edad`, `inmunizacion`,
 * `vacunas`, `reportes`, `sintomas_comunes`, `centro_salud` y `autoridades`.
 */
export const PsModel = {
  /**
   * Obtiene la información del Centro de Salud y su Autoridad/Jefe titular.
   */
  async obtenerCentroPorId(centroId = 1) {
    const [filas] = await pool.query(
      `
      SELECT 
        cs.id_centro AS idCentro,
        cs.nombre_centro AS nombreCentro,
        cs.ubicacion_centro AS ubicacionCentro,
        cs.codigo_centro AS codigoCentro,
        cs.id_jefe_centro AS idJefeCentro,
        a.primer_nombre AS jefeNombre1,
        a.primer_apellido AS jefeApellido1,
        a.c_i AS jefeCi,
        a.n_impre AS jefeNimpre,
        a.telefono AS jefeTelefono,
        u.correo_usuario AS jefeCorreo,
        p.nombre_profesion AS jefeProfesion
      FROM centro_salud cs
      LEFT JOIN autoridades a ON a.id_autoridades = cs.id_jefe_centro
      LEFT JOIN usuarios u ON u.id_usuarios = a.usuario_id
      LEFT JOIN profesiones p ON p.id_profesion = a.profesion_id
      WHERE cs.id_centro = ?
    `,
      [centroId],
    );

    return filas[0] || null;
  },

  /**
   * Lista todos los ciudadanos (adultos y menores) atendidos en el centro.
   */
  async listarPacientes(centroId = 1) {
    const [mayores] = await pool.query(
      `
      SELECT 
        cm.id_ciudadano AS idRegistro,
        false AS esMenor,
        cm.primer_nombre AS primerNombre,
        cm.segundo_nombre AS segundoNombre,
        cm.primer_apellido AS primerApellido,
        cm.segundo_apellido AS segundoApellido,
        CONCAT_WS(' ', cm.primer_nombre, cm.segundo_nombre, cm.primer_apellido, cm.segundo_apellido) AS nombre,
        cm.c_i AS cedula,
        cm.fecha_nacimiento AS fechaNacimiento,
        cm.sexo,
        cm.tipo_sangre AS tipoSangre,
        cm.estatura,
        cm.domicilio,
        e.nombre_estado AS estadoNombre,
        m.nombre_municipio AS municipioNombre,
        p.nombre_parroquia AS parroquiaNombre,
        et.nombre_etnia AS etnia,
        cm.correo_electronico AS correo,
        cm.telefono_celular AS telefonoCelular
      FROM ciudadano_mayor_edad cm
      LEFT JOIN estados e ON e.id_estado = cm.estado_id
      LEFT JOIN municipios m ON m.id_municipio = cm.municipio_id
      LEFT JOIN parroquias p ON p.id_parroquia = cm.parroquia_id
      LEFT JOIN etnias et ON et.id_etnia = cm.etnia_id
      ORDER BY cm.id_ciudadano DESC
    `,
    );

    const [menores] = await pool.query(
      `
      SELECT 
        mn.id_menor AS idRegistro,
        true AS esMenor,
        mn.primer_nombre AS primerNombre,
        mn.segundo_nombre AS segundoNombre,
        mn.primer_apellido AS primerApellido,
        mn.segundo_apellido AS segundoApellido,
        CONCAT_WS(' ', mn.primer_nombre, mn.segundo_nombre, mn.primer_apellido, mn.segundo_apellido) AS nombre,
        mn.fecha_nacimiento AS fechaNacimiento,
        mn.sexo,
        mn.tipo_sangre AS tipoSangre,
        mn.estatura,
        mn.domicilio,
        e.nombre_estado AS estadoNombre,
        m.nombre_municipio AS municipioNombre,
        p.nombre_parroquia AS parroquiaNombre,
        et.nombre_etnia AS etnia,
        mn.padre_id AS padreId,
        CONCAT_WS(' ', rep.primer_nombre, rep.primer_apellido) AS padreNombre,
        rep.c_i AS padreCedula
      FROM ciudadano_menor_edad mn
      LEFT JOIN estados e ON e.id_estado = mn.estado_id
      LEFT JOIN municipios m ON m.id_municipio = mn.municipio_id
      LEFT JOIN parroquias p ON p.id_parroquia = mn.parroquia_id
      LEFT JOIN etnias et ON et.id_etnia = mn.etnia_id
      LEFT JOIN ciudadano_mayor_edad rep ON rep.id_ciudadano = mn.padre_id
      ORDER BY mn.id_menor DESC
    `,
    );

    return [...mayores, ...menores];
  },

  /**
   * Inserta un nuevo ciudadano en `ciudadano_mayor_edad` o `ciudadano_menor_edad`.
   */
  async crearPaciente(dto) {
    if (dto.esMenor) {
      const [res] = await pool.query(
        `
        INSERT INTO ciudadano_menor_edad (
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          fecha_nacimiento, sexo, tipo_sangre, estatura, domicilio,
          parroquia_id, municipio_id, estado_id, etnia_id, padre_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          dto.primerNombre,
          dto.segundoNombre || null,
          dto.primerApellido,
          dto.segundoApellido || null,
          dto.fechaNacimiento,
          dto.sexo,
          dto.tipoSangre,
          dto.estatura || 0,
          dto.domicilio,
          dto.parroquiaId || null,
          dto.municipioId || null,
          dto.estadoId || null,
          dto.etniaId || null,
          dto.padreId || null,
        ],
      );
      return { idMenor: res.insertId, esMenor: true, ...dto };
    }

    const [resMayor] = await pool.query(
      `
      INSERT INTO ciudadano_mayor_edad (
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        c_i, fecha_nacimiento, sexo, tipo_sangre, estatura,
        correo_electronico, telefono_celular, telefono_domicilio, domicilio,
        profesion_id, parroquia_id, municipio_id, estado_id, etnia_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        dto.primerNombre,
        dto.segundoNombre || null,
        dto.primerApellido,
        dto.segundoApellido || null,
        dto.cedula,
        dto.fechaNacimiento,
        dto.sexo,
        dto.tipoSangre,
        dto.estatura || 0,
        dto.correo || null,
        dto.telefonoCelular || null,
        dto.telefonoDomicilio || null,
        dto.domicilio,
        dto.profesionId || null,
        dto.parroquiaId || null,
        dto.municipioId || null,
        dto.estadoId || null,
        dto.etniaId || null,
      ],
    );
    return { idCiudadano: resMayor.insertId, esMenor: false, ...dto };
  },

  /**
   * Registra una nueva dosis aplicada en la tabla `inmunizacion`.
   */
  async registrarInmunizacion(dto) {
    const [res] = await pool.query(
      `
      INSERT INTO inmunizacion (
        numero_dosis, fecha_aplicacion, numero_lote, observaciones,
        centro_salud_aplicacion, vacuna_id, ciudadano_mayor_edad_id, ciudadano_mayor_menor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        dto.dosis,
        dto.fechaAplicacion || new Date().toISOString().slice(0, 10),
        dto.numeroLote,
        dto.observaciones || null,
        dto.centroSaludId || 1,
        dto.vacunaId,
        dto.ciudadanoMayorEdadId || null,
        dto.ciudadanoMenorId || null,
      ],
    );

    return { idInmunizacion: res.insertId, ...dto };
  },

  /**
   * Registra un reporte de reacción adversa (ESAVI) en la tabla `reportes`.
   */
  async crearReporteEsavi(dto) {
    const [res] = await pool.query(
      `
      INSERT INTO reportes (
        nivel_gravedad, recomendaciones, inmunizacion_id,
        ciudadano_mayor_id, ciudadano_menor_id, sintoma_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        dto.gravedad,
        dto.recomendaciones,
        dto.inmunizacionId || null,
        dto.ciudadanoMayorId || null,
        dto.ciudadanoMenorId || null,
        dto.sintomaId || null,
      ],
    );

    return { idReporte: res.insertId, ...dto };
  },
};

