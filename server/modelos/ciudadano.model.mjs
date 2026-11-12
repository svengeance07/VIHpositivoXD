import { pool } from '../db.mjs';
import { formatearCedula } from './centro-salud.model.mjs';

/**
 * Modelo de base de datos para `ciudadano_mayor_edad` y `ciudadano_menor_edad` (`example.sql`).
 */
export const CiudadanoModel = {
  /**
   * Lista todos los pacientes adultos (`ciudadano_mayor_edad`) y menores (`ciudadano_menor_edad`)
   * con sus relaciones hacia `profesiones`, `parroquias`, `municipios`, `estados`, `etnias` y `padre_id`.
   */
  async listarTodos() {
    const [mayoresRows] = await pool.query(`
      SELECT
        cm.*,
        pr.nombre_profesion,
        pa.nombre_parroquia,
        mu.nombre_municipio,
        es.nombre_estado,
        et.nombre_etnia
      FROM ciudadano_mayor_edad cm
      LEFT JOIN profesiones pr ON pr.id_profesion = cm.profesion_id
      LEFT JOIN parroquias pa ON pa.id_parroquia = cm.parroquia_id
      LEFT JOIN municipios mu ON mu.id_municipio = cm.municipio_id
      LEFT JOIN estados es ON es.id_estado = cm.estado_id
      LEFT JOIN etnias et ON et.id_etnia = cm.etnia_id
      ORDER BY cm.id_ciudadano DESC
    `);

    const [menoresRows] = await pool.query(`
      SELECT
        mn.*,
        pa.nombre_parroquia,
        mu.nombre_municipio,
        es.nombre_estado,
        et.nombre_etnia,
        pad.c_i AS padre_ci,
        CONCAT_WS(' ', pad.primer_nombre, pad.segundo_nombre, pad.primer_apellido, pad.segundo_apellido) AS padre_nombre
      FROM ciudadano_menor_edad mn
      LEFT JOIN parroquias pa ON pa.id_parroquia = mn.parroquia_id
      LEFT JOIN municipios mu ON mu.id_municipio = mn.municipio_id
      LEFT JOIN estados es ON es.id_estado = mn.estado_id
      LEFT JOIN etnias et ON et.id_etnia = mn.etnia_id
      LEFT JOIN ciudadano_mayor_edad pad ON pad.id_ciudadano = mn.padre_id
      ORDER BY mn.id_menor DESC
    `);

    const pacientesMayores = mayoresRows.map((row) => ({
      id: `mayor-${row.id_ciudadano}`,
      idRegistro: row.id_ciudadano,
      esMenor: false,
      primerNombre: row.primer_nombre,
      segundoNombre: row.segundo_nombre || '',
      primerApellido: row.primer_apellido,
      segundoApellido: row.segundo_apellido || '',
      nombre: [row.primer_nombre, row.segundo_nombre, row.primer_apellido, row.segundo_apellido]
        .filter(Boolean)
        .join(' '),
      cedula: formatearCedula(row.c_i),
      fechaNacimiento: row.fecha_nacimiento,
      sexo: row.sexo,
      tipoSangre: row.tipo_sangre,
      estatura: row.estatura,
      correo: row.correo_electronico || undefined,
      telefonoCelular: row.telefono_celular || undefined,
      telefonoDomicilio: row.telefono_domicilio || undefined,
      domicilio: row.domicilio,
      profesionId: String(row.profesion_id || 1),
      ocupacion: row.nombre_profesion || 'No especificada',
      estadoId: String(row.estado_id || 1),
      estadoNombre: row.nombre_estado || 'Distrito Capital',
      municipioId: String(row.municipio_id || 1),
      municipioNombre: row.nombre_municipio || 'Libertador',
      parroquiaId: String(row.parroquia_id || 1),
      parroquiaNombre: row.nombre_parroquia || 'La Pastora',
      etniaId: String(row.etnia_id || 1),
      etnia: row.nombre_etnia || 'Ninguna / No aplica',
      fechaRegistro: '2026-10-27',
    }));

    const pacientesMenores = menoresRows.map((row) => ({
      id: `menor-${row.id_menor}`,
      idRegistro: row.id_menor,
      esMenor: true,
      primerNombre: row.primer_nombre,
      segundoNombre: row.segundo_nombre || '',
      primerApellido: row.primer_apellido,
      segundoApellido: row.segundo_apellido || '',
      nombre: [row.primer_nombre, row.segundo_nombre, row.primer_apellido, row.segundo_apellido]
        .filter(Boolean)
        .join(' '),
      fechaNacimiento: row.fecha_nacimiento,
      sexo: row.sexo,
      tipoSangre: row.tipo_sangre,
      estatura: row.estatura,
      domicilio: row.domicilio,
      estadoId: String(row.estado_id || 1),
      estadoNombre: row.nombre_estado || 'Distrito Capital',
      municipioId: String(row.municipio_id || 1),
      municipioNombre: row.nombre_municipio || 'Libertador',
      parroquiaId: String(row.parroquia_id || 1),
      parroquiaNombre: row.nombre_parroquia || 'La Pastora',
      etniaId: String(row.etnia_id || 1),
      etnia: row.nombre_etnia || 'Ninguna / No aplica',
      padreId: row.padre_id ?? undefined,
      padreNombre: row.padre_nombre || undefined,
      padreCedula: formatearCedula(row.padre_ci),
      fechaRegistro: '2026-10-27',
    }));

    return [...pacientesMayores, ...pacientesMenores];
  },

  /**
   * Crea un nuevo ciudadano en `ciudadano_mayor_edad` o `ciudadano_menor_edad`.
   */
  async crear(datos) {
    const esMenor = Boolean(datos.esMenor);

    const [[parroquiaRow]] = await pool.query(
      'SELECT id_parroquia FROM parroquias WHERE nombre_parroquia = ? LIMIT 1',
      [datos.parroquiaNombre || 'La Pastora'],
    );
    const [[municipioRow]] = await pool.query(
      'SELECT id_municipio FROM municipios WHERE nombre_municipio = ? LIMIT 1',
      [datos.municipioNombre || 'Libertador'],
    );
    const [[estadoRow]] = await pool.query(
      'SELECT id_estado FROM estados WHERE nombre_estado = ? LIMIT 1',
      [datos.estadoNombre || 'Distrito Capital'],
    );
    const [[etniaRow]] = await pool.query(
      'SELECT id_etnia FROM etnias WHERE nombre_etnia = ? LIMIT 1',
      [datos.etnia || 'Ninguna / No aplica'],
    );

    const parroquiaId = parroquiaRow?.id_parroquia ?? 1;
    const municipioId = municipioRow?.id_municipio ?? 1;
    const estadoId = estadoRow?.id_estado ?? 1;
    const etniaId = etniaRow?.id_etnia ?? 1;

    if (!esMenor) {
      const ciLimpia =
        Number(String(datos.cedula || '').replace(/\D/g, '')) ||
        Math.floor(10000000 + Math.random() * 20000000);
      const [[profRow]] = await pool.query(
        'SELECT id_profesion FROM profesiones WHERE nombre_profesion = ? LIMIT 1',
        [datos.ocupacion || 'Desempleado'],
      );
      const profesionId = profRow?.id_profesion ?? 7;

      const [resultado] = await pool.query(
        `INSERT INTO ciudadano_mayor_edad (
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          c_i, fecha_nacimiento, sexo, tipo_sangre, estatura, correo_electronico,
          telefono_celular, telefono_domicilio, domicilio, profesion_id,
          parroquia_id, municipio_id, estado_id, etnia_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datos.primerNombre,
          datos.segundoNombre || null,
          datos.primerApellido,
          datos.segundoApellido || null,
          ciLimpia,
          datos.fechaNacimiento,
          datos.sexo,
          datos.tipoSangre,
          Number(datos.estatura || 165),
          datos.correo || null,
          datos.telefonoCelular || null,
          datos.telefonoDomicilio || null,
          datos.domicilio,
          profesionId,
          parroquiaId,
          municipioId,
          estadoId,
          etniaId,
        ],
      );

      return {
        id: `mayor-${resultado.insertId}`,
        idRegistro: resultado.insertId,
        tabla: 'ciudadano_mayor_edad',
      };
    }

    const [resultado] = await pool.query(
      `INSERT INTO ciudadano_menor_edad (
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        fecha_nacimiento, sexo, tipo_sangre, estatura, domicilio,
        parroquia_id, municipio_id, estado_id, etnia_id, padre_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.primerNombre,
        datos.segundoNombre || null,
        datos.primerApellido,
        datos.segundoApellido || null,
        datos.fechaNacimiento,
        datos.sexo,
        datos.tipoSangre,
        Number(datos.estatura || 105),
        datos.domicilio,
        parroquiaId,
        municipioId,
        estadoId,
        etniaId,
        datos.padreId || null,
      ],
    );

    return {
      id: `menor-${resultado.insertId}`,
      idRegistro: resultado.insertId,
      tabla: 'ciudadano_menor_edad',
    };
  },
};
