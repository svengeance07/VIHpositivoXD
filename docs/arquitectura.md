# Arquitectura y decisiones

Última actualización: 2026-10-26

## Alcance actual

- Etapa de solo vistas y navegación. Sin backend, sin autenticación real, sin guards ni permisos efectivos todavía.
- El esquema de base de datos llegó como **referencia parcial** (`docs/referencias/db_schema.sql`), pero no está
  implementado: no hay migraciones, ORM ni conexión a base de datos. Su lectura está en
  `docs/diseno/modelo-datos.md`.
- Los datos se simulan con mocks tipados expuestos por servicios con `signal`. La futura API reemplazará el origen
  de esos servicios; las vistas que dependen de datos todavía ausentes (lotes, certificados, vigencia) se ajustarán
  cuando llegue el esquema completo.
- Ya están construidos la landing (`/`), el login en tres pasos (`/login`), el placeholder de consulta (`/consulta`),
  las vistas del master (`/master` y sus rutas hijas) y las del personal de salud (`/PS` y sus rutas hijas) con datos
  mock. Las páginas de `/SRS` siguen siendo provisionales.

## Roles

| Rol                | Prefijo URL | Shell  |
| ------------------ | ----------- | ------ |
| Master             | `/master`   | propio |
| Personal de salud  | `/PS`       | propio |
| Subregión de salud | `/SRS`      | propio |

- Cada rol tiene su propio shell (layout, navegación y funciones visibles) porque la información y los permisos difieren.
- Páginas, rutas y alcance de cada rol: ver `docs/diseno/vistas.md`. Quedan decisiones abiertas, listadas en su sección 10.
- La **subregión (rol 3)** no tiene tabla propia: será una sede dentro de `centros_salud` con un campo `tipo` que hay
  que agregar (2 = centro, 3 = sede de subregión; el nombre indica si es hospital, ambulatorio o CDI), una por estado.
  Su personal son filas de `personal` con `tipo_cuenta = 3` y `centro_id` apuntando a esa
  sede. Hay un solo jefe por centro, derivado de `centros_salud.encargado_id`. El login debe validar que el tipo
  elegido coincida con el tipo de cuenta y de centro.
- Los segmentos `PS` y `SRS` van en mayúsculas literales tanto en `path` como en los `routerLink`. Angular distingue mayúsculas: no mezclar `/PS` con `/ps`.

## Login

- Hoy `/login` tiene tres pasos: **tipo de cuenta** (roles 1–3), **credenciales de acceso** (de la entidad en los
  roles 2 y 3) y, solo para esos dos roles, **perfil de trabajo** (jefe o trabajador).
- El esquema parcial no trae credenciales de entidad. Para conservar el flujo se propone `cuentas_entidad`
  (credenciales, `centro_id` y `jefe_id`), que **no está en el script** ni implementada. El segundo nivel sigue
  validando el correo y la contraseña de `personal`; el jefe se deriva de `jefe_id`/`encargado_id`.
- El login de dos niveles se mantiene: `cuentas_entidad` abre la entidad y `personal` abre el perfil. El master
  entra directo con `master`. Ver `modelo-datos.md` §5.1.
- La validación es simulada con `SesionService`; no hay backend ni persistencia de sesión. Al recargar se pierde.
- Credenciales de prueba: `docs/diseno/credenciales-demo.md`. En desarrollo, el login muestra el mismo listado.
- El login pide **correo y contraseña** para todos los roles (decisión 16 de `vistas.md`). El esquema ya incluye
  `master.nombre_usuario`; el dashboard usa ese valor para el saludo. La UI de login conserva el correo y el backend
  podrá aceptar también el nombre de usuario del master.
- Al entrar se navega al prefijo del rol. Los guards y el refresco de sesión son trabajo pendiente.

## Datos mock

- `src/app/nucleo/modelos/`: interfaces del dominio (`Persona`, `Usuario`, etc.), todavía provisionales.
- `src/app/nucleo/datos/`: arrays hardcodeados.
- `src/app/nucleo/datos/catalogos.ts`: catálogos temporales (vacunas, exámenes, profesiones, grados de instrucción, grupos étnicos, tipos de establecimiento, tipos de sangre), expuestos por `CatalogosService`. Cuando exista backend se reemplazan por las tablas `vacunas`, `profesiones`, `etnias`, `tipoSangre` y las que falten. El catálogo de tipos de establecimiento no tendrá columna: sirve solo para sugerir el nombre del centro.
- `src/app/nucleo/datos/cuentas-acceso.ts`: cuentas de prueba con sus perfiles jefe/trabajador; replica el futuro
  `cuentas_entidad` + `personal` y las valida `SesionService`.
- `src/app/nucleo/servicios/`: servicios con `signal` que leen y mutan los mocks.
- Las vistas consumen servicios; nunca importan los arrays mock directamente.
- El esquema real parcial está en `docs/referencias/db_schema.sql` y su lectura en `docs/diseno/modelo-datos.md`. **No se ha implementado**: los mocks siguen siendo la fuente de datos de la app.
- Correspondencia rápida: **ciudadano** → `usuarios` + teléfonos + residencias + catálogos; **personal** → `personal` + `centros_salud` + `profesiones`; **cuenta de entidad** → `cuentas_entidad` (propuesta) + `centros_salud`; **master** → `master`; **subregión** → `centros_salud` con `tipo = 3`. Lotes, certificados, movimientos e incidencias todavía no tienen tabla.
- Los IDs reales serán enteros y los mocks usan strings. El mapeo futuro se concentra en `nucleo/servicios`; ningún componente debe depender de los nombres de columnas.

