import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'vacunas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  multipleStatements: true,
};

/** Pool principal conectado a la base de datos `vacunas`. */
export const pool = mysql.createPool(dbConfig);

/**
 * Detecta el nombre real de la columna de menor de edad en la tabla `inmunizacion`
 * (`ciudadano_mayor_menor_id` o `ciudadano_menor_edad_id`), para ser compatible con
 * cualquier variante ejecutada desde `example.sql`.
 */
export async function obtenerColumnaMenorInmunizacion() {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM inmunizacion');
    const nombres = cols.map((c) => c.Field);
    if (nombres.includes('ciudadano_menor_edad_id')) return 'ciudadano_menor_edad_id';
    if (nombres.includes('ciudadano_mayor_menor_id')) return 'ciudadano_mayor_menor_id';
    if (nombres.includes('ciudadano_menor_id')) return 'ciudadano_menor_id';
  } catch {
    // Ignorado si la tabla aún no existe
  }
  return 'ciudadano_mayor_menor_id';
}

/**
 * Verifica la conexión a MySQL, crea la base de datos/tablas de `example.sql` si faltan
 * e inserta catálogos base si la base de datos recién creada está vacía.
 */
export async function inicializarBaseDeDatos() {
  // 1. Conexión inicial sin base de datos para asegurar `CREATE DATABASE IF NOT EXISTS vacunas`
  const connInicial = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  await connInicial.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await connInicial.end();

  // 2. Comprobar si existen las tablas principales; si no, ejecutar `docs/referencias/example.sql`
  const [tablas] = await pool.query('SHOW TABLES');
  if (tablas.length === 0) {
    const sqlPath = path.resolve(__dirname, '../docs/referencias/example.sql');
    const sqlContenido = await fs.readFile(sqlPath, 'utf8');
    await pool.query(sqlContenido);
  }

  // 3. Sembrar catálogos y datos iniciales en `vacunas` si están vacíos
  await sembrarDatosInicialesSiVacio();
}

