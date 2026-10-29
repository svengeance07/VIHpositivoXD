import type { ItemCatalogo, RolSistema, VacunaCatalogo } from '../modelos/catalogo';
import type { EstadoCertificado, EstadoLote, TipoEmpleado } from '../modelos/enumeraciones';

/**
 * Datos temporales de catálogos.
 *
 * Se reemplazan por consultas cuando exista la base de datos. Los valores provienen de
 * los bocetos (`docs/diseno/imagenes/`) y de fuentes públicas; están para que las vistas
 * puedan renderizarse desde ya.
 */

export const ROLES: readonly RolSistema[] = [
  { id: 0, nombre: 'Ciudadano', prefijo: '' },
  { id: 1, nombre: 'Master (autoridades)', prefijo: '/master' },
  { id: 2, nombre: 'Personal de salud', prefijo: '/PS' },
  { id: 3, nombre: 'Subregión de salud', prefijo: '/SRS' },
];

export const TIPOS_EMPLEADO: readonly { id: TipoEmpleado; nombre: string }[] = [
  { id: 'jefe', nombre: 'Jefe de centro' },
  { id: 'trabajador', nombre: 'Trabajador' },
];

export const ESTADOS_LOTE: readonly { id: EstadoLote; nombre: string }[] = [
  { id: 'en_camino', nombre: 'En camino' },
  { id: 'reportado', nombre: 'Reportado' },
  { id: 'aceptado', nombre: 'Aceptado' },
];

export const ESTADOS_CERTIFICADO: readonly { id: EstadoCertificado; nombre: string }[] = [
  { id: 'solicitado', nombre: 'Solicitado' },
  { id: 'autorizado', nombre: 'Autorizado' },
  { id: 'descartado', nombre: 'Descartado' },
  { id: 'emitido', nombre: 'Emitido' },
];

/**
 * Vacunas que evalúa el certificado de salud, según `datos-usuarios.png`.
 *
 * `dosisRequeridas` y `vigenciaMeses` siguen el esquema de inmunización de referencia
 * (Td con refuerzo cada 10 años, fiebre amarilla de dosis única, hepatitis B de tres
 * dosis, trivalente viral de dos dosis). Confirmar con el equipo de salud antes de
 * usar la vigencia para decidir si un certificado es emitible.
 */
export const VACUNAS: readonly VacunaCatalogo[] = [
  {
    id: 'td',
    nombre: 'Toxoide tetánico y diftérico (Td)',
    dosisRequeridas: 5,
    vigenciaMeses: 120,
    obligatoriaCertificado: true,
  },
  {
    id: 'fiebre-amarilla',
    nombre: 'Fiebre amarilla',
    dosisRequeridas: 1,
    vigenciaMeses: null,
    obligatoriaCertificado: true,
  },
  {
    id: 'hepatitis-b',
    nombre: 'Hepatitis B',
    dosisRequeridas: 3,
    vigenciaMeses: null,
    obligatoriaCertificado: true,
  },
  {
    id: 'trivalente-viral',
    nombre: 'Trivalente viral (SRP)',
    dosisRequeridas: 2,
    vigenciaMeses: null,
    obligatoriaCertificado: true,
  },
];

/** Profesiones del personal de salud y del personal administrativo. */
export const PROFESIONES: readonly ItemCatalogo[] = [
  { id: 'medico-cirujano', nombre: 'Médico/a cirujano/a' },
  { id: 'medico-especialista', nombre: 'Médico/a especialista' },
  { id: 'licenciado-enfermeria', nombre: 'Licenciado/a en enfermería' },
  { id: 'tecnico-enfermeria', nombre: 'Técnico/a en enfermería' },
  { id: 'obstetra', nombre: 'Obstetra' },
  { id: 'odontologo', nombre: 'Odontólogo/a' },
  { id: 'bioanalista', nombre: 'Bioanalista' },
  { id: 'farmaceutico', nombre: 'Farmacéutico/a' },
  { id: 'nutricionista', nombre: 'Nutricionista / dietista' },
  { id: 'fisioterapeuta', nombre: 'Fisioterapeuta' },
  { id: 'terapeuta-ocupacional', nombre: 'Terapeuta ocupacional' },
  { id: 'psicologo', nombre: 'Psicólogo/a' },
  { id: 'trabajador-social', nombre: 'Trabajador/a social' },
  { id: 'tecnico-radiologia', nombre: 'Técnico/a en radiología' },
  { id: 'optometrista', nombre: 'Optometrista' },
  { id: 'administrador', nombre: 'Administrador/a' },
  { id: 'contador', nombre: 'Contador/a público/a' },
  { id: 'abogado', nombre: 'Abogado/a' },
  { id: 'ingeniero', nombre: 'Ingeniero/a' },
  { id: 'analista-sistemas', nombre: 'Analista de sistemas' },
  { id: 'secretaria', nombre: 'Secretario/a' },
  { id: 'obrero', nombre: 'Obrero/a' },
  { id: 'desempleado', nombre: 'Desempleado' },
  { id: 'otro', nombre: 'Otro' },
];

/** Exámenes que pueden asociarse a una ficha ciudadana. */
export const EXAMENES: readonly ItemCatalogo[] = [
  { id: 'vih', nombre: 'VIH' },
  { id: 'vdrl', nombre: 'VDRL' },
  { id: 'hepatitis-b', nombre: 'Hepatitis B' },
  { id: 'hemoglobina', nombre: 'Hemoglobina' },
  { id: 'glicemia', nombre: 'Glicemia' },
];

/** Grado de instrucción más alto alcanzado (`Grado_Instruccion` en el boceto). */
export const GRADOS_INSTRUCCION: readonly ItemCatalogo[] = [
  { id: 'primaria', nombre: 'Primaria' },
  { id: 'media-general', nombre: 'Media general (bachiller)' },
  { id: 'tecnico-medio', nombre: 'Técnico medio' },
  { id: 'tsu', nombre: 'Técnico superior universitario (TSU)' },
  { id: 'universitario', nombre: 'Universitario (licenciatura)' },
  { id: 'especializacion', nombre: 'Especialización' },
  { id: 'maestria', nombre: 'Maestría' },
  { id: 'doctorado', nombre: 'Doctorado' },
];

/**
 * Pueblos indígenas reconocidos en Venezuela.
 *
 * Lista de trabajo: el censo oficial maneja más de 30 pueblos y nombres alternativos.
 * La lista definitiva debe venir de la fuente que use la base de datos.
 */
export const GRUPOS_ETNICOS: readonly ItemCatalogo[] = [
  { id: 'wayuu', nombre: 'Wayúu' },
  { id: 'anu', nombre: 'Añú' },
  { id: 'bari', nombre: 'Barí' },
  { id: 'yukpa', nombre: 'Yukpa' },
  { id: 'japreria', nombre: 'Japrería' },
  { id: 'pemon', nombre: 'Pemón' },
  { id: 'karina', nombre: 'Kariña' },
  { id: 'enepa', nombre: 'Eñepa' },
  { id: 'yekuana', nombre: 'Yekuana' },
  { id: 'sanema', nombre: 'Sanemá' },
  { id: 'yanomami', nombre: 'Yanomami' },
  { id: 'piaroa', nombre: 'Piaroa' },
  { id: 'jivi', nombre: 'Jivi' },
  { id: 'piapoco', nombre: 'Piapoco' },
  { id: 'puinave', nombre: 'Puinave' },
  { id: 'curripaco', nombre: 'Curripaco' },
  { id: 'baniva', nombre: 'Baniva' },
  { id: 'warekena', nombre: 'Warekena' },
  { id: 'saliba', nombre: 'Sáliba' },
  { id: 'mapoyo', nombre: 'Mapoyo' },
  { id: 'yabarana', nombre: 'Yabarana' },
  { id: 'pume', nombre: 'Pumé' },
  { id: 'mako', nombre: 'Mako' },
  { id: 'hoti', nombre: 'Hoti' },
  { id: 'arutani', nombre: 'Arutani' },
  { id: 'sape', nombre: 'Sapé' },
  { id: 'uruak', nombre: 'Uruak' },
  { id: 'warao', nombre: 'Warao' },
  { id: 'yeral', nombre: 'Yeral' },
  { id: 'otro', nombre: 'Otro' },
];

/** Tipos de establecimiento de salud usados por el sistema público venezolano. */
export const TIPOS_ESTABLECIMIENTO: readonly ItemCatalogo[] = [
  { id: 'ambulatorio-urbano-i', nombre: 'Ambulatorio urbano tipo I' },
  { id: 'ambulatorio-urbano-ii', nombre: 'Ambulatorio urbano tipo II' },
  { id: 'ambulatorio-urbano-iii', nombre: 'Ambulatorio urbano tipo III' },
  { id: 'ambulatorio-rural-i', nombre: 'Ambulatorio rural tipo I' },
  { id: 'ambulatorio-rural-ii', nombre: 'Ambulatorio rural tipo II' },
  { id: 'hospital-i', nombre: 'Hospital tipo I' },
  { id: 'hospital-ii', nombre: 'Hospital tipo II' },
  { id: 'hospital-iii', nombre: 'Hospital tipo III' },
  { id: 'hospital-iv', nombre: 'Hospital tipo IV' },
  { id: 'cdi', nombre: 'Centro de diagnóstico integral (CDI)' },
  { id: 'sri', nombre: 'Sala de rehabilitación integral (SRI)' },
  { id: 'consultorio-popular', nombre: 'Consultorio popular' },
  { id: 'consultorio-familiar', nombre: 'Consultorio médico familiar' },
  { id: 'clinica-privada', nombre: 'Clínica privada' },
  { id: 'otro', nombre: 'Otro' },
];

/** Tipos de sangre del sistema ABO con factor Rh. */
export const TIPOS_SANGRE: readonly ItemCatalogo[] = [
  { id: 'a+', nombre: 'A+' },
  { id: 'a-', nombre: 'A-' },
  { id: 'b+', nombre: 'B+' },
  { id: 'b-', nombre: 'B-' },
  { id: 'ab+', nombre: 'AB+' },
  { id: 'ab-', nombre: 'AB-' },
  { id: 'o+', nombre: 'O+' },
  { id: 'o-', nombre: 'O-' },
];
