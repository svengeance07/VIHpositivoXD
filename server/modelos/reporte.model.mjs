import { pool } from '../db.mjs';
import { formatearCedula } from './centro-salud.model.mjs';

/**
 * Modelo de base de datos para las tablas `reportes` y `sintomas_comunes` (`example.sql`).
 */
export const ReporteModel = {
  /**
   * Lista el catálogo de `sintomas_comunes`.
   */
  async listarSintomasComunes() {
    const [sintomasRows] = await pool.query(`
      SELECT id_sintoma, descripcion_sintoma
      FROM sintomas_comunes
      ORDER BY id_sintoma ASC
    `);

    return sintomasRows.map((s) => ({
      idSintoma: s.id_sintoma,
      descripcionSintoma: s.descripcion_sintoma,
    }));
  },

  /**
   * Lista todos los eventos adversos registrados en `reportes` unidos con `sintomas_comunes`,
   * `inmunizacion`, `vacunas`, `ciudadano_mayor_edad` y `ciudadano_menor_edad`.
   */
  async listar(jefeNombre = 'Dra. María Elena Pérez Mendoza') {
    const [reportesRows] = await pool.query(`
      SELECT
        r.id_reportes,
        r.nivel_gravedad,
        r.recomendaciones,
        r.inmunizacion_id,
        r.ciudadano_mayor_id,
        r.ciudadano_menor_id,
        r.sintoma_id,
        sc.descripcion_sintoma,
        i.vacuna_id,
        i.numero_lote,
        i.fecha_aplicacion,
        v.nombre_vacuna,
        cm.c_i AS mayor_ci,
        CONCAT_WS(' ', cm.primer_nombre, cm.segundo_nombre, cm.primer_apellido, cm.segundo_apellido) AS mayor_nombre,
        CONCAT_WS(' ', mn.primer_nombre, mn.segundo_nombre, mn.primer_apellido, mn.segundo_apellido) AS menor_nombre
      FROM reportes r
      LEFT JOIN sintomas_comunes sc ON sc.id_sintoma = r.sintoma_id
      LEFT JOIN inmunizacion i ON i.id_inmunizacion = r.inmunizacion_id
      LEFT JOIN vacunas v ON v.id_vacuna = i.vacuna_id
      LEFT JOIN ciudadano_mayor_edad cm ON cm.id_ciudadano = r.ciudadano_mayor_id
      LEFT JOIN ciudadano_menor_edad mn ON mn.id_menor = r.ciudadano_menor_id
      ORDER BY r.id_reportes DESC
    `);

    return reportesRows.map((row) => {
      const esMenor = Boolean(row.ciudadano_menor_id && !row.ciudadano_mayor_id);
      const pacienteId = esMenor
        ? `menor-${row.ciudadano_menor_id}`
        : `mayor-${row.ciudadano_mayor_id || 101}`;
      return {
        id: `rep-${row.id_reportes}`,
        idReporte: row.id_reportes,
        inmunizacionId: `inm-${row.inmunizacion_id || 101}`,
        pacienteId,
        ciudadanoMayorId: row.ciudadano_mayor_id ?? null,
        ciudadanoMenorId: row.ciudadano_menor_id ?? null,
        esMenor,
        pacienteCedula: esMenor
          ? `ID-MENOR-${row.ciudadano_menor_id}`
          : formatearCedula(row.mayor_ci) || 'S/C',
        pacienteNombre: (esMenor ? row.menor_nombre : row.mayor_nombre) || 'Ciudadano Registrado',
        vacunaId: `vac-${row.vacuna_id || 1}`,
        vacunaNombre: row.nombre_vacuna || 'Vacuna',
        lote: row.numero_lote || 'LOTE-2026',
        fechaAplicacion: row.fecha_aplicacion || '2026-10-27',
        sintomas: row.descripcion_sintoma ? [row.descripcion_sintoma] : ['Reacción local'],
        recomendaciones: row.recomendaciones,
        indicacionesDictadas: row.recomendaciones,
        gravedad: String(row.nivel_gravedad || 'LEVE').toLowerCase(),
        fechaReporte: row.fecha_aplicacion || '2026-10-27',
        enfermeroId: 'enf-01',
        enfermeroNombre: jefeNombre,
        centroId: 'centro-la-pastora',
        subregionDestinoId: 'srs-distrito-capital',
        estadoSubregion: 'enviado',
      };
    });
  },

  /**
   * Inserta un nuevo registro en `reportes` (y crea el síntoma en `sintomas_comunes` si no existe).
   */
  async crear(datos) {
    const primerSintoma =
      Array.isArray(datos.sintomas) && datos.sintomas[0]
        ? datos.sintomas[0]
        : 'Reacción adversa local';

    const [[sintomaRow]] = await pool.query(
      'SELECT id_sintoma FROM sintomas_comunes WHERE descripcion_sintoma = ? LIMIT 1',
      [primerSintoma],
    );

    let sintomaId = sintomaRow?.id_sintoma;
    if (!sintomaId) {
      const [insSintoma] = await pool.query(
        'INSERT INTO sintomas_comunes (descripcion_sintoma) VALUES (?)',
        [primerSintoma.slice(0, 255)],
      );
      sintomaId = insSintoma.insertId;
    }

    const inmIdNum = Number(String(datos.inmunizacionId || '').replace(/\D/g, '')) || 101;
    const nivelGravedad = String(datos.gravedad || 'leve').toUpperCase();

    const [resultado] = await pool.query(
      `INSERT INTO reportes (
        nivel_gravedad, recomendaciones, inmunizacion_id,
        ciudadano_mayor_id, ciudadano_menor_id, sintoma_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ['LEVE', 'MODERADO', 'SEVERO'].includes(nivelGravedad) ? nivelGravedad : 'LEVE',
        String(datos.recomendaciones || datos.indicacionesDictadas || '').slice(0, 255),
        inmIdNum,
        datos.esMenor ? null : Number(datos.ciudadanoMayorId || 101),
        datos.esMenor ? Number(datos.ciudadanoMenorId || 201) : null,
        sintomaId,
      ],
    );

    return {
      id: `rep-${resultado.insertId}`,
      idReporte: resultado.insertId,
    };
  },
};