async function sembrarDatosInicialesSiVacio() {
  const [[{ totalVacunas }]] = await pool.query('SELECT COUNT(*) AS totalVacunas FROM vacunas');
  if (totalVacunas > 0) {
    return;
  }

  // Catálogo `profesiones`
  await pool.query(`
    INSERT INTO profesiones (id_profesion, nombre_profesion) VALUES
      (1, 'Médico/a cirujano/a'),
      (2, 'Licenciado/a en enfermería'),
      (3, 'Ingeniero/a'),
      (4, 'Administrador/a'),
      (5, 'Contador/a público/a'),
      (6, 'Abogado/a'),
      (7, 'Desempleado');
  `);

  // Catálogo `estados`, `municipios`, `parroquias`
  await pool.query(`
    INSERT INTO estados (id_estado, nombre_estado) VALUES
      (1, 'Distrito Capital'),
      (2, 'Guárico'),
      (3, 'Miranda');
  `);

  await pool.query(`
    INSERT INTO municipios (id_municipio, nombre_municipio, estado_id) VALUES
      (1, 'Libertador', 1),
      (2, 'Juan Germán Roscio', 2),
      (3, 'Sucre', 3);
  `);

  await pool.query(`
    INSERT INTO parroquias (id_parroquia, nombre_parroquia, municipio_id, estado_id) VALUES
      (1, 'La Pastora', 1, 1),
      (2, 'Altagracia', 1, 1),
      (3, 'San Juan', 2, 2),
      (4, 'Petare', 3, 3);
  `);

  // Catálogo `etnias`
  await pool.query(`
    INSERT INTO etnias (id_etnia, nombre_etnia) VALUES
      (1, 'Ninguna / No aplica'),
      (2, 'Wayúu'),
      (3, 'Pemón'),
      (4, 'Warao'),
      (5, 'Kariña');
  `);

  // Catálogo `vacunas`
  await pool.query(`
    INSERT INTO vacunas (id_vacuna, nombre_vacuna, cantidad_dosis) VALUES
      (1, 'Hepatitis B Adulto', 3),
      (2, 'Fiebre Amarilla (Antiamarílica)', 1),
      (3, 'Toxoide Tetánico Diftérico (Td)', 5),
      (4, 'Trivalente Viral (SRP - Sarampión, Rubéola, Parotiditis)', 2),
      (5, 'Pentavalente Pediátrica (DTP-HB-Hib)', 3),
      (6, 'Antipoliomielítica (IPV / bOPV)', 4),
      (7, 'BCG (Antituberculosa Neonatal)', 1),
      (8, 'COVID-19 Refuerzo Bivalente', 4);
  `);

  // Catálogo `sintomas_comunes`
  await pool.query(`
    INSERT INTO sintomas_comunes (id_sintoma, descripcion_sintoma) VALUES
      (1, 'Fiebre moderada o alta (> 38.5°C)'),
      (2, 'Dolor e inflamación local mayor a 5 cm'),
      (3, 'Cefalea intensa'),
      (4, 'Mialgias o dolor articular generalizado'),
      (5, 'Eritema o erupción cutánea / Prurito'),
      (6, 'Náuseas, vómitos o malestar gastrointestinal'),
      (7, 'Mareo o sensación lipotímica'),
      (8, 'Edema local o induración');
  `);

  // Catálogo `examenes`
  await pool.query(`
    INSERT INTO examenes (id_examenes, nombre_examen) VALUES
      (1, 'VIH'),
      (2, 'VDRL'),
      (3, 'Hepatitis B'),
      (4, 'Hemoglobina'),
      (5, 'Glicemia');
  `);

  // Cuentas `usuarios` y `autoridades`
  await pool.query(`
    INSERT INTO usuarios (id_usuarios, correo_usuario, contrasena, tipo_usuario) VALUES
      (1, 'master@vih.gob.ve', 'Master2026*', 'master'),
      (2, 'centro@vih.gob.ve', 'Centro2026*', 'centro_salud_jefe'),
      (3, 'subregion@vih.gob.ve', 'Subregion2026*', 'subregion');
  `);

  await pool.query(`
    INSERT INTO autoridades (
      id_autoridades, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      c_i, n_impre, domicilio, telefono, usuario_id, profesion_id
    ) VALUES
      (1, 'María', 'Elena', 'Pérez', 'Mendoza', 15234890, 45890,
       'Av. Baralt, Res. El Ávila, Piso 4, Parroquia La Pastora, Caracas', '0414-2345678', 2, 1),
      (2, 'Carlos', 'Eduardo', 'Rojas', 'Guzmán', 12987654, 33120,
       'Av. Bolívar, San Juan de los Morros, Guárico', '0412-8765432', 3, 1);
  `);

  // `centro_salud` y `subregion`
  await pool.query(`
    INSERT INTO centro_salud (
      id_centro, nombre_centro, ubicacion_centro, codigo_centro, id_jefe_centro,
      parroquia_id, municipio_id, estado_id
    ) VALUES (
      1, 'Centro de Salud La Pastora',
      'Av. Sucre, Parroquia La Pastora, Municipio Libertador, Distrito Capital',
      'CS-DC-001', 1, 1, 1, 1
    );
  `);

  await pool.query(`
    INSERT INTO subregion (
      id_subregion, ubicacion, parroquia_id, municipio_id, estado_id, id_jefe_subregion
    ) VALUES (
      1, 'Av. Bolívar, Sede Subregión de Salud Guárico', 3, 2, 2, 2
    );
  `);

  // Ciudadanos iniciales (`ciudadano_mayor_edad` y `ciudadano_menor_edad`)
  await pool.query(`
    INSERT INTO ciudadano_mayor_edad (
      id_ciudadano, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      c_i, fecha_nacimiento, sexo, tipo_sangre, estatura, correo_electronico,
      telefono_celular, telefono_domicilio, domicilio, profesion_id,
      parroquia_id, municipio_id, estado_id, etnia_id
    ) VALUES
      (101, 'Alejandro', 'José', 'Morales', 'García', 14567890, '1985-04-12', 'masculino', 'O+', 176,
       'alejandro.morales@correo.com', '0412-9871122', '0212-8624411',
       'Av. Sucre, Sector Puerta de Caracas, Edif. Los Andes, Apto 3-B, La Pastora', 3, 1, 1, 1, 1),
      (102, 'Valeria', 'Daniela', 'Rivas', 'Mendoza', 21432765, '1994-09-23', 'femenino', 'A+', 164,
       'valeria.rivas@correo.com', '0414-3216549', '0212-8610922',
       'Calle Real de Manicomio, Casa N° 42, Parroquia La Pastora, Caracas', 4, 1, 1, 1, 1);
  `);

  await pool.query(`
    INSERT INTO ciudadano_menor_edad (
      id_menor, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      fecha_nacimiento, sexo, tipo_sangre, estatura, domicilio,
      parroquia_id, municipio_id, estado_id, etnia_id, padre_id
    ) VALUES
      (201, 'Mateo', 'Sebastián', 'Morales', 'Rivas', '2022-06-18', 'masculino', 'O+', 104,
       'Av. Sucre, Sector Puerta de Caracas, Edif. Los Andes, Apto 3-B, La Pastora', 1, 1, 1, 1, 101);
  `);

  const colMenor = await obtenerColumnaMenorInmunizacion();
  await pool.query(`
    INSERT INTO inmunizacion (
      id_inmunizacion, numero_dosis, fecha_aplicacion, numero_lote, observaciones,
      centro_salud_aplicacion, vacuna_id, ciudadano_mayor_edad_id, \`${colMenor}\`
    ) VALUES
      (101, 2, '2026-10-27', 'HEPB-2604', 'Sin reacción adversa inmediata.', 1, 1, 101, NULL),
      (102, 3, '2026-10-27', 'PENTA-2608', 'Tercera dosis completada según esquema pediátrico.', 1, 5, NULL, 201),
      (103, 3, '2026-10-27', 'TOX-2612', 'Paciente presentó leve dolor local.', 1, 3, 102, NULL);
  `);

  await pool.query(`
    INSERT INTO reportes (
      id_reportes, nivel_gravedad, recomendaciones, inmunizacion_id,
      ciudadano_mayor_id, ciudadano_menor_id, sintoma_id
    ) VALUES
      (1, 'LEVE', 'Compresas frías en la zona de punción cada 6 horas y Acetaminofén 500mg cada 8 horas por 3 días.', 103, 102, NULL, 2),
      (2, 'MODERADO', 'Antipirético pediátrico según peso (Paracetamol gotas), medios físicos tibios e hidratación continua.', 102, NULL, 201, 1);
  `);
}
