# Guía de Backend y Consultas SQL (Sistema V)

Última actualización: 2026-11-12  
Estado: **Módulo preparado en carpeta separada (`server/`), listo para conexión cuando se requiera.**

---

## 1. Arquitectura y Desacoplamiento

El sistema está concebido bajo una arquitectura desacoplada en tres capas:

```
[ Frontend Angular (Liquid Glass) ]  <-- No toca MySQL directamente
              │
              │  Peticiones HTTP (JSON / REST)
              ▼
[ Servidor API (server/index.mjs) ]  <-- Ejecuta lógica de negocio y consultas
              │
              │  Protocolo TCP MySQL (mysql2 / pool)
              ▼
[ Base de Datos MySQL (`vacunas`) ]  <-- 17 tablas relacionales (example.sql)
```

1. **Frontend (Angular 22 Zoneless con Signals)**:
   - Sigue funcionando de forma autónoma con datos mock y persistencia en `localStorage` mediante `DatosMasterService`, `DatosSubregionSaludService` y `DatosPersonalSaludService`.
   - No requiere MySQL activo para desarrollo de interfaz ni pruebas unitarias (`pnpm test`).
2. **Backend API (`server/`)**:
   - Servidor Node.js con Express y `mysql2/promise`.
   - Organizado en controladores por rol: `ps.model.mjs`, `srs.model.mjs` y `master.model.mjs`.
3. **Scripts SQL puros (`server/sql/`)**:
   - Sentencias `SELECT` con `JOIN`s e `INSERT`s documentadas para ejecución directa en MySQL Workbench, phpMyAdmin o DBeaver.

---

## 2. Estructura de la Carpeta `server/`

```
server/
├── db.mjs                          # Conexión al pool de MySQL y lectura de variables de entorno
├── index.mjs                       # Servidor Express con enrutamiento REST (/api/*)
├── modelos/
│   ├── ps.model.mjs                # Consultas e inserciones para Centro de Salud (/PS)
│   ├── srs.model.mjs               # Consultas e inserciones para Subregión de Salud (/SRS)
│   └── master.model.mjs            # Consultas e inserciones para Nivel Central Master (/master)
└── sql/
    ├── consultas_ps.sql            # Sentencias SQL directas para Centro de Salud
    ├── consultas_srs.sql           # Sentencias SQL directas para Subregión de Salud
    └── consultas_master.sql        # Sentencias SQL directas para Administrador Master
```

---

## 3. Catálogo de Endpoints de la API

### Diagnóstico
- `GET /api/health`: Comprueba la conexión en vivo con MySQL y devuelve la lista de tablas activas.

### Rol Personal de Salud (`/PS`)
- `GET /api/ps/centro?id=1`: Devuelve los datos del Centro de Salud y su Autoridad/Jefe titular.
- `GET /api/ps/pacientes?centroId=1`: Lista todos los pacientes (adultos y menores) atendidos en el centro.
- `POST /api/ps/pacientes`: Inserta un nuevo ciudadano en `ciudadano_mayor_edad` o `ciudadano_menor_edad`.
- `POST /api/ps/inmunizaciones`: Inserta un registro de vacuna aplicada en `inmunizacion`.
- `POST /api/ps/reportes`: Inserta un evento adverso en `reportes` (ESAVI).

### Rol Subregión de Salud (`/SRS`)
- `GET /api/srs/sede?estadoId=1`: Consulta los datos de la sede estadal y su Jefe titular.
- `GET /api/srs/centros?estadoId=1`: Lista los Centros de Salud adscritos con conteo de inmunizaciones.
- `POST /api/srs/centros`: Da de alta un nuevo centro de salud en la jurisdicción estadal.
- `GET /api/srs/personal?estadoId=1`: Consulta el padrón de personal y autoridades del estado.
- `POST /api/srs/personal`: Da de alta una nueva autoridad con su usuario y centro asignado.
- `GET /api/srs/certificados?estadoId=1`: Lista las solicitudes de certificados de salud emitidas.
- `PUT /api/srs/certificados/:id`: Dictamina (aprueba o rechaza) un certificado (`UPDATE certificado`).
- `GET /api/srs/metricas?estadoId=1`: Devuelve las métricas agregadas y cobertura de requisitos del estado.

### Rol Master (`/master`)
- `GET /api/master/subregiones`: Directorio nacional de subregiones estadales.
- `POST /api/master/subregiones`: Configura o da de alta una sede de subregión.
- `GET /api/master/centros?estadoId=...`: Catálogo de centros de salud con filtro opcional por estado.
- `GET /api/master/autoridades`: Padrón nacional de autoridades sanitarias del MPPS.
- `GET /api/master/vacunas`: Catálogo de biológicos oficiales con conteo de dosis aplicadas.
- `POST /api/master/vacunas`: Incorpora una nueva vacuna al esquema oficial.
- `GET /api/master/buscar?q=...`: Búsqueda unificada global por cédula o nombre en mayores y menores.
- `GET /api/master/metricas`: Telemetría consolidada nacional y ranking de dosis por estado.

---

## 4. Instrucciones para Levantar la Base de Datos y la API

Cuando el equipo decida activar la base de datos real:

### Paso 1: Crear la Base de Datos en MySQL
1. Abrir MySQL Workbench, DBeaver o la consola de MySQL.
2. Ejecutar el script: [`docs/referencias/example.sql`](../referencias/example.sql).
3. Este script creará la base de datos `vacunas`, sus 17 tablas y las claves foráneas necesarias.

### Paso 2: Configurar Variables de Entorno (Opcional)
Crear un archivo `.env` en la raíz del proyecto (o configurar variables de entorno):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=vacunas
API_PORT=3000
```

### Paso 3: Iniciar el Servidor API
En una terminal secundaria:
```bash
node server/index.mjs
```
El servidor confirmará en consola:
```
[API Sistema V] Servidor Express corriendo en http://localhost:3000
[API Sistema V] Endpoint de salud: http://localhost:3000/api/health
```

---

## 5. Cómo Conectar Angular a la API Cuando se Desee

Actualmente, los servicios en `src/app/nucleo/servicios/`:
- `DatosMasterService`
- `DatosSubregionSaludService`
- `DatosPersonalSaludService`

mantienen el estado en Signals. Para conectarlos con el backend, solo se agregará `HttpClient` en sus métodos:

```typescript
// Ejemplo en DatosSubregionSaludService:
crearCentro(dto: CrearCentroSrsDto) {
  return this.http.post<CentroAdscritoSrsSql>('http://localhost:3000/api/srs/centros', dto).pipe(
    tap((nuevoCentro) => {
      // Actualiza la Signal local reactiva
      this._centros.update((actuales) => [...actuales, nuevoCentro]);
    })
  );
}
```

De esta manera, **ningún componente ni vista de Angular requerirá modificaciones**.