## Flujo de datos previsto

- **Consulta pública**: cédula → `usuarios` → código al `correo` → ficha con residencia, teléfonos, vacunas y exámenes. Sin tabla de certificados todavía.
- **Login**: `master` para el rol 1; `cuentas_entidad` (propuesta) para el primer nivel de los roles 2 y 3, y `personal` para el perfil, validando `tipo_cuenta` y el `tipo` del centro. La subregión es una sede de `centros_salud`, no una tabla aparte.
- **Dashboard master**: implementado con mocks; el top 10 semanal por estado se podrá calcular con `usuario_vacunas` + `centros_salud.estado_id`, mientras que los lotes y los movimientos esperan sus tablas. El mapa usa la jerarquía `estado → mcpo → parroquia`.
- **Personal de salud**: centro de la sesión, trabajadores del centro y vacunaciones por centro. Los exámenes no están asociados a un centro.
- **Subregión**: centros de su estado y vacunaciones agregadas; stock y certificados quedan bloqueados hasta recibir esas tablas.

## Documentación de diseño

- `docs/diseno/vistas.md`: navegación, roles, rutas propuestas y descripción de cada pantalla, derivado de los bocetos a mano.
- `docs/diseno/modelo-datos.md`: **lectura vigente del esquema real parcial**, correspondencia con las vistas, flujos de datos, huecos y preguntas abiertas.
- `docs/diseno/modelo-datos-preliminar.md`: documento **histórico** con las hipótesis anteriores al SQL. No usar para implementar.
- `docs/diseno/credenciales-demo.md`: cuentas de prueba para recorrer los flujos de landing y login.
- `docs/diseno/imagenes/`: los 16 bocetos originales, organizados por carpeta.
- `docs/referencias/db_schema.sql`: script de base de datos recibido el 2026-10-25, **parcial y sin ejecutar**.
- El esquema real manda sobre el modelo preliminar y sobre los mocks. Al implementar, la capa de servicios absorbe el mapeo; las vistas que dependen de datos que aún no existen (lotes, certificados, vigencia) sí tendrán que ajustarse cuando lleguen esas tablas.

## Estructura

```text
src/app/
├── nucleo/                  # compartido, sin páginas
│   ├── modelos/
│   ├── datos/
│   └── servicios/
├── compartido/
│   └── ui/
│       └── pagina-en-construccion/  # placeholder reutilizable
├── publico/
│   ├── landing/
│   ├── login/
│   └── consulta/
├── roles/
│   ├── master/
│   │   ├── shell/
│   │   ├── componentes/
│   │   └── paginas/
│   ├── personal-salud/
│   │   ├── shell/
│   │   └── paginas/
│   └── subregion-salud/
│       ├── shell/
│       └── paginas/
└── app.routes.ts            # solo composición con lazy loading
```

- Las carpetas vacías se versionan con `.gitkeep` porque Git no guarda directorios vacíos.
- Los shells usan las clases CSS de Caustica (`.ui-navbar`, `.ui-nav`, `.ui-table`, etc.). Caustica no incluye componentes Angular de layout, tabla ni formularios: solo custom elements para botón, icono, modal, tabs y collapse.
- El SQL de referencia y su procedencia viven en `docs/referencias/`; no forman parte del bundle ni se importan desde la app.

## Reglas de modularidad (3 personas)

- Cada persona edita `src/app/roles/<rol>/` y su `*.routes.ts`.
- `app.routes.ts` solo compone con `loadChildren`; se toca al crear el esqueleto.
- Lo compartido vive en `nucleo/` y `compartido/`. Si dos roles necesitan lo mismo, se mueve ahí con revisión, no se duplica.
- Pendiente: `CODEOWNERS` y CI de GitHub Actions (`pnpm build`, `pnpm test --watch=false`, `pnpm format:check`).

## Pendientes

- **Esquema de base de datos parcial**: faltan tablas de lotes/stock, certificados, movimientos, búsquedas e incidencias. Hay columnas acordadas (`usuarios.sexo`, `usuarios.creado_en`, `centros_salud.tipo`) y una tabla propuesta (`cuentas_entidad`) que todavía no están en el script. No implementar hasta recibir la versión completa y cerrar las preguntas de `docs/diseno/modelo-datos.md` §8.
- **Login**: se conserva el flujo de dos niveles; `cuentas_entidad` (propuesta) resuelve el primero y `personal` el segundo. Falta que el equipo de BD confirme la tabla y su nombre.
- Decisiones que siguen abiertas en `docs/diseno/vistas.md` §10: vigencia de exámenes y vacunas, credenciales reales y geodatos del mapa.
- Permisos por rol: el alcance funcional está descrito, falta la implementación (incluidos guards de ruta y persistencia de sesión).
- Bocetos de `/SRS`: todavía no existen; sus páginas actuales son placeholders. Las vistas del master y de `/PS` ya
  están implementadas con mocks en `roles/master/` y `roles/personal-salud/`, con `DatosMasterService` y
  `DatosPersonalSaludService`.
- `docs/diseno/` creció a ~4.5 MB de imágenes dentro del repo. Decidir si se versionan o se mueven a almacenamiento externo.
