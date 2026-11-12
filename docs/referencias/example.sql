-- =====================================================================
-- 1. CREACIÓN DE LA BASE DE DATOS Y TABLAS (Sin llaves foráneas)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS vacunas;
USE vacunas;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT PRIMARY KEY AUTO_INCREMENT,
    correo_usuario VARCHAR(255),
    contrasena VARCHAR(255),
    tipo_usuario ENUM('master','centro_salud_jefe','subregion')
);

CREATE TABLE IF NOT EXISTS profesiones (
    id_profesion INT PRIMARY KEY AUTO_INCREMENT,
    nombre_profesion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS parroquias (
    id_parroquia INT PRIMARY KEY AUTO_INCREMENT,
    nombre_parroquia VARCHAR(255) NOT NULL,
    municipio_id INT,
    estado_id INT
); 

CREATE TABLE IF NOT EXISTS municipios (
    id_municipio INT PRIMARY KEY AUTO_INCREMENT,
    nombre_municipio VARCHAR(255) NOT NULL,
    estado_id INT
); 

CREATE TABLE IF NOT EXISTS estados (
    id_estado INT PRIMARY KEY AUTO_INCREMENT,
    nombre_estado VARCHAR(255) NOT NULL
); 

CREATE TABLE IF NOT EXISTS etnias (
    id_etnia INT PRIMARY KEY AUTO_INCREMENT,
    nombre_etnia VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS vacunas (
    id_vacuna INT PRIMARY KEY AUTO_INCREMENT,
    nombre_vacuna VARCHAR(100) NOT NULL,
    cantidad_dosis INT NOT NULL
);

CREATE TABLE IF NOT EXISTS sintomas_comunes (
    id_sintoma INT PRIMARY KEY AUTO_INCREMENT,
    descripcion_sintoma VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS examenes (
    id_examenes INT PRIMARY KEY AUTO_INCREMENT,
    nombre_examen VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS autoridades (
    id_autoridades INT PRIMARY KEY AUTO_INCREMENT,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50) NOT NULL,
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50) NOT NULL,
    c_i INT NOT NULL UNIQUE,
    n_impre INT NOT NULL,
    domicilio VARCHAR(255),
    telefono VARCHAR(20) NOT NULL,
    usuario_id INT,
    profesion_id INT
);

CREATE TABLE IF NOT EXISTS centro_salud (
    id_centro INT PRIMARY KEY AUTO_INCREMENT,
    nombre_centro VARCHAR(100) NOT NULL,
    ubicacion_centro VARCHAR(255) NOT NULL,
    codigo_centro VARCHAR(10) NOT NULL,
    id_jefe_centro INT,
    parroquia_id INT,
    municipio_id INT,
    estado_id INT
);

CREATE TABLE IF NOT EXISTS subregion (
    id_subregion INT PRIMARY KEY AUTO_INCREMENT,
    ubicacion VARCHAR(255) NOT NULL,
    parroquia_id INT,
    municipio_id INT,
    estado_id INT,
    id_jefe_subregion INT
);

CREATE TABLE IF NOT EXISTS ciudadano_mayor_edad (
    id_ciudadano INT PRIMARY KEY AUTO_INCREMENT,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    c_i INT NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('masculino','femenino') NOT NULL,
    tipo_sangre ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-') NOT NULL,
    estatura INT NOT NULL,
    correo_electronico VARCHAR(100),
    telefono_celular VARCHAR(20),
    telefono_domicilio VARCHAR(20),
    domicilio VARCHAR(255) NOT NULL,
    profesion_id INT,
    parroquia_id INT,
    municipio_id INT,
    estado_id INT,
    etnia_id INT
);

CREATE TABLE IF NOT EXISTS inmunizacion (
    id_inmunizacion INT PRIMARY KEY AUTO_INCREMENT,
    numero_dosis INT NOT NULL,
    fecha_aplicacion DATE,
    numero_lote VARCHAR(30),
    observaciones VARCHAR(255),
    centro_salud_aplicacion INT,
    vacuna_id INT,
    ciudadano_mayor_edad_id INT,
    ciudadano_mayor_menor_id INT
);

CREATE TABLE IF NOT EXISTS ciudadano_menor_edad (
    id_menor INT PRIMARY KEY AUTO_INCREMENT,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('masculino','femenino') NOT NULL,
    tipo_sangre ENUM('O+', 'O-','A+','A-','B+','B-','AB+','AB-') NOT NULL,
    estatura INT NOT NULL,
    domicilio VARCHAR(255) NOT NULL,
    parroquia_id INT,
    municipio_id INT,
    estado_id INT,
    etnia_id INT,
    padre_id INT
);

CREATE TABLE IF NOT EXISTS reportes (
    id_reportes INT PRIMARY KEY AUTO_INCREMENT,
    nivel_gravedad ENUM('LEVE','MODERADO','SEVERO') NOT NULL,
    recomendaciones VARCHAR(255) NOT NULL,
    inmunizacion_id INT,
    ciudadano_mayor_id INT,
    ciudadano_menor_id INT,
    sintoma_id INT
);

CREATE TABLE IF NOT EXISTS certificado (
    id_certificado INT PRIMARY KEY AUTO_INCREMENT,
    fecha_emision DATE NOT NULL,
    estatus ENUM('RECHAZADO','APROBADO') NOT NULL,
    ciudadano_mayor_id INT,
    examen_id INT
);


-- =====================================================================
-- 2. APLICACIÓN DE LLAVES FORÁNEAS MEDIANTE ALTER TABLE
-- =====================================================================

-- Autoridades
ALTER TABLE autoridades
ADD CONSTRAINT fk_autoridades_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios),
ADD CONSTRAINT fk_autoridades_profesion FOREIGN KEY (profesion_id) REFERENCES profesiones(id_profesion);

-- Centro de Salud
ALTER TABLE centro_salud
ADD CONSTRAINT fk_centro_jefe FOREIGN KEY (id_jefe_centro) REFERENCES autoridades(id_autoridades),
ADD CONSTRAINT fk_parroquia_centro FOREIGN KEY (parroquia_id) REFERENCES parroquias(id_parroquia),
ADD CONSTRAINT fk_municipio_centro FOREIGN KEY (municipio_id) REFERENCES municipios(id_municipio),
ADD CONSTRAINT fk_estado_centro FOREIGN KEY (estado_id) REFERENCES estados(id_estado);

-- Subregión
ALTER TABLE subregion
ADD CONSTRAINT fk_subregion_parroquia FOREIGN KEY (parroquia_id) REFERENCES parroquias(id_parroquia),
ADD CONSTRAINT fk_subregion_municipio FOREIGN KEY (municipio_id) REFERENCES municipios(id_municipio),
ADD CONSTRAINT fk_subregion_estado FOREIGN KEY (estado_id) REFERENCES estados(id_estado),
ADD CONSTRAINT fk_subregion_jefe FOREIGN KEY (id_jefe_subregion) REFERENCES autoridades(id_autoridades);

-- Ciudadano Mayor de Edad
ALTER TABLE ciudadano_mayor_edad
ADD CONSTRAINT fk_ciudadano_mayor_profesion FOREIGN KEY (profesion_id) REFERENCES profesiones(id_profesion),
ADD CONSTRAINT fk_ciudadano_mayor_parroquia FOREIGN KEY (parroquia_id) REFERENCES parroquias(id_parroquia),
ADD CONSTRAINT fk_ciudadano_mayor_municipio FOREIGN KEY (municipio_id) REFERENCES municipios(id_municipio),
ADD CONSTRAINT fk_ciudadano_mayor_estado FOREIGN KEY (estado_id) REFERENCES estados(id_estado),
ADD CONSTRAINT fk_ciudadano_mayor_etnia FOREIGN KEY (etnia_id) REFERENCES etnias(id_etnia);

-- Inmunización (Corregidos errores lógicos de referencias cruzadas previas)
ALTER TABLE inmunizacion
ADD CONSTRAINT fk_inmunizacion_centro FOREIGN KEY (centro_salud_aplicacion) REFERENCES centro_salud(id_centro),
ADD CONSTRAINT fk_inmunizacion_vacuna FOREIGN KEY (vacuna_id) REFERENCES vacunas(id_vacuna),
ADD CONSTRAINT fk_ciudadano_inmunizacion_mayor FOREIGN KEY (ciudadano_mayor_edad_id) REFERENCES ciudadano_mayor_edad(id_ciudadano),
ADD CONSTRAINT fk_ciudadano_inmunizacion_menor FOREIGN KEY (ciudadano_mayor_menor_id) REFERENCES ciudadano_menor_edad(id_menor);

-- Ciudadano Menor de Edad
ALTER TABLE ciudadano_menor_edad
ADD CONSTRAINT fk_ciudadano_menor_parroquia FOREIGN KEY (parroquia_id) REFERENCES parroquias(id_parroquia),
ADD CONSTRAINT fk_ciudadano_menor_municipio FOREIGN KEY (municipio_id) REFERENCES municipios(id_municipio),
ADD CONSTRAINT fk_ciudadano_menor_estado FOREIGN KEY (estado_id) REFERENCES estados(id_estado),
ADD CONSTRAINT fk_ciudadano_menor_etnia FOREIGN KEY (etnia_id) REFERENCES etnias(id_etnia),
ADD CONSTRAINT fk_ciudadano_padre_menor FOREIGN KEY (padre_id) REFERENCES ciudadano_mayor_edad(id_ciudadano);

-- Reportes (Corregidas referencias a síntomas y menor de edad)
ALTER TABLE reportes
ADD CONSTRAINT fk_reportes_inmunizacion FOREIGN KEY (inmunizacion_id) REFERENCES inmunizacion(id_inmunizacion),
ADD CONSTRAINT fk_reportes_ciudadano_mayor FOREIGN KEY (ciudadano_mayor_id) REFERENCES ciudadano_mayor_edad(id_ciudadano),
ADD CONSTRAINT fk_reportes_ciudadano_menor FOREIGN KEY (ciudadano_menor_id) REFERENCES ciudadano_menor_edad(id_menor);

-- Certificado
ALTER TABLE certificado
ADD CONSTRAINT fk_certificado_ciudadano FOREIGN KEY (ciudadano_mayor_id) REFERENCES ciudadano_mayor_edad(id_ciudadano),
ADD CONSTRAINT fk_certificado_examen FOREIGN KEY (examen_id) REFERENCES examenes(id_examenes);

-- Municipios
ALTER TABLE municipios 
ADD CONSTRAINT fk_estado_municipio FOREIGN KEY (estado_id) REFERENCES estados(id_estado);


ALTER TABLE parroquias 
ADD CONSTRAINT fk_estado_parroquia FOREIGN KEY (estado_id) REFERENCES estados(id_estado),
ADD CONSTRAINT fk_municipio_parroquia FOREIGN KEY (municipio_id) REFERENCES municipios(id_municipio);

ALTER TABLE reportes
ADD CONSTRAINT fk_sintomas FOREIGN KEY (sintoma_id) REFERENCES sintomas_comunes(id_sintoma);

