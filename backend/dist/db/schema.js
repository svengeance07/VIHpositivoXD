import { relations } from 'drizzle-orm';
import { date, index, int, mysqlEnum, mysqlTable, uniqueIndex, varchar, } from 'drizzle-orm/mysql-core';
export const TIPO_USUARIO_VALUES = [
    'master',
    'centro_salud_jefe',
    'subregion',
];
export const SEXO_VALUES = ['masculino', 'femenino'];
export const TIPO_SANGRE_VALUES = [
    'O+',
    'O-',
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
];
export const NIVEL_GRAVEDAD_VALUES = ['LEVE', 'MODERADO', 'SEVERO'];
export const ESTATUS_CERTIFICADO_VALUES = ['RECHAZADO', 'APROBADO'];
export const usuarios = mysqlTable('usuarios', {
    id_usuarios: int('id_usuarios').autoincrement().primaryKey(),
    correo_usuario: varchar('correo_usuario', { length: 255 }),
    contrasena: varchar('contrasena', { length: 255 }),
    tipo_usuario: mysqlEnum('tipo_usuario', TIPO_USUARIO_VALUES),
});
export const profesiones = mysqlTable('profesiones', {
    id_profesion: int('id_profesion').autoincrement().primaryKey(),
    nombre_profesion: varchar('nombre_profesion', { length: 255 }).notNull(),
});
export const estados = mysqlTable('estados', {
    id_estado: int('id_estado').autoincrement().primaryKey(),
    nombre_estado: varchar('nombre_estado', { length: 255 }).notNull(),
});
export const municipios = mysqlTable('municipios', {
    id_municipio: int('id_municipio').autoincrement().primaryKey(),
    nombre_municipio: varchar('nombre_municipio', { length: 255 }).notNull(),
    estado_id: int('estado_id').references(() => estados.id_estado),
}, (table) => [index('idx_municipios_estado_id').on(table.estado_id)]);
export const parroquias = mysqlTable('parroquias', {
    id_parroquia: int('id_parroquia').autoincrement().primaryKey(),
    nombre_parroquia: varchar('nombre_parroquia', { length: 255 }).notNull(),
    municipio_id: int('municipio_id').references(() => municipios.id_municipio),
    estado_id: int('estado_id').references(() => estados.id_estado),
}, (table) => [
    index('idx_parroquias_municipio_id').on(table.municipio_id),
    index('idx_parroquias_estado_id').on(table.estado_id),
]);
export const etnias = mysqlTable('etnias', {
    id_etnia: int('id_etnia').autoincrement().primaryKey(),
    nombre_etnia: varchar('nombre_etnia', { length: 100 }).notNull(),
});
export const vacunas = mysqlTable('vacunas', {
    id_vacuna: int('id_vacuna').autoincrement().primaryKey(),
    nombre_vacuna: varchar('nombre_vacuna', { length: 100 }).notNull(),
    cantidad_dosis: int('cantidad_dosis').notNull(),
});
export const sintomasComunes = mysqlTable('sintomas_comunes', {
    id_sintoma: int('id_sintoma').autoincrement().primaryKey(),
    descripcion_sintoma: varchar('descripcion_sintoma', { length: 255 }),
});
export const examenes = mysqlTable('examenes', {
    id_examenes: int('id_examenes').autoincrement().primaryKey(),
    nombre_examen: varchar('nombre_examen', { length: 100 }).notNull(),
});
export const autoridades = mysqlTable('autoridades', {
    id_autoridades: int('id_autoridades').autoincrement().primaryKey(),
    primer_nombre: varchar('primer_nombre', { length: 50 }).notNull(),
    segundo_nombre: varchar('segundo_nombre', { length: 50 }).notNull(),
    primer_apellido: varchar('primer_apellido', { length: 50 }).notNull(),
    segundo_apellido: varchar('segundo_apellido', { length: 50 }).notNull(),
    c_i: int('c_i').notNull(),
    n_impre: int('n_impre').notNull(),
    domicilio: varchar('domicilio', { length: 255 }),
    telefono: varchar('telefono', { length: 20 }).notNull(),
    usuario_id: int('usuario_id').references(() => usuarios.id_usuarios),
    profesion_id: int('profesion_id').references(() => profesiones.id_profesion),
}, (table) => [
    uniqueIndex('uq_autoridades_c_i').on(table.c_i),
    index('idx_autoridades_usuario_id').on(table.usuario_id),
    index('idx_autoridades_profesion_id').on(table.profesion_id),
]);
export const centroSalud = mysqlTable('centro_salud', {
    id_centro: int('id_centro').autoincrement().primaryKey(),
    nombre_centro: varchar('nombre_centro', { length: 100 }).notNull(),
    ubicacion_centro: varchar('ubicacion_centro', { length: 255 }).notNull(),
    codigo_centro: varchar('codigo_centro', { length: 10 }).notNull(),
    id_jefe_centro: int('id_jefe_centro').references(() => autoridades.id_autoridades),
    parroquia_id: int('parroquia_id').references(() => parroquias.id_parroquia),
    municipio_id: int('municipio_id').references(() => municipios.id_municipio),
    estado_id: int('estado_id').references(() => estados.id_estado),
}, (table) => [
    index('idx_centro_salud_jefe').on(table.id_jefe_centro),
    index('idx_centro_salud_parroquia').on(table.parroquia_id),
    index('idx_centro_salud_municipio').on(table.municipio_id),
    index('idx_centro_salud_estado').on(table.estado_id),
]);
export const subregion = mysqlTable('subregion', {
    id_subregion: int('id_subregion').autoincrement().primaryKey(),
    ubicacion: varchar('ubicacion', { length: 255 }).notNull(),
    parroquia_id: int('parroquia_id').references(() => parroquias.id_parroquia),
    municipio_id: int('municipio_id').references(() => municipios.id_municipio),
    estado_id: int('estado_id').references(() => estados.id_estado),
    id_jefe_subregion: int('id_jefe_subregion').references(() => autoridades.id_autoridades),
}, (table) => [
    index('idx_subregion_parroquia').on(table.parroquia_id),
    index('idx_subregion_municipio').on(table.municipio_id),
    index('idx_subregion_estado').on(table.estado_id),
    index('idx_subregion_jefe').on(table.id_jefe_subregion),
]);
export const ciudadanoMayorEdad = mysqlTable('ciudadano_mayor_edad', {
    id_ciudadano: int('id_ciudadano').autoincrement().primaryKey(),
    primer_nombre: varchar('primer_nombre', { length: 50 }).notNull(),
    segundo_nombre: varchar('segundo_nombre', { length: 50 }),
    primer_apellido: varchar('primer_apellido', { length: 50 }).notNull(),
    segundo_apellido: varchar('segundo_apellido', { length: 50 }),
    c_i: int('c_i').notNull(),
    fecha_nacimiento: date('fecha_nacimiento', { mode: 'string' }).notNull(),
    sexo: mysqlEnum('sexo', SEXO_VALUES).notNull(),
    tipo_sangre: mysqlEnum('tipo_sangre', TIPO_SANGRE_VALUES).notNull(),
    estatura: int('estatura').notNull(),
    correo_electronico: varchar('correo_electronico', { length: 100 }),
    telefono_celular: varchar('telefono_celular', { length: 20 }),
    telefono_domicilio: varchar('telefono_domicilio', { length: 20 }),
    domicilio: varchar('domicilio', { length: 255 }).notNull(),
    profesion_id: int('profesion_id').references(() => profesiones.id_profesion),
    parroquia_id: int('parroquia_id').references(() => parroquias.id_parroquia),
    municipio_id: int('municipio_id').references(() => municipios.id_municipio),
    estado_id: int('estado_id').references(() => estados.id_estado),
    etnia_id: int('etnia_id').references(() => etnias.id_etnia),
}, (table) => [
    uniqueIndex('uq_ciudadano_mayor_edad_c_i').on(table.c_i),
    index('idx_ciudadano_mayor_profesion').on(table.profesion_id),
    index('idx_ciudadano_mayor_parroquia').on(table.parroquia_id),
    index('idx_ciudadano_mayor_municipio').on(table.municipio_id),
    index('idx_ciudadano_mayor_estado').on(table.estado_id),
    index('idx_ciudadano_mayor_etnia').on(table.etnia_id),
]);
export const ciudadanoMenorEdad = mysqlTable('ciudadano_menor_edad', {
    id_menor: int('id_menor').autoincrement().primaryKey(),
    primer_nombre: varchar('primer_nombre', { length: 50 }).notNull(),
    segundo_nombre: varchar('segundo_nombre', { length: 50 }),
    primer_apellido: varchar('primer_apellido', { length: 50 }).notNull(),
    segundo_apellido: varchar('segundo_apellido', { length: 50 }),
    fecha_nacimiento: date('fecha_nacimiento', { mode: 'string' }).notNull(),
    sexo: mysqlEnum('sexo', SEXO_VALUES).notNull(),
    tipo_sangre: mysqlEnum('tipo_sangre', TIPO_SANGRE_VALUES).notNull(),
    estatura: int('estatura').notNull(),
    domicilio: varchar('domicilio', { length: 255 }).notNull(),
    parroquia_id: int('parroquia_id').references(() => parroquias.id_parroquia),
    municipio_id: int('municipio_id').references(() => municipios.id_municipio),
    estado_id: int('estado_id').references(() => estados.id_estado),
    etnia_id: int('etnia_id').references(() => etnias.id_etnia),
    padre_id: int('padre_id').references(() => ciudadanoMayorEdad.id_ciudadano),
}, (table) => [
    index('idx_ciudadano_menor_parroquia').on(table.parroquia_id),
    index('idx_ciudadano_menor_municipio').on(table.municipio_id),
    index('idx_ciudadano_menor_estado').on(table.estado_id),
    index('idx_ciudadano_menor_etnia').on(table.etnia_id),
    index('idx_ciudadano_menor_padre').on(table.padre_id),
]);
export const inmunizacion = mysqlTable('inmunizacion', {
    id_inmunizacion: int('id_inmunizacion').autoincrement().primaryKey(),
    numero_dosis: int('numero_dosis').notNull(),
    fecha_aplicacion: date('fecha_aplicacion', { mode: 'string' }),
    numero_lote: varchar('numero_lote', { length: 30 }),
    observaciones: varchar('observaciones', { length: 255 }),
    centro_salud_aplicacion: int('centro_salud_aplicacion').references(() => centroSalud.id_centro),
    vacuna_id: int('vacuna_id').references(() => vacunas.id_vacuna),
    ciudadano_mayor_edad_id: int('ciudadano_mayor_edad_id').references(() => ciudadanoMayorEdad.id_ciudadano),
    ciudadano_mayor_menor_id: int('ciudadano_mayor_menor_id').references(() => ciudadanoMenorEdad.id_menor),
}, (table) => [
    index('idx_inmunizacion_centro').on(table.centro_salud_aplicacion),
    index('idx_inmunizacion_vacuna').on(table.vacuna_id),
    index('idx_inmunizacion_ciudadano_mayor').on(table.ciudadano_mayor_edad_id),
    index('idx_inmunizacion_ciudadano_menor').on(table.ciudadano_mayor_menor_id),
]);
export const reportes = mysqlTable('reportes', {
    id_reportes: int('id_reportes').autoincrement().primaryKey(),
    nivel_gravedad: mysqlEnum('nivel_gravedad', NIVEL_GRAVEDAD_VALUES).notNull(),
    recomendaciones: varchar('recomendaciones', { length: 255 }).notNull(),
    inmunizacion_id: int('inmunizacion_id').references(() => inmunizacion.id_inmunizacion),
    ciudadano_mayor_id: int('ciudadano_mayor_id').references(() => ciudadanoMayorEdad.id_ciudadano),
    ciudadano_menor_id: int('ciudadano_menor_id').references(() => ciudadanoMenorEdad.id_menor),
    sintoma_id: int('sintoma_id').references(() => sintomasComunes.id_sintoma),
}, (table) => [
    index('idx_reportes_inmunizacion').on(table.inmunizacion_id),
    index('idx_reportes_ciudadano_mayor').on(table.ciudadano_mayor_id),
    index('idx_reportes_ciudadano_menor').on(table.ciudadano_menor_id),
    index('idx_reportes_sintoma').on(table.sintoma_id),
]);
export const certificado = mysqlTable('certificado', {
    id_certificado: int('id_certificado').autoincrement().primaryKey(),
    fecha_emision: date('fecha_emision', { mode: 'string' }).notNull(),
    estatus: mysqlEnum('estatus', ESTATUS_CERTIFICADO_VALUES).notNull(),
    ciudadano_mayor_id: int('ciudadano_mayor_id').references(() => ciudadanoMayorEdad.id_ciudadano),
    examen_id: int('examen_id').references(() => examenes.id_examenes),
}, (table) => [
    index('idx_certificado_ciudadano_mayor').on(table.ciudadano_mayor_id),
    index('idx_certificado_examen').on(table.examen_id),
]);
// --- Relaciones bidireccionales de Drizzle ORM ---
export const usuariosRelations = relations(usuarios, ({ many }) => ({
    autoridades: many(autoridades),
}));
export const profesionesRelations = relations(profesiones, ({ many }) => ({
    autoridades: many(autoridades),
    ciudadanosMayores: many(ciudadanoMayorEdad),
}));
export const estadosRelations = relations(estados, ({ many }) => ({
    municipios: many(municipios),
    parroquias: many(parroquias),
    centrosSalud: many(centroSalud),
    subregiones: many(subregion),
    ciudadanosMayores: many(ciudadanoMayorEdad),
    ciudadanosMenores: many(ciudadanoMenorEdad),
}));
export const municipiosRelations = relations(municipios, ({ one, many }) => ({
    estado: one(estados, {
        fields: [municipios.estado_id],
        references: [estados.id_estado],
    }),
    parroquias: many(parroquias),
    centrosSalud: many(centroSalud),
    subregiones: many(subregion),
    ciudadanosMayores: many(ciudadanoMayorEdad),
    ciudadanosMenores: many(ciudadanoMenorEdad),
}));
export const parroquiasRelations = relations(parroquias, ({ one, many }) => ({
    municipio: one(municipios, {
        fields: [parroquias.municipio_id],
        references: [municipios.id_municipio],
    }),
    estado: one(estados, {
        fields: [parroquias.estado_id],
        references: [estados.id_estado],
    }),
    centrosSalud: many(centroSalud),
    subregiones: many(subregion),
    ciudadanosMayores: many(ciudadanoMayorEdad),
    ciudadanosMenores: many(ciudadanoMenorEdad),
}));
export const etniasRelations = relations(etnias, ({ many }) => ({
    ciudadanosMayores: many(ciudadanoMayorEdad),
    ciudadanosMenores: many(ciudadanoMenorEdad),
}));
export const vacunasRelations = relations(vacunas, ({ many }) => ({
    inmunizaciones: many(inmunizacion),
}));
export const sintomasComunesRelations = relations(sintomasComunes, ({ many }) => ({
    reportes: many(reportes),
}));
export const examenesRelations = relations(examenes, ({ many }) => ({
    certificados: many(certificado),
}));
export const autoridadesRelations = relations(autoridades, ({ one, many }) => ({
    usuario: one(usuarios, {
        fields: [autoridades.usuario_id],
        references: [usuarios.id_usuarios],
    }),
    profesion: one(profesiones, {
        fields: [autoridades.profesion_id],
        references: [profesiones.id_profesion],
    }),
    centrosDirigidos: many(centroSalud),
    subregionesDirigidas: many(subregion),
}));
export const centroSaludRelations = relations(centroSalud, ({ one, many }) => ({
    jefeCentro: one(autoridades, {
        fields: [centroSalud.id_jefe_centro],
        references: [autoridades.id_autoridades],
    }),
    parroquia: one(parroquias, {
        fields: [centroSalud.parroquia_id],
        references: [parroquias.id_parroquia],
    }),
    municipio: one(municipios, {
        fields: [centroSalud.municipio_id],
        references: [municipios.id_municipio],
    }),
    estado: one(estados, {
        fields: [centroSalud.estado_id],
        references: [estados.id_estado],
    }),
    inmunizaciones: many(inmunizacion),
}));
export const subregionRelations = relations(subregion, ({ one }) => ({
    parroquia: one(parroquias, {
        fields: [subregion.parroquia_id],
        references: [parroquias.id_parroquia],
    }),
    municipio: one(municipios, {
        fields: [subregion.municipio_id],
        references: [municipios.id_municipio],
    }),
    estado: one(estados, {
        fields: [subregion.estado_id],
        references: [estados.id_estado],
    }),
    jefeSubregion: one(autoridades, {
        fields: [subregion.id_jefe_subregion],
        references: [autoridades.id_autoridades],
    }),
}));
export const ciudadanoMayorEdadRelations = relations(ciudadanoMayorEdad, ({ one, many }) => ({
    profesion: one(profesiones, {
        fields: [ciudadanoMayorEdad.profesion_id],
        references: [profesiones.id_profesion],
    }),
    parroquia: one(parroquias, {
        fields: [ciudadanoMayorEdad.parroquia_id],
        references: [parroquias.id_parroquia],
    }),
    municipio: one(municipios, {
        fields: [ciudadanoMayorEdad.municipio_id],
        references: [municipios.id_municipio],
    }),
    estado: one(estados, {
        fields: [ciudadanoMayorEdad.estado_id],
        references: [estados.id_estado],
    }),
    etnia: one(etnias, {
        fields: [ciudadanoMayorEdad.etnia_id],
        references: [etnias.id_etnia],
    }),
    menoresACargo: many(ciudadanoMenorEdad),
    inmunizaciones: many(inmunizacion),
    reportes: many(reportes),
    certificados: many(certificado),
}));
export const ciudadanoMenorEdadRelations = relations(ciudadanoMenorEdad, ({ one, many }) => ({
    parroquia: one(parroquias, {
        fields: [ciudadanoMenorEdad.parroquia_id],
        references: [parroquias.id_parroquia],
    }),
    municipio: one(municipios, {
        fields: [ciudadanoMenorEdad.municipio_id],
        references: [municipios.id_municipio],
    }),
    estado: one(estados, {
        fields: [ciudadanoMenorEdad.estado_id],
        references: [estados.id_estado],
    }),
    etnia: one(etnias, {
        fields: [ciudadanoMenorEdad.etnia_id],
        references: [etnias.id_etnia],
    }),
    padre: one(ciudadanoMayorEdad, {
        fields: [ciudadanoMenorEdad.padre_id],
        references: [ciudadanoMayorEdad.id_ciudadano],
    }),
    inmunizaciones: many(inmunizacion),
    reportes: many(reportes),
}));
export const inmunizacionRelations = relations(inmunizacion, ({ one, many }) => ({
    centroSalud: one(centroSalud, {
        fields: [inmunizacion.centro_salud_aplicacion],
        references: [centroSalud.id_centro],
    }),
    vacuna: one(vacunas, {
        fields: [inmunizacion.vacuna_id],
        references: [vacunas.id_vacuna],
    }),
    ciudadanoMayor: one(ciudadanoMayorEdad, {
        fields: [inmunizacion.ciudadano_mayor_edad_id],
        references: [ciudadanoMayorEdad.id_ciudadano],
    }),
    ciudadanoMenor: one(ciudadanoMenorEdad, {
        fields: [inmunizacion.ciudadano_mayor_menor_id],
        references: [ciudadanoMenorEdad.id_menor],
    }),
    reportes: many(reportes),
}));
export const reportesRelations = relations(reportes, ({ one }) => ({
    inmunizacion: one(inmunizacion, {
        fields: [reportes.inmunizacion_id],
        references: [inmunizacion.id_inmunizacion],
    }),
    ciudadanoMayor: one(ciudadanoMayorEdad, {
        fields: [reportes.ciudadano_mayor_id],
        references: [ciudadanoMayorEdad.id_ciudadano],
    }),
    ciudadanoMenor: one(ciudadanoMenorEdad, {
        fields: [reportes.ciudadano_menor_id],
        references: [ciudadanoMenorEdad.id_menor],
    }),
    sintoma: one(sintomasComunes, {
        fields: [reportes.sintoma_id],
        references: [sintomasComunes.id_sintoma],
    }),
}));
export const certificadoRelations = relations(certificado, ({ one }) => ({
    ciudadanoMayor: one(ciudadanoMayorEdad, {
        fields: [certificado.ciudadano_mayor_id],
        references: [ciudadanoMayorEdad.id_ciudadano],
    }),
    examen: one(examenes, {
        fields: [certificado.examen_id],
        references: [examenes.id_examenes],
    }),
}));
//# sourceMappingURL=schema.js.map