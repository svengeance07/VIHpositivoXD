---
trigger: always_on
description: Leer y mantener sincronizada la documentación en docs/ antes y después de realizar cambios en el código
---

# Regla de lectura previa y sincronización de `docs/`

1. **Lectura obligatoria antes de editar `src/`**:
   Antes de crear o modificar componentes, rutas, modelos o servicios, lee siempre los archivos relevantes de la carpeta `docs/`:
   - `docs/arquitectura.md`: arquitectura general, roles (`/master`, `/PS`, `/SRS`), servicios con `signal`, persistencia en `localStorage` y decisiones pendientes.
   - `docs/diseno/vistas.md`: inventario de rutas, comportamiento esperado de cada pantalla y patrones de interfaz.
   - `docs/diseno/modelo-datos.md`: esquema de trabajo (`docs/referencias/db_schema.sql`), reglas de negocio (subregiones como `centros_salud` con `tipo = 3`, jefe derivado de `encargado_id`, notificaciones exclusivas para solicitudes completas, etc.).
   - `docs/diseno/credenciales-demo.md`: flujo de login directo en dos pasos (elección de rol + credenciales del Jefe de Centro/Subregión o Master en `personal` / `master`, sin sub-usuarios) y credenciales de prueba sincronizadas con `SesionService`.

2. **Coherencia con el modelo de dominio**:
   Ningún cambio en la interfaz o en los servicios debe contradecir las decisiones confirmadas en `docs/diseno/modelo-datos.md` ni en `docs/diseno/vistas.md`.

3. **Actualización posterior**:
   Cuando un cambio agregue o modifique rutas, flujos de datos, persistencia o comportamiento de vistas, actualiza los archivos correspondientes en `docs/` antes de dar por concluida la tarea.
