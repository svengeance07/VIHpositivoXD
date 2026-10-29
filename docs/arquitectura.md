# Arquitectura y decisiones

Última actualización: 2026-10-29

## Alcance actual

- Etapa de solo vistas y navegación. Sin backend, sin autenticación real, sin guards ni permisos efectivos todavía.
- El esquema de base de datos partió como **referencia parcial** (`docs/referencias/db_schema.sql`). Hoy es un
  **esquema de trabajo** con extensiones propuestas para certificados, notificaciones y envíos; el archivo original se
  conserva en `docs/referencias/db_schema_original_2026-10-25.sql`. No está implementado: no hay migraciones, ORM ni
  conexión a base de datos. Su lectura está en `docs/diseno/modelo-datos.md`.
- Los datos se simulan con mocks tipados expuestos por servicios con `signal`. La futura API reemplazará el origen
  de esos servicios; las vistas que dependen de datos todavía ausentes (lotes, stock, movimientos e incidencias) se
  ajustarán cuando llegue el esquema completo.
- Ya están construidos la landing (`/`), el login en tres pasos (`/login`), la consulta pública (`/consulta`), las
  vistas del master (`/master` y sus rutas hijas), las del personal de salud (`/PS` y sus rutas hijas) y las de la
  subregión de salud (`/SRS` y sus rutas hijas) con datos mock. El certificado de la subregión se emite como vista
  simulada y el envío desde la consulta pública también es simulado; no hay correo real.

## Roles

| Rol                | Prefijo URL | Shell  |
| ------------------ | ----------- | ------ |
| Master             | `/master`   | propio |
| Personal de salud  | `/PS`       | propio |
| Subregión de salud | `/SRS`      | propio |

- Cada rol tiene su propio shell (layout, navegación y funciones visibles) porque la información y los permisos difieren.
- Páginas, rutas y alcance de cada rol: ver `docs/diseno/vistas.md`. Quedan decisiones abiertas, listadas en su sección 10.
- La **subregión (rol 3)** no tiene tabla propia: es una sede dentro de `centros_salud` con `tipo` (2 = centro,
  3 = sede de subregión; el nombre indica si es hospital, ambulatorio o CDI), una por estado. Su personal son filas de
  `personal` con `tipo_cuenta = 3` y `centro_id` apuntando a esa sede. Hay un solo jefe por centro, derivado de
  `centros_salud.encargado_id`. El login debe validar que el tipo elegido coincida con el tipo de cuenta y de centro.
- Los segmentos `PS` y `SRS` van en mayúsculas literales tanto en `path` como en los `routerLink`. Angular distingue mayúsculas: no mezclar `/PS` con `/ps`.

## Login

- Hoy `/login` tiene tres pasos: **tipo de cuenta** (roles 1–3), **credenciales de acceso** (de la entidad en los
  roles 2 y 3) y, solo para esos dos roles, **perfil de trabajo** (jefe o trabajador).
- El esquema recibido no trae credenciales de entidad. Para conservar el flujo se propone `cuentas_entidad`
  (credenciales, `centro_id` y `jefe_id`), ya agregada al **esquema de trabajo** pero no implementada. El segundo nivel
  sigue validando el correo y la contraseña de `personal`; el jefe se deriva de `jefe_id`/`encargado_id`.
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
- `src/app/nucleo/datos/subregion-salud.ts`: ámbito de la subregión de Guárico, solicitudes de certificado y
  notificaciones propias del rol 3. Solo las solicitudes completas generan notificación. Los ciudadanos y el personal
  tipo 2 se reutilizan de `master.ts`.
- `src/app/nucleo/servicios/datos-subregion-salud.service.ts`: consolida las fichas ciudadanas (vacunas, exámenes,
  requisitos y línea de tiempo), acota los datos al estado de la sesión y orquesta las solicitudes, decisiones,
  emisiones, notificaciones y el envío simulado del certificado con `signal`. También expone la búsqueda pública por
  cédula sin el filtro territorial del rol 3.
- `src/app/nucleo/servicios/`: servicios con `signal` que leen y mutan los mocks.
- Las vistas consumen servicios; nunca importan los arrays mock directamente.
- El esquema de trabajo está en `docs/referencias/db_schema.sql` y su lectura en `docs/diseno/modelo-datos.md`. **No se ha implementado**: los mocks siguen siendo la fuente de datos de la app.
- Correspondencia rápida: **ciudadano** → `usuarios` + teléfonos + residencias + catálogos; **personal** → `personal` + `centros_salud` + `profesiones`; **cuenta de entidad** → `cuentas_entidad` + `centros_salud`; **master** → `master`; **subregión** → `centros_salud` con `tipo = 3`; **certificado** → `certificados_salud` + `certificado_envios`; **notificación** → `notificaciones_srs`. Lotes, movimientos e incidencias todavía no tienen tabla.
- Los IDs reales serán enteros y los mocks usan strings. El mapeo futuro se concentra en `nucleo/servicios`; ningún componente debe depender de los nombres de columnas.

