# Arquitectura y decisiones

Última actualización: 2026-10-25

## Alcance actual

- Etapa de solo vistas y navegación. Sin backend, sin autenticación real, sin guards ni permisos efectivos todavía.
- Los datos se simulan con mocks tipados. Cuando exista backend se reemplaza la implementación de los servicios, sin tocar las vistas.
- Ya están construidos la landing (`/`), el login en tres pasos (`/login`), el placeholder de consulta (`/consulta`) y
  las páginas provisionales de los tres roles (`/master`, `/PS`, `/SRS`).

## Roles

| Rol                | Prefijo URL | Shell  |
| ------------------ | ----------- | ------ |
| Master             | `/master`   | propio |
| Personal de salud  | `/PS`       | propio |
| Subregión de salud | `/SRS`      | propio |

- Cada rol tiene su propio shell (layout, navegación y funciones visibles) porque la información y los permisos difieren.
- Páginas, rutas y alcance de cada rol: ver `docs/diseno/vistas.md`. Quedan decisiones abiertas, listadas en su sección 10.
- Los segmentos `PS` y `SRS` van en mayúsculas literales tanto en `path` como en los `routerLink`. Angular distingue mayúsculas: no mezclar `/PS` con `/ps`.

## Login

- `/login` tiene tres pasos: **tipo de cuenta** (roles 1–3), **credenciales de acceso** (de la entidad en los roles
  2 y 3) y, solo para esos dos roles, **perfil de trabajo** (jefe o trabajador).
- Los roles 2 y 3 validan dos niveles: primero la cuenta del centro o de la subregión y después las credenciales
  propias del perfil. El master entra directo tras el primer nivel.
- La validación es simulada con `SesionService`; no hay backend ni persistencia de sesión. Al recargar se pierde.
- Credenciales de prueba: `docs/diseno/credenciales-demo.md`. En desarrollo, el login muestra el mismo listado.
- El login pide **correo y contraseña** para todos los roles (decisión 16 de `vistas.md`); el nombre de usuario del
  master queda para cuando exista la base de datos.
- Al entrar se navega al prefijo del rol. Los guards y el refresco de sesión son trabajo pendiente.

## Datos mock

- `src/app/nucleo/modelos/`: interfaces del dominio (`Persona`, `Usuario`, etc.).
- `src/app/nucleo/datos/`: arrays hardcodeados.
- `src/app/nucleo/datos/catalogos.ts`: catálogos temporales (vacunas, profesiones, grados de instrucción, grupos étnicos, tipos de establecimiento, tipos de sangre), expuestos por `CatalogosService`. Serán tablas cuando exista la base de datos.
- `src/app/nucleo/datos/cuentas-acceso.ts`: cuentas de prueba con sus perfiles jefe/trabajador; las valida `SesionService`.
- `src/app/nucleo/servicios/`: servicios con `signal` que leen y mutan los mocks.
- Las vistas consumen servicios; nunca importan los arrays mock directamente.
- Los campos de `Persona` y `Usuario` **no** están definidos: dependen del esquema de base de datos, que todavía no existe. El boceto y sus dudas están en `docs/diseno/modelo-datos-preliminar.md`. Ningún componente debe depender de esos nombres.

## Documentación de diseño

- `docs/diseno/vistas.md`: navegación, roles, rutas propuestas y descripción de cada pantalla, derivado de los bocetos a mano.
- `docs/diseno/modelo-datos-preliminar.md`: entidades y campos esbozados, marcados como `esbozado`, `deducido` o `por confirmar`. No es el esquema de la base de datos.
- `docs/diseno/credenciales-demo.md`: cuentas de prueba para recorrer los flujos de landing y login.
- `docs/diseno/imagenes/`: los 16 bocetos originales, organizados por carpeta.
- El esquema real manda sobre el modelo preliminar. Cuando llegue, solo se ajusta la capa de servicios: las vistas no deberían cambiar.

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

## Reglas de modularidad (3 personas)

- Cada persona edita `src/app/roles/<rol>/` y su `*.routes.ts`.
- `app.routes.ts` solo compone con `loadChildren`; se toca al crear el esqueleto.
- Lo compartido vive en `nucleo/` y `compartido/`. Si dos roles necesitan lo mismo, se mueve ahí con revisión, no se duplica.
- Pendiente: `CODEOWNERS` y CI de GitHub Actions (`pnpm build`, `pnpm test --watch=false`, `pnpm format:check`).

## Pendientes

- Esquema de base de datos: reemplaza `docs/diseno/modelo-datos-preliminar.md` y convierte los catálogos temporales en tablas.
- Decisiones que siguen abiertas en `docs/diseno/vistas.md` §10: vigencia de exámenes y vacunas, credenciales reales y geodatos del mapa.
- Permisos por rol: el alcance funcional está descrito, falta la implementación (incluidos guards de ruta y persistencia de sesión).
- Bocetos de `/PS` y `/SRS`: todavía no existen; sus páginas actuales son placeholders.
- `docs/diseno/` creció a ~4.5 MB de imágenes dentro del repo. Decidir si se versionan o se mueven a almacenamiento externo.
