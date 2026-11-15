import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'vacunas',
  charset: 'utf8mb4',
};

const PROFESIONES = [
  // Base y requeridos por el sistema
  { id: 1, nombre: 'Medicina' },
  { id: 2, nombre: 'Enfermería' },
  { id: 3, nombre: 'Desempleado' },

  // Especialidades Médicas y Salud
  { id: 4, nombre: 'Médico General' },
  { id: 5, nombre: 'Médico Cirujano' },
  { id: 6, nombre: 'Médico Pediatra' },
  { id: 7, nombre: 'Médico Epidemiólogo' },
  { id: 8, nombre: 'Médico Gineco-Obstetra' },
  { id: 9, nombre: 'Médico Internista' },
  { id: 10, nombre: 'Médico Cardiólogo' },
  { id: 11, nombre: 'Médico Traumatólogo' },
  { id: 12, nombre: 'Médico Neumonólogo' },
  { id: 13, nombre: 'Médico Infectólogo' },
  { id: 14, nombre: 'Médico Anestesiólogo' },
  { id: 15, nombre: 'Médico Psiquiatra' },
  { id: 16, nombre: 'Licenciado(a) en Enfermería' },
  { id: 17, nombre: 'Técnico Superior Universitario en Enfermería' },
  { id: 18, nombre: 'Auxiliar de Enfermería' },
  { id: 19, nombre: 'Licenciado(a) en Bioanálisis' },
  { id: 20, nombre: 'Licenciado(a) en Farmacia' },
  { id: 21, nombre: 'Odontólogo(a)' },
  { id: 22, nombre: 'Licenciado(a) en Nutrición y Dietética' },
  { id: 23, nombre: 'Licenciado(a) en Fisioterapia' },
  { id: 24, nombre: 'Licenciado(a) en Radiología e Imagenología' },
  { id: 25, nombre: 'Psicólogo(a) Clínico' },
  { id: 26, nombre: 'Trabajador(a) Social' },
  { id: 27, nombre: 'Paramédico / Técnico en Emergencias Prehospitalarias' },
  { id: 28, nombre: 'Médico Veterinario' },
  { id: 29, nombre: 'Técnico de Laboratorio Clínico' },

  // Educación y Docencia
  { id: 30, nombre: 'Docente de Educación Inicial / Preescolar' },
  { id: 31, nombre: 'Docente de Educación Primaria' },
  { id: 32, nombre: 'Docente de Educación Media / Bachillerato' },
  { id: 33, nombre: 'Profesor(a) Universitario(a)' },
  { id: 34, nombre: 'Pedagogo(a)' },

  // Ciencias Exactas y Naturales
  { id: 35, nombre: 'Biólogo(a)' },
  { id: 36, nombre: 'Químico(a)' },
  { id: 37, nombre: 'Físico(a)' },
  { id: 38, nombre: 'Matemático(a) / Estadístico(a)' },

  // Leyes, Administración y Finanzas
  { id: 39, nombre: 'Abogado(a)' },
  { id: 40, nombre: 'Licenciado(a) en Administración de Empresas' },
  { id: 41, nombre: 'Contador(a) Público(a)' },
  { id: 42, nombre: 'Economista' },
  { id: 43, nombre: 'Administrador(a) de Servicios de Salud' },
  { id: 44, nombre: 'Asistente Administrativo(a)' },
  { id: 45, nombre: 'Secretario(a) / Oficinista' },
  { id: 46, nombre: 'Recepcionista' },

  // Ingenierías, Arquitectura y Tecnología
  { id: 47, nombre: 'Ingeniero(a) en Informática / Sistemas' },
  { id: 48, nombre: 'Ingeniero(a) Civil' },
  { id: 49, nombre: 'Ingeniero(a) Industrial' },
  { id: 50, nombre: 'Ingeniero(a) Mecánico' },
  { id: 51, nombre: 'Ingeniero(a) Eléctrico' },
  { id: 52, nombre: 'Ingeniero(a) Químico' },
  { id: 53, nombre: 'Ingeniero(a) Agrónomo' },
  { id: 54, nombre: 'Ingeniero(a) Biomédico' },
  { id: 55, nombre: 'Arquitecto(a)' },
  { id: 56, nombre: 'Técnico Superior Universitario en Informática' },
  { id: 57, nombre: 'Soporte Técnico de Redes y Computación' },

  // Ciencias Sociales, Humanidades y Comunicación
  { id: 58, nombre: 'Comunicador(a) Social / Periodista' },
  { id: 59, nombre: 'Diseñador(a) Gráfico' },
  { id: 60, nombre: 'Sociólogo(a)' },
  { id: 61, nombre: 'Antropólogo(a)' },
  { id: 62, nombre: 'Politólogo(a)' },
  { id: 63, nombre: 'Traductor(a) / Intérprete' },

  // Seguridad, Defensa y Función Pública
  { id: 64, nombre: 'Bombero(a)' },
  { id: 65, nombre: 'Funcionario(a) Policial' },
  { id: 66, nombre: 'Militar / Fuerza Armada Nacional Bolivariana' },
  { id: 67, nombre: 'Funcionario(a) de Protección Civil' },
  { id: 68, nombre: 'Funcionario(a) Público Administrativo' },

  // Comercio, Servicios, Oficios y Sector Productivo
  { id: 69, nombre: 'Comerciante' },
  { id: 70, nombre: 'Cajero(a) / Vendedor(a)' },
  { id: 71, nombre: 'Conductor(a) / Chofer de Transporte' },
  { id: 72, nombre: 'Mecánico Automotriz' },
  { id: 73, nombre: 'Electricista' },
  { id: 74, nombre: 'Plomero(a) / Fontanero(a)' },
  { id: 75, nombre: 'Carpintero(a)' },
  { id: 76, nombre: 'Albañil / Obrero de la Construcción' },
  { id: 77, nombre: 'Pintor(a)' },
  { id: 78, nombre: 'Soldador(a)' },
  { id: 79, nombre: 'Agricultor(a) / Productor(a) Agropecuario' },
  { id: 80, nombre: 'Ganadero(a)' },
  { id: 81, nombre: 'Pescador(a)' },
  { id: 82, nombre: 'Personal de Limpieza y Mantenimiento' },
  { id: 83, nombre: 'Cocinero(a) / Chef' },
  { id: 84, nombre: 'Panadero(a) / Pastelero(a)' },
  { id: 85, nombre: 'Peluquero(a) / Barbero(a)' },
  { id: 86, nombre: 'Costurero(a) / Sastre' },
  { id: 87, nombre: 'Vigilante / Seguridad Privada' },

  // Situaciones de Ocupación Especiales
  { id: 88, nombre: 'Estudiante' },
  { id: 89, nombre: 'Ama de Casa / Labores del Hogar' },
  { id: 90, nombre: 'Jubilado(a) / Pensionado(a)' },
  { id: 91, nombre: 'Otro / Oficio no especificado' },
];

