# Credenciales de prueba

Datos ficticios para recorrer la landing y el login mientras no existe backend. Viven en
`src/app/nucleo/datos/cuentas-acceso.ts`; `SesionService` los valida en memoria.

> No reutilizar estas cuentas ni contraseñas fuera del prototipo. Al recargar la página la sesión se pierde.

## Cómo entrar

1. Abrir `/login` y elegir el tipo de cuenta (1, 2 o 3).
2. Escribir el **correo y la contraseña de la entidad**.
3. Solo para los roles 2 y 3: elegir el perfil (jefe o trabajador) y escribir **su** correo y contraseña.

En desarrollo, el propio login muestra este listado dentro de un panel desplegable.

## Rol 1 · Master

| Nombre        | Correo              | Contraseña  | Nombre de usuario |
| ------------- | ------------------- | ----------- | ----------------- |
| Ana Rodríguez | `master@vih.gob.ve` | `master123` | `master`          |

Entra directo al panel provisional `/master`, sin segundo paso. El login actual pide correo; el nombre de usuario
queda reservado para cuando exista backend.

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

## Qué pasa después de entrar

Cada rol navega a su prefijo (`/master`, `/PS` o `/SRS`). Esas pantallas son provisionales: muestran la sesión
activa y permiten cerrarla. La consulta pública (`/consulta`) también es un placeholder y no pide credenciales.
