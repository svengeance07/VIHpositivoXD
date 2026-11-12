import 'dotenv/config';
import mysql from 'mysql2/promise';

/**
 * Configuración de conexión para el servidor de base de datos MySQL / MariaDB.
 * Los valores por defecto se ajustan a entornos de desarrollo locales estándar.
 */
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

/**
 * Pool de conexiones reutilizables para optimizar la concurrencia y transacciones.
 */
export const pool = mysql.createPool(dbConfig);

/**
 * Comprueba la disponibilidad del servidor MySQL.
 */
export async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    conexion.release();
    return { ok: true, mensaje: 'Conexión a MySQL exitosa' };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : 'Error desconocido al conectar con MySQL',
    };
  }
}

