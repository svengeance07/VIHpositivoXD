# Referencias de base de datos

Material de consulta para el futuro backend. **Nada de esta carpeta se ejecuta ni se
importa desde la aplicación.**

## Contenido

| Archivo                     | Qué es                                                                |
| --------------------------- | --------------------------------------------------------------------- |
| `db_schema.sql`             | Script recibido el **2026-10-25**. Esquema real, todavía **parcial**. |
| `../diseno/modelo-datos.md` | Lectura del esquema, correspondencia con las vistas y huecos.         |

`../diseno/modelo-datos-preliminar.md` se conserva como documento histórico: fue el
boceto que se usó antes de recibir el SQL. No debe usarse para implementar.

## Estado del esquema

- **Parcial**: trae 16 tablas de ciudadanía, personal, centros, geografía y catálogos
  clínicos. Todavía no trae lotes/stock, certificados, movimientos, búsquedas ni
  incidencias. El login de dos niveles se resuelve con la tabla propuesta
  `cuentas_entidad`, que **no está en este script**; su diseño vive en
  `../diseno/modelo-datos.md`.
- **Sin implementar**: no hay backend, migraciones, ORM, conexión a base de datos ni
  datos reales. El proyecto sigue en etapa de vistas y navegación.
- **Fuente de verdad**: si este documento y el SQL difieren, manda el SQL. Las
  decisiones de producto y los cambios propuestos se registran en
  `../diseno/modelo-datos.md`; el `.sql` de referencia no se edita a mano.

## Integridad del archivo

- Copiado sin modificar desde la descarga local del 2026-10-25.
- Tamaño: 6.338 bytes.
- SHA-256: `456F43FD6FF32A64036AE737BBCBEC9FCE110348AAC282EE2E754FA6799D8F74`.

Si se recibe una versión nueva, reemplazar el archivo, actualizar el checksum y la
fecha en este README y revisar `../diseno/modelo-datos.md`.

## Reglas

1. No ejecutar el script contra una base real desde el repositorio.
2. No agregar credenciales, datos personales ni volcados de producción.
3. No modificar el SQL para reflejar decisiones de interfaz: esas diferencias se
   documentan como cambios pendientes para la versión que prepare el equipo de BD.
4. No conectar las vistas directamente a estas tablas: el mapeo vivirá en
   `src/app/nucleo/servicios/` cuando exista backend.
