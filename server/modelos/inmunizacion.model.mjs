import { obtenerColumnaMenorInmunizacion, pool } from '../db.mjs';
import { formatearCedula } from './centro-salud.model.mjs';
import { VacunaModel } from './vacuna.model.mjs';

/**
 * Modelo de base de datos para la tabla `inmunizacion` (`example.sql`).
 */
export const InmunizacionModel = {
  /**
   * Lista todos los registros de `inmunizacion` unidos con `vacunas`, `centro_salud`,
   * `ciudadano_mayor_edad` y `ciudadano_menor_edad`.
   */
  async listar(
    nombreCentroPorDefecto = 'Centro de Salud La Pastora',
    jefeNombre = 'Dra. María Elena Pérez Mendoza',
  ) {
    const colMenor = await obtenerColumnaMenorInmunizacion();

    const [inmunizacionesRows] = await pool.query(`
      SELECT
        i.id_inmunizacion,
        i.numero_dosis,
        i.fecha_aplicacion,
        i.numero_lote,
        i.observaciones,
        i.centro_salud_aplicacion,
        i.vacuna_id,
        i.ciudadano_mayor_edad_id,
        i.\`${colMenor}\` AS ciudadano_menor_id,
        v.nombre_vacuna,
        cs.nombre_centro,
        cm.c_i AS mayor_ci,
        CONCAT_WS(' ', cm.primer_nombre, cm.segundo_nombre, cm.primer_apellido, cm.segundo_apellido) AS mayor_nombre,
        CONCAT_WS(' ', mn.primer_nombre, mn.segundo_nombre, mn.primer_apellido, mn.segundo_apellido) AS menor_nombre
      FROM inmunizacion i
      LEFT JOIN vacunas v ON v.id_vacuna = i.vacuna_id
      LEFT JOIN centro_salud cs ON cs.id_centro = i.centro_salud_aplicacion
      LEFT JOIN ciudadano_mayor_edad cm ON cm.id_ciudadano = i.ciudadano_mayor_edad_id
      LEFT JOIN ciudadano_menor_edad mn ON mn.id_menor = i.\`${colMenor}\`
      ORDER BY i.id_inmunizacion DESC
    `);

    return inmunizacionesRows.map((row) => {
      const esMenor = Boolean(row.ciudadano_menor_id && !row.ciudadano_mayor_edad_id);
      const pacienteId = esMenor
        ? `menor-${row.ciudadano_menor_id}`
        : `mayor-${row.ciudadano_mayor_edad_id || 101}`;
      return {
        id: `inm-${row.id_inmunizacion}`,
        idInmunizacion: row.id_inmunizacion,
        pacienteId,
        ciudadanoMayorId: row.ciudadano_mayor_edad_id || undefined,
        ciudadanoMenorId: row.ciudadano_menor_id || undefined,
        pacienteCedula: esMenor
          ? `ID-MENOR-${row.ciudadano_menor_id}`
          : formatearCedula(row.mayor_ci) || 'S/C',
        pacienteNombre: (esMenor ? row.menor_nombre : row.mayor_nombre) || 'Ciudadano Registrado',
        esMenor,
        vacunaId: `vac-${row.vacuna_id}`,
        vacunaNombre: row.nombre_vacuna || 'Vacuna',
        dosis: row.numero_dosis,
        lote: row.numero_lote || 'LOTE-2026',
        fechaAplicacion: row.fecha_aplicacion || '2026-10-27',
        observaciones: row.observaciones || undefined,
        centroId: 'centro-la-pastora',
        centroNombre: row.nombre_centro || nombreCentroPorDefecto,
        enfermeroId: 'enf-01',
        enfermeroNombre: jefeNombre,
      };
    });
  },

  /**
   * Inserta un nuevo registro en la tabla `inmunizacion` (y asegura que `vacuna_id` exista en `vacunas`).
   */
  async crear(datos) {
    const colMenor = await obtenerColumnaMenorInmunizacion();

    let vacunaIdNum = Number(String(datos.vacunaId || '').replace(/\D/g, '')) || 1;
    if (datos.vacunaNombre) {
      const vacuna = await VacunaModel.obtenerOCrear({
        nombre: datos.vacunaNombre,
        dosisMaximas: datos.dosis || 1,
      });
      vacunaIdNum = vacuna.idVacuna;
    }

    const [resultado] = await pool.query(
      `INSERT INTO inmunizacion (
        numero_dosis, fecha_aplicacion, numero_lote, observaciones,
        centro_salud_aplicacion, vacuna_id, ciudadano_mayor_edad_id, \`${colMenor}\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(datos.dosis || 1),
        datos.fechaAplicacion || '2026-10-27',
        String(datos.lote || 'LOTE-2026').slice(0, 30),
        datos.observaciones || 'Dosis aplicada sin eventualidades.',
        1,
        vacunaIdNum,
        datos.esMenor ? null : Number(datos.ciudadanoMayorId || 101),
        datos.esMenor ? Number(datos.ciudadanoMenorId || 201) : null,
      ],
    );

    return {
      id: `inm-${resultado.insertId}`,
      idInmunizacion: resultado.insertId,
    };
  },
};
