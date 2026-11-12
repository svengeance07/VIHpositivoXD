import cors from 'cors';
import express from 'express';
import { dbConfig, inicializarBaseDeDatos, pool } from './db.mjs';
import {
  CentroSaludModel,
  CiudadanoModel,
  InmunizacionModel,
  ReporteModel,
  VacunaModel,
} from './modelos/index.mjs';

const app = express();
const PORT = Number(process.env.API_PORT || 3000);

app.use(cors());
app.use(express.json());

/**
 * GET /api/health
 * Comprueba en vivo la conexión con el servidor MySQL y la base de datos `vacunas`.
 */
app.get('/api/health', async (_req, res) => {
  try {
    const [tablas] = await pool.query('SHOW TABLES');
    res.json({
      conectado: true,
      baseDeDatos: dbConfig.database,
      host: `${dbConfig.host}:${dbConfig.port}`,
      totalTablas: tablas.length,
      tablas: tablas.map((t) => Object.values(t)[0]),
    });
  } catch (error) {
    res.status(500).json({
      conectado: false,
      baseDeDatos: dbConfig.database,
      mensaje: error instanceof Error ? error.message : 'Error de conexión a MySQL',
    });
  }
});

/**
 * GET /api/ps/contexto
 * Devuelve todos los registros del Centro de Salud desde MySQL (`vacunas`) a través de los modelos:
 * - `CentroSaludModel` (`centro_salud`, `autoridades`, `usuarios`, `profesiones`)
 * - `CiudadanoModel` (`ciudadano_mayor_edad`, `ciudadano_menor_edad`)
 * - `VacunaModel` (`vacunas`)
 * - `InmunizacionModel` (`inmunizacion`)
 * - `ReporteModel` (`reportes`, `sintomas_comunes`)
 */
app.get('/api/ps/contexto', async (_req, res) => {
  try {
    const { dto: centroInfo } = await CentroSaludModel.obtenerCentroPrincipal();

    const [pacientes, vacunasDisponibles, sintomasComunes] = await Promise.all([
      CiudadanoModel.listarTodos(),
      VacunaModel.listar(),
      ReporteModel.listarSintomasComunes(),
    ]);

    const { jefeNombre } = await CentroSaludModel.listarAutoridadesCentro(
      centroInfo.idJefeCentro,
      centroInfo.nombreCentro,
      centroInfo.ubicacionCentro,
      centroInfo.codigoCentro,
    );

    const [aplicaciones, reportes] = await Promise.all([
      InmunizacionModel.listar(centroInfo.nombreCentro, jefeNombre),
      ReporteModel.listar(jefeNombre),
    ]);

    const totalHoy = aplicaciones.filter((a) => a.fechaAplicacion === '2026-10-27').length;
    const { enfermeros } = await CentroSaludModel.listarAutoridadesCentro(
      centroInfo.idJefeCentro,
      centroInfo.nombreCentro,
      centroInfo.ubicacionCentro,
      centroInfo.codigoCentro,
      totalHoy,
      aplicaciones.length,
    );

    res.json({
      centroInfo,
      enfermeros,
      pacientes,
      aplicaciones,
      reportes,
      vacunasDisponibles,
      sintomasComunes,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : 'Error al consultar contexto de /PS',
    });
  }
});

/**
 * POST /api/ps/pacientes
 * Inserta un nuevo ciudadano en `ciudadano_mayor_edad` o `ciudadano_menor_edad` usando `CiudadanoModel`.
 */
app.post('/api/ps/pacientes', async (req, res) => {
  try {
    const creado = await CiudadanoModel.crear(req.body);
    res.status(201).json(creado);
  } catch (error) {
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : 'Error al insertar paciente en MySQL',
    });
  }
});

/**
 * POST /api/ps/vacunas
 * Inserta un nuevo biológico en la tabla `vacunas` usando `VacunaModel`.
 */
app.post('/api/ps/vacunas', async (req, res) => {
  try {
    const nombre = req.body.nombre || req.body.nombreVacuna;
    if (!nombre || !String(nombre).trim()) {
      res.status(400).json({ mensaje: 'El campo nombre_vacuna es obligatorio.' });
      return;
    }

    const creada = await VacunaModel.obtenerOCrear({
      nombre,
      dosisMaximas: req.body.dosisMaximas || req.body.cantidadDosis || 1,
      loteInicial: req.body.loteInicial,
    });
    res.status(201).json(creada);
  } catch (error) {
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : 'Error al insertar en la tabla vacunas',
    });
  }
});

/**
 * POST /api/ps/inmunizaciones
 * Inserta una nueva fila en `inmunizacion` usando `InmunizacionModel`.
 */
app.post('/api/ps/inmunizaciones', async (req, res) => {
  try {
    const creada = await InmunizacionModel.crear(req.body);
    res.status(201).json(creada);
  } catch (error) {
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : 'Error al insertar en inmunizacion',
    });
  }
});

/**
 * POST /api/ps/reportes
 * Inserta un nuevo evento adverso en `reportes` (y `sintomas_comunes`) usando `ReporteModel`.
 */
app.post('/api/ps/reportes', async (req, res) => {
  try {
    const creado = await ReporteModel.crear(req.body);
    res.status(201).json(creado);
  } catch (error) {
    res.status(500).json({
      mensaje: error instanceof Error ? error.message : 'Error al insertar en reportes',
    });
  }
});

async function arrancarServidor() {
  try {
    await inicializarBaseDeDatos();
    console.log(
      `[MySQL] Conectado exitosamente a ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    );
  } catch (error) {
    console.error(
      '[MySQL] Advertencia al inicializar la base de datos:',
      error instanceof Error ? error.message : error,
    );
  }

  app.listen(PORT, () => {
    console.log(`[API] Servidor Express escuchando en http://localhost:${PORT}/api/health`);
  });
}

arrancarServidor();
