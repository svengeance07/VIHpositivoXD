# Referencias de base de datos

Material de consulta para el futuro backend. **Nada de esta carpeta se ejecuta ni se
importa desde la aplicación.**

## Contenido

| Archivo                             | Qué es                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `db_schema.sql`                     | **Esquema de trabajo** con las extensiones propuestas el 2026-10-29; sigue sin ejecutarse.   |
| `db_schema_original_2026-10-25.sql` | Copia fiel e inmutable del script recibido. Se conserva para comparar y auditar los cambios. |
| `../diseno/modelo-datos.md`         | Lectura del esquema, correspondencia con las vistas, flujos y huecos.                        |

`../diseno/modelo-datos-preliminar.md` se conserva como documento histórico: fue el
boceto que se usó antes de recibir el SQL. No debe usarse para implementar.

## Estado del esquema

- **Esquema de trabajo**: parte de las 16 tablas recibidas y agrega, como propuesta, las
  columnas y tablas que necesitan el login de entidad, los certificados, las notificaciones
  de la subregión y la consulta pública. Todavía no incluye lotes/stock, movimientos ni
  incidencias.
- **Sin implementar**: no hay backend, migraciones, ORM, conexión a base de datos ni datos
  reales. El proyecto sigue en etapa de vistas y navegación.
- **Fuente de verdad**: el SQL de trabajo. Las decisiones de producto, los cambios y las
  dudas se registran en `../diseno/modelo-datos.md` antes de convertirlos en migraciones.

## Integridad del archivo original

- `db_schema_original_2026-10-25.sql` se copió sin modificar desde la descarga local.
- Tamaño: 6.338 bytes.
- SHA-256: `456F43FD6FF32A64036AE737BBCBEC9FCE110348AAC282EE2E754FA6799D8F74`.

Si se recibe una versión nueva, guardar el original recibido en un archivo fechado,
actualizar la referencia y revisar `../diseno/modelo-datos.md`.

## Reglas

1. No ejecutar los scripts contra una base real desde el repositorio.
2. No agregar credenciales, datos personales ni volcados de producción.
3. Mantener `db_schema_original_2026-10-25.sql` intacto. Los cambios del prototipo se
   documentan en `db_schema.sql` y en `../diseno/modelo-datos.md`.
4. No conectar las vistas directamente a estas tablas: el mapeo vivirá en
   `src/app/nucleo/servicios/` cuando exista backend.
