# Credenciales de prueba

Datos ficticios para recorrer la landing y el login mientras no existe backend. Viven inicialmente en
`src/app/nucleo/datos/cuentas-acceso.ts`; `SesionService` los valida y persiste las altas en `localStorage`
(`vih_cuentas_acceso_v2`).

> No reutilizar estas cuentas ni contraseñas fuera del prototipo. La sesión activa vive en memoria y se reinicia al recargar la página, pero los jefes de centros y subregiones creados o reasignados desde `/master` o `/SRS` quedan guardados en `localStorage` y aparecen automáticamente en el desplegable **Credenciales de prueba** de `/login`.

> **Un único usuario por entidad (sin sub-usuarios):** ni Subregión de Salud (`SRS`, rol 3) ni Centro de Salud (`PS`, rol 2) tienen sub-usuarios asignados (`trabajadores`, `enfermeros`, `analistas`). Cada centro o subregión cuenta únicamente con el usuario de su **Jefe / Encargado** (`centros_salud.encargado_id`), quien inicia sesión directamente con su correo y contraseña registrados en la tabla `personal` (`tipo_cuenta = 2` o `3`). Ver `modelo-datos.md` §5.1.

## Cómo entrar

1. Abrir `/login` y elegir el tipo de cuenta (1, 2 o 3).
2. Escribir el **correo y la contraseña del usuario** (Master, Jefe de Centro o Jefe de Subregión) y pulsar **Iniciar sesión**.

En desarrollo, el propio login muestra este listado dentro de un panel desplegable.

## Rol 1 · Master

| Nombre        | Correo              | Contraseña  | Nombre de usuario |
| ------------- | ------------------- | ----------- | ----------------- |
| Ana Rodríguez | `master@vih.gob.ve` | `master123` | `master`          |

Entra directo al panel `/master`. El dashboard saluda con `nombre_usuario` (`master`); "Ana Rodríguez" es solo el nombre visible de la demo y no se guarda como columna.

## Rol 2 · Centro de salud (Jefe de Centro)

| Nombre           | Entidad asignada           | Correo                   | Contraseña |
| ---------------- | -------------------------- | ------------------------ | ---------- |
| Dra. María Pérez | Centro de Salud La Pastora | `jefe.centro@vih.gob.ve` | `jefe123`  |

Entra directo al panel `/PS` como Jefe / Encargado del centro de salud.

## Rol 3 · Subregión de salud (Jefe de Subregión)

| Nombre            | Entidad asignada           | Correo                      | Contraseña |
| ----------------- | -------------------------- | --------------------------- | ---------- |
| Lic. Carlos Rojas | Subregión de Salud Guárico | `jefe.subregion@vih.gob.ve` | `jefe123`  |

Entra directo al panel `/SRS` como Jefe / Encargado de la subregión estadal.

## Altas dinámicas desde `/master` y `/SRS`

Cuando se registra un nuevo centro, una nueva subregión o se asigna un nuevo jefe encargado desde las vistas de administración (`/master/personal/*`, `/SRS/centros` o `/SRS/trabajadores`), `DatosMasterService` y `DatosSubregionSaludService` sincronizan automáticamente la cuenta directa del jefe en `SesionService` (`registrarCuentaCentro`):

| Elemento registrado                             | Correo asignado                           | Contraseña por defecto |
| ----------------------------------------------- | ----------------------------------------- | ---------------------- |
| Jefe de Centro de Salud (`rol = 2`, `tipo = 2`) | Correo ingresado en el formulario de alta | `jefe123`              |
| Jefe de Subregión (`rol = 3`, `tipo = 3`)       | Correo ingresado en el formulario de alta | `jefe123`              |

Si se asigna un nuevo jefe a un centro o subregión existente, este reemplaza al encargado anterior en `centros_salud.encargado_id` y actualiza la cuenta de acceso de esa entidad en `SesionService`.

## Correspondencia con el esquema real

Las cuentas de esta página son ficticias. Cuando se implemente la base de datos, cada una se reparte así:

| Cuenta demo                        | Tabla prevista  | Campos y observaciones                                                                                                                                                     |
| ---------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ana Rodríguez (master)             | `master`        | `nombre_usuario = master`, `correo`, `password` (hash). No tiene `nombre`: "Ana Rodríguez" es solo el nombre visible de la demo; el dashboard saluda con `nombre_usuario`. |
| Centro de Salud La Pastora         | `centros_salud` | Fila con `tipo = 2` (columna agregada), nombre, estado/municipio/parroquia, `codigo` y `encargado_id = Dra. María Pérez`.                                                  |
| Subregión de Salud Guárico         | `centros_salud` | Fila con `tipo = 3` (columna agregada), nombre, `estado_id = Guárico` y `encargado_id = Lic. Carlos Rojas`. No existe una tabla `subregion`.                               |
| Dra. María Pérez (jefe de centro)  | `personal`      | `tipo_cuenta = 2`, `centro_id = La Pastora`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. Es el único usuario del centro (`encargado_id`).         |
| Lic. Carlos Rojas (jefe subregión) | `personal`      | `tipo_cuenta = 3`, `centro_id = sede de subregión Guárico`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. Es el único usuario de la sede.           |

Consecuencias:

- No hace falta una tabla `cuentas_entidad` ni perfiles subordinados: cada centro (`tipo = 2`) y cada subregión (`tipo = 3`) tiene un único usuario en `personal` correspondiente a su jefe encargado (`centros_salud.encargado_id`).
- Hay un solo jefe por centro o sede; no hay columna `tipo_empleado`.
- Las contraseñas de la base de datos deben guardarse con hash; las de esta página son texto plano solo porque son datos falsos de demostración.
- El jefe encargado necesita cédula, profesión, número profesional, nacimiento y centro; el formulario de alta tendrá que pedirlos.
- El alta de ciudadano pedirá profesión; si no tiene, se usa "Desempleado" del catálogo. `usuarios.creado_en` se llena automáticamente.

## Qué pasa después de entrar

Cada rol navega directamente a su prefijo (`/master`, `/PS` o `/SRS`). El master, `/PS` y `/SRS` abren sus paneles con navegación y vistas mock; la subregión incluye jefes de centro del estado, ciudadanos, certificados y notificaciones. La consulta pública (`/consulta`) ya está implementada, no pide credenciales ni código de verificación en esta etapa y permite simular el envío del certificado aprobado o emitido.
