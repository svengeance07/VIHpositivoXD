# Credenciales de prueba

Datos ficticios para recorrer la landing y el login mientras no existe backend. Viven en
`src/app/nucleo/datos/cuentas-acceso.ts`; `SesionService` los valida en memoria.

> No reutilizar estas cuentas ni contraseñas fuera del prototipo. Al recargar la página la sesión se pierde.

> **Simulación vs. esquema real:** el login actual valida dos niveles (cuenta de entidad + perfil). El script
> parcial no trae credenciales de entidad; para resolverlo se propone la tabla `cuentas_entidad` (credenciales,
> `centro_id` y `jefe_id`). Los perfiles siguen en `personal` y `tipo_cuenta` (2 o 3) debe coincidir con el tipo
> elegido y con `centros_salud.tipo`. Las cuentas de abajo sirven para recorrer la UI actual; la tabla propuesta
> todavía no está implementada. Ver `modelo-datos.md` §5.1.

## Cómo entrar

1. Abrir `/login` y elegir el tipo de cuenta (1, 2 o 3).
2. Escribir el **correo y la contraseña de la entidad**.
3. Solo para los roles 2 y 3: elegir el perfil (jefe o trabajador) y escribir **su** correo y contraseña.

En desarrollo, el propio login muestra este listado dentro de un panel desplegable.

## Rol 1 · Master

| Nombre        | Correo              | Contraseña  | Nombre de usuario |
| ------------- | ------------------- | ----------- | ----------------- |
| Ana Rodríguez | `master@vih.gob.ve` | `master123` | `master`          |

Entra directo al panel provisional `/master`, sin segundo paso. El dashboard futuro saludará con
`nombre_usuario` (`master`); "Ana Rodríguez" es solo el nombre visible de la demo y no se guarda como columna.

## Rol 2 · Centro de salud

**Cuenta de la entidad**

| Entidad                    | Correo              | Contraseña  |
| -------------------------- | ------------------- | ----------- |
| Centro de Salud La Pastora | `centro@vih.gob.ve` | `centro123` |

**Perfiles de trabajo**

| Perfil     | Nombre           | Correo                        | Contraseña     |
| ---------- | ---------------- | ----------------------------- | -------------- |
| Jefe       | Dra. María Pérez | `jefe.centro@vih.gob.ve`      | `jefe123`      |
| Trabajador | Enf. Luis Gómez  | `enfermero.centro@vih.gob.ve` | `enfermero123` |

## Rol 3 · Subregión de salud

**Cuenta de la entidad**

| Entidad                    | Correo                 | Contraseña     |
| -------------------------- | ---------------------- | -------------- |
| Subregión de Salud Guárico | `subregion@vih.gob.ve` | `subregion123` |

**Perfiles de trabajo**

| Perfil     | Nombre              | Correo                          | Contraseña    |
| ---------- | ------------------- | ------------------------------- | ------------- |
| Jefe       | Lic. Carlos Rojas   | `jefe.subregion@vih.gob.ve`     | `jefe123`     |
| Trabajador | Analista Sofía Díaz | `analista.subregion@vih.gob.ve` | `analista123` |

## Correspondencia con el esquema real

Las cuentas de esta página son ficticias. Cuando se implemente la base de datos, cada una se reparte así:

| Cuenta demo                    | Tabla prevista                | Campos y observaciones                                                                                                                                                                        |
| ------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ana Rodríguez (master)         | `master`                      | `nombre_usuario = master`, `correo`, `password` (hash). No tiene `nombre`: "Ana Rodríguez" es solo el nombre visible de la demo; el dashboard saluda con `nombre_usuario`.                    |
| Cuenta de entidad · La Pastora | `cuentas_entidad` (propuesta) | `centro_id = La Pastora`, `correo`, `password` (hash) y `jefe_id = Dra. María Pérez`. Es el primer nivel del login.                                                                           |
| Centro de Salud La Pastora     | `centros_salud`               | Fila con `tipo = 2` (columna a agregar), nombre, estado/municipio/parroquia, `codigo` y `encargado_id = Dra. María Pérez`.                                                                    |
| Cuenta de entidad · Guárico    | `cuentas_entidad` (propuesta) | `centro_id = sede de subregión Guárico`, `correo`, `password` (hash) y `jefe_id = Lic. Carlos Rojas`. Es el primer nivel del login.                                                           |
| Subregión de Salud Guárico     | `centros_salud`               | Fila con `tipo = 3` (columna a agregar), nombre, `estado_id = Guárico` y `encargado_id = Lic. Carlos Rojas`. No existe una tabla `subregion`.                                                 |
| Dra. María Pérez (jefe)        | `personal`                    | `tipo_cuenta = 2`, `centro_id = La Pastora`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. Es el `encargado_id` del centro y el `jefe_id` de la cuenta de entidad.     |
| Enf. Luis Gómez (trabajador)   | `personal`                    | `tipo_cuenta = 2`, `centro_id = La Pastora`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. No es el encargado del centro.                                              |
| Lic. Carlos Rojas (jefe)       | `personal`                    | `tipo_cuenta = 3`, `centro_id = sede de subregión Guárico`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. Es el `encargado_id` de la sede y el `jefe_id` de su cuenta. |
| Analista Sofía Díaz            | `personal`                    | `tipo_cuenta = 3`, `centro_id = sede de subregión Guárico`, cédula, correo, `password` (hash), `profesion_id`, `id_profesional`. No es la encargada de la sede.                               |

Consecuencias:

- La "cuenta de la entidad" pasa a `cuentas_entidad` (propuesta, no está en el script). Conserva el login de dos
  niveles: primero la entidad y después el perfil de `personal`. La UI actual no cambia.
- `cuentas_entidad` no guarda la lista de perfiles: los trabajadores son las filas de `personal` con el mismo
  `centro_id`. El jefe se distingue con `jefe_id`, que debe coincidir con `centros_salud.encargado_id`.
- Hay un solo jefe por centro o sede; no hay columna `tipo_empleado`.
- Las contraseñas de la base de datos deben guardarse con hash; las de esta página son texto plano solo porque son
  datos falsos de demostración.
- El personal necesita cédula, profesión, número profesional, nacimiento y centro; el formulario de alta tendrá que
  pedirlos.
- El alta de ciudadano pedirá profesión; si no tiene, se usa "Desempleado" del catálogo. `usuarios.creado_en` se
  llena automáticamente.

## Qué pasa después de entrar

Cada rol navega a su prefijo (`/master`, `/PS` o `/SRS`). El master, `/PS` y `/SRS` abren sus paneles con navegación
y vistas mock; la subregión incluye personal, ciudadanos, certificados y notificaciones. La consulta pública
(`/consulta`) sigue siendo un placeholder y no pide credenciales.