## Flujo de datos previsto

- **Consulta pública**: cédula → `usuarios` → ficha con residencia, teléfonos, conteos de vacunas/exámenes y estado del certificado. En esta etapa no pide código. Si el certificado está `autorizado` o `emitido`, permite marcar un envío simulado (`correoEnviado`); el esquema propone registrarlo en `certificado_envios` y auditar la consulta en `consultas_publicas`, pero esas escrituras quedan pendientes.
- **Login**: `master` para el rol 1; `cuentas_entidad` (propuesta) para el primer nivel de los roles 2 y 3, y `personal` para el perfil, validando `tipo_cuenta` y el `tipo` del centro. La subregión es una sede de `centros_salud`, no una tabla aparte.
- **Dashboard master**: implementado con mocks; el top 10 semanal por estado se podrá calcular con `usuario_vacunas` + `centros_salud.estado_id`, mientras que los lotes y los movimientos esperan sus tablas. El mapa usa la jerarquía `estado → mcpo → parroquia`.
- **Personal de salud**: centro de la sesión, trabajadores del centro y vacunaciones por centro. Los exámenes no están asociados a un centro.
- **Subregión**: implementado con mocks para consultar personal tipo 2, fichas ciudadanas del estado, certificados y
  notificaciones. La evaluación de requisitos usa la vigencia del catálogo de vacunas y una vigencia provisional de
  exámenes. Solo las solicitudes completas generan una notificación; revisar, autorizar, descartar o emitir no crea
  avisos nuevos. Las tablas de certificados, notificaciones y envíos están propuestas; stock, movimientos e incidencias
  siguen pendientes. El envío al correo se simula desde la consulta pública.

## Documentación de diseño

- `docs/diseno/vistas.md`: navegación, roles, rutas propuestas y descripción de cada pantalla, derivado de los bocetos a mano.
- `docs/diseno/modelo-datos.md`: **lectura del esquema de trabajo**, correspondencia con las vistas, flujos de datos, huecos y preguntas abiertas.
- `docs/diseno/modelo-datos-preliminar.md`: documento **histórico** con las hipótesis anteriores al SQL. No usar para implementar.
- `docs/diseno/credenciales-demo.md`: cuentas de prueba para recorrer los flujos de landing y login.
- `docs/diseno/imagenes/`: los 16 bocetos originales, organizados por carpeta.
- `docs/referencias/db_schema.sql`: esquema de trabajo con las extensiones del prototipo, **sin ejecutar**. La copia
  fiel del script recibido el 2026-10-25 está en `docs/referencias/db_schema_original_2026-10-25.sql`.
- El esquema de trabajo manda sobre el modelo preliminar y sobre los mocks. Al implementar, la capa de servicios absorbe
  el mapeo; las vistas que dependen de datos que aún no existen (lotes, stock, movimientos e incidencias) sí tendrán que
  ajustarse cuando lleguen esas tablas.

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

- **Esquema de base de datos**: el esquema de trabajo ya incluye certificados, notificaciones y envíos, además de las columnas acordadas (`usuarios.sexo`, `usuarios.creado_en`, `centros_salud.tipo`) y `cuentas_entidad`. Siguen faltando lotes/stock, movimientos, búsquedas e incidencias. No implementar hasta cerrar las preguntas de `docs/diseno/modelo-datos.md` §8.
- **Login**: se conserva el flujo de dos niveles; `cuentas_entidad` (propuesta) resuelve el primero y `personal` el segundo. Falta que el equipo de BD confirme la tabla y su nombre.
- Decisiones que siguen abiertas en `docs/diseno/vistas.md` §10: vigencia de exámenes y vacunas, credenciales reales y geodatos del mapa.
- Permisos por rol: el alcance funcional está descrito, falta la implementación (incluidos guards de ruta y persistencia de sesión).
- Bocetos originales de `/SRS`: no existen. Las vistas se diseñaron a partir del alcance del rol y ya están implementadas
  con mocks en `roles/subregion-salud/`; el master, `/PS` y `/SRS` usan `DatosMasterService`,
  `DatosPersonalSaludService` y `DatosSubregionSaludService`.
- `docs/diseno/` creció a ~4.5 MB de imágenes dentro del repo. Decidir si se versionan o se mueven a almacenamiento externo.