async function main() {
  console.log('1. Descargando datos geográficos oficiales de Venezuela...');
  const res = await fetch(
    'https://raw.githubusercontent.com/CodersVenezuela/Venezuela-SQL/master/venezuela.sql',
  );
  if (!res.ok) {
    throw new Error(`Fallo descarga de venezuela.sql: HTTP ${res.status}`);
  }
  const sqlContent = await res.text();

  // Parsing estados
  const estados = [];
  const estMatch = sqlContent.match(/INSERT INTO `estados` VALUES ([^;]+);/);
  if (estMatch) {
    const tuples = estMatch[1].matchAll(/\((\d+),'([^']+)'\)/g);
    for (const t of tuples) {
      estados.push({ id_estado: Number(t[1]), nombre_estado: t[2] });
    }
  }

  // Parsing municipios
  const municipios = [];
  const munMap = new Map(); // id -> estado_id
  const munMatch = sqlContent.match(/INSERT INTO `municipios` VALUES ([^;]+);/);
  if (munMatch) {
    const tuples = munMatch[1].matchAll(/\((\d+),(\d+),'([^']+)'\)/g);
    for (const t of tuples) {
      const id_mun = Number(t[1]);
      const estado_id = Number(t[2]);
      municipios.push({
        id_municipio: id_mun,
        estado_id: estado_id,
        nombre_municipio: t[3],
      });
      munMap.set(id_mun, estado_id);
    }
  }

  // Parsing parroquias
  const parroquias = [];
  const parMatch = sqlContent.match(/INSERT INTO `parroquias` VALUES ([^;]+);/);
  if (parMatch) {
    const tuples = parMatch[1].matchAll(/\((\d+),(\d+),'([^']+)'\)/g);
    for (const t of tuples) {
      const id_parroquia = Number(t[1]);
      const municipio_id = Number(t[2]);
      const estado_id = munMap.get(municipio_id) || null;
      parroquias.push({
        id_parroquia,
        municipio_id,
        estado_id,
        nombre_parroquia: t[3],
      });
    }
  }

  console.log(
    `Datos extraídos: ${estados.length} estados, ${municipios.length} municipios, ${parroquias.length} parroquias, ${PROFESIONES.length} profesiones.`,
  );

  console.log('2. Conectando a MySQL...');
  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    console.log('3. Iniciando actualización de catálogos en base de datos...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Truncar catálogos
    await conn.query('TRUNCATE TABLE parroquias;');
    await conn.query('TRUNCATE TABLE municipios;');
    await conn.query('TRUNCATE TABLE estados;');
    await conn.query('TRUNCATE TABLE profesiones;');

    // Insertar Estados
    console.log('   Insertando estados...');
    for (const e of estados) {
      await conn.query('INSERT INTO estados (id_estado, nombre_estado) VALUES (?, ?);', [
        e.id_estado,
        e.nombre_estado,
      ]);
    }

    // Insertar Municipios por lotes de 100
    console.log('   Insertando municipios...');
    for (let i = 0; i < municipios.length; i += 100) {
      const slice = municipios.slice(i, i + 100);
      const values = slice.map((m) => [m.id_municipio, m.nombre_municipio, m.estado_id]);
      await conn.query(
        'INSERT INTO municipios (id_municipio, nombre_municipio, estado_id) VALUES ?;',
        [values],
      );
    }

    // Insertar Parroquias por lotes de 100
    console.log('   Insertando parroquias...');
    for (let i = 0; i < parroquias.length; i += 100) {
      const slice = parroquias.slice(i, i + 100);
      const values = slice.map((p) => [
        p.id_parroquia,
        p.nombre_parroquia,
        p.municipio_id,
        p.estado_id,
      ]);
      await conn.query(
        'INSERT INTO parroquias (id_parroquia, nombre_parroquia, municipio_id, estado_id) VALUES ?;',
        [values],
      );
    }

    // Insertar Profesiones
    console.log('   Insertando profesiones...');
    for (const p of PROFESIONES) {
      await conn.query('INSERT INTO profesiones (id_profesion, nombre_profesion) VALUES (?, ?);', [
        p.id,
        p.nombre,
      ]);
    }

    // 4. Actualizar referencias existentes de pruebas para mantener coherencia
    // Guárico = 11, Juan Germán Roscio = 134, San Juan de los Morros = 432
    // Distrito Capital = 24, Libertador = 462, Catedral = 1120
    console.log('4. Actualizando registros de demo para alinearlos a los IDs oficiales...');

    // Ambulatorio La Pastora -> Guárico
    await conn.query(`
      UPDATE centro_salud 
      SET estado_id = 11, municipio_id = 134, parroquia_id = 432 
      WHERE id_centro = 1;
    `);

    // Hospital Vargas -> Caracas (Distrito Capital)
    await conn.query(`
      UPDATE centro_salud 
      SET estado_id = 24, municipio_id = 462, parroquia_id = 1120 
      WHERE id_centro = 2;
    `);

    // Sede Subregión Guárico
    await conn.query(`
      UPDATE subregion 
      SET estado_id = 11, municipio_id = 134, parroquia_id = 432 
      WHERE id_subregion = 1;
    `);

    // Ciudadano demo Guárico (Luis Martínez)
    await conn.query(`
      UPDATE ciudadano_mayor_edad 
      SET estado_id = 11, municipio_id = 134, parroquia_id = 432, profesion_id = 1 
      WHERE id_ciudadano = 1;
    `);

    // Menor demo Guárico (Sofía Martínez)
    await conn.query(`
      UPDATE ciudadano_menor_edad 
      SET estado_id = 11, municipio_id = 134, parroquia_id = 432 
      WHERE id_menor = 1;
    `);

    // Autoridades médicas
    await conn.query(`
      UPDATE autoridades 
      SET profesion_id = 1 
      WHERE id_autoridades IN (1, 2);
    `);

    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('5. Verificando conteos en la base de datos...');
    const [[{ eCount }]] = await conn.query('SELECT COUNT(*) as eCount FROM estados;');
    const [[{ mCount }]] = await conn.query('SELECT COUNT(*) as mCount FROM municipios;');
    const [[{ pCount }]] = await conn.query('SELECT COUNT(*) as pCount FROM parroquias;');
    const [[{ profCount }]] = await conn.query('SELECT COUNT(*) as profCount FROM profesiones;');

    console.log(`\n¡ÉXITO TOTAL!`);
    console.log(`- Estados en DB:     ${eCount}`);
    console.log(`- Municipios en DB:  ${mCount}`);
    console.log(`- Parroquias en DB:  ${pCount}`);
    console.log(`- Profesiones en DB: ${profCount}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Error durante la carga de catálogos:', err);
  process.exit(1);
});
