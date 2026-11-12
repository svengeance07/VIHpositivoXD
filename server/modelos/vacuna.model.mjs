import { pool } from '../db.mjs';

/**
 * Modelo de base de datos para la tabla `vacunas` (`id_vacuna`, `nombre_vacuna`, `cantidad_dosis`).
 */
export const VacunaModel = {
  /**
   * Lista todas las vacunas registradas en `vacunas`.
   */
  async listar() {
    const [vacunasRows] = await pool.query(`
      SELECT id_vacuna, nombre_vacuna, cantidad_dosis
      FROM vacunas
      ORDER BY id_vacuna ASC
    `);

    return vacunasRows.map((v) => {
      const prefijo = v.nombre_vacuna
        .slice(0, 4)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'V');
      return {
        id: `vac-${v.id_vacuna}`,
        idVacuna: v.id_vacuna,
        nombre: v.nombre_vacuna,
        dosisMaximas: v.cantidad_dosis,
        lotesDisponibles: [`${prefijo}-260${v.id_vacuna}`, `${prefijo}-261${v.id_vacuna}`],
      };
    });
  },

  /**
   * Busca una vacuna por nombre o la crea si no existe en `vacunas`.
   */
  async obtenerOCrear({ nombre, dosisMaximas = 1, loteInicial }) {
    const nombreVacuna = String(nombre || '')
      .trim()
      .slice(0, 100);
    const cantidadDosis = Math.max(1, Math.min(10, Number(dosisMaximas || 1)));

    const [[existente]] = await pool.query(
      'SELECT id_vacuna, nombre_vacuna, cantidad_dosis FROM vacunas WHERE LOWER(nombre_vacuna) = LOWER(?) LIMIT 1',
      [nombreVacuna],
    );

    let idVacuna = existente?.id_vacuna;
    const dosisFinal = existente?.cantidad_dosis ?? cantidadDosis;

    if (!idVacuna) {
      const [resultado] = await pool.query(
        'INSERT INTO vacunas (nombre_vacuna, cantidad_dosis) VALUES (?, ?)',
        [nombreVacuna, cantidadDosis],
      );
      idVacuna = resultado.insertId;
    }

    const prefijo = nombreVacuna
      .slice(0, 4)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'V');
    const lotePersonalizado = String(loteInicial || '')
      .trim()
      .toUpperCase()
      .slice(0, 10);
    const lotesDisponibles = lotePersonalizado
      ? [lotePersonalizado, `${prefijo}-261${idVacuna}`]
      : [`${prefijo}-260${idVacuna}`, `${prefijo}-261${idVacuna}`];

    return {
      id: `vac-${idVacuna}`,
      idVacuna,
      nombre: existente?.nombre_vacuna ?? nombreVacuna,
      dosisMaximas: dosisFinal,
      lotesDisponibles,
    };
  },
};
