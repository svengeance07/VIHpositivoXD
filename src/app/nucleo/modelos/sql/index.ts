/**
 * Punto de exportación central de los modelos y DTOs relacionales SQL de Sistema V.
 *
 * Mapean directamente los esquemas de:
 * - `docs/referencias/example.sql` (17 tablas con claves foráneas)
 * - `docs/referencias/db_schema.sql` (esquema maestro del prototipo)
 */

export * from './tablas-sql.model';
export * from './ps/index';
export * from './srs/index';
export * from './master/index';

