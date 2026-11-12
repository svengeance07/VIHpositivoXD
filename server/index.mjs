import cors from 'cors';
import express from 'express';
import { dbConfig, pool, probarConexion } from './db.mjs';
import { MasterModel } from './modelos/master.model.mjs';
import { PsModel } from './modelos/ps.model.mjs';
import { SrsModel } from './modelos/srs.model.mjs';

const app = express();
const PORT = Number(process.env.API_PORT || 3000);

app.use(cors());
app.use(express.json());

/* ------------------------------------------------------------------ */
/* 1. Diagnóstico y Estado del Servidor                               */
/* ------------------------------------------------------------------ */

app.get('/api/health', async (_req, res) => {
  const prueba = await probarConexion();
  if (!prueba.ok) {
    res.status(503).json({
      conectado: false,
      servidor: 'API Sistema V',
      baseDeDatos: dbConfig.database,
      mensaje: prueba.mensaje,
    });
    return;
  }

  try {
    const [tablas] = await pool.query('SHOW TABLES');
    res.json({
      conectado: true,
      servidor: 'API Sistema V',
      baseDeDatos: dbConfig.database,
      host: `${dbConfig.host}:${dbConfig.port}`,
      totalTablas: tablas.length,
      tablas: tablas.map((t) => Object.values(t)[0]),
    });
  } catch (err) {
    res.status(500).json({ conectado: false, error: err.message });
  }
});

/* ------------------------------------------------------------------ */
/* 2. Endpoints para el Centro de Salud (/api/ps/*)                   */
/* ------------------------------------------------------------------ */

app.get('/api/ps/centro', async (req, res) => {
  try {
    const centroId = Number(req.query.id || 1);
    const centro = await PsModel.obtenerCentroPorId(centroId);
    res.json(centro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ps/pacientes', async (req, res) => {
  try {
    const centroId = Number(req.query.centroId || 1);
    const pacientes = await PsModel.listarPacientes(centroId);
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ps/pacientes', async (req, res) => {
  try {
    const nuevo = await PsModel.crearPaciente(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ps/inmunizaciones', async (req, res) => {
  try {
    const nueva = await PsModel.registrarInmunizacion(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ps/reportes', async (req, res) => {
  try {
    const reporte = await PsModel.crearReporteEsavi(req.body);
    res.status(201).json(reporte);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ */
/* 3. Endpoints para la Subregión de Salud (/api/srs/*)               */
/* ------------------------------------------------------------------ */

app.get('/api/srs/sede', async (req, res) => {
  try {
    const estadoId = Number(req.query.estadoId || 1);
    const sede = await SrsModel.obtenerSedePorEstado(estadoId);
    res.json(sede);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/srs/centros', async (req, res) => {
  try {
    const estadoId = Number(req.query.estadoId || 1);
    const centros = await SrsModel.listarCentrosAdscritos(estadoId);
    res.json(centros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/srs/centros', async (req, res) => {
  try {
    const nuevo = await SrsModel.crearCentro(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/srs/personal', async (req, res) => {
  try {
    const estadoId = Number(req.query.estadoId || 1);
    const personal = await SrsModel.listarPersonalEstadal(estadoId);
    res.json(personal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/srs/personal', async (req, res) => {
  try {
    const nuevo = await SrsModel.crearTrabajador(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/srs/certificados', async (req, res) => {
  try {
    const estadoId = Number(req.query.estadoId || 1);
    const certificados = await SrsModel.listarCertificados(estadoId);
    res.json(certificados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/srs/certificados/:id', async (req, res) => {
  try {
    const idCertificado = Number(req.params.id);
    const resultado = await SrsModel.revisarCertificado({ idCertificado, ...req.body });
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/srs/metricas', async (req, res) => {
  try {
    const estadoId = Number(req.query.estadoId || 1);
    const metricas = await SrsModel.obtenerMetricasEstadales(estadoId);
    res.json(metricas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ */
/* 4. Endpoints para el Administrador Nacional Master (/api/master/*) */
/* ------------------------------------------------------------------ */

app.get('/api/master/subregiones', async (_req, res) => {
  try {
    const subregiones = await MasterModel.listarSubregionesNacionales();
    res.json(subregiones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/master/subregiones', async (req, res) => {
  try {
    const nueva = await MasterModel.crearSubregionNacional(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/centros', async (req, res) => {
  try {
    const estadoId = req.query.estadoId ? Number(req.query.estadoId) : null;
    const centros = await MasterModel.listarCentrosNacionales(estadoId);
    res.json(centros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/autoridades', async (_req, res) => {
  try {
    const autoridades = await MasterModel.listarAutoridadesNacionales();
    res.json(autoridades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/vacunas', async (_req, res) => {
  try {
    const vacunas = await MasterModel.listarCatalogoVacunas();
    res.json(vacunas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/master/vacunas', async (req, res) => {
  try {
    const nueva = await MasterModel.crearVacunaNacional(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/buscar', async (req, res) => {
  try {
    const termino = String(req.query.q || '');
    const resultados = await MasterModel.buscarCiudadanosGlobal(termino);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/metricas', async (_req, res) => {
  try {
    const metricas = await MasterModel.obtenerMetricasNacionales();
    res.json(metricas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ */
/* 5. Inicialización del Servidor                                     */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
  console.log(`[API Sistema V] Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`[API Sistema V] Endpoint de salud: http://localhost:${PORT}/api/health`);
});

