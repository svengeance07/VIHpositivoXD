import type { NotificacionSrs, SolicitudCertificado } from '../modelos/subregion-salud';

/**
 * Datos temporales de la Subregión de Salud.
 *
 * La subregión activa del prototipo es Guárico y coincide con la cuenta de
 * acceso de `cuentas-acceso.ts`. Los ciudadanos y el personal tipo 2 viven en
 * los mocks compartidos del master; aquí solo se agregan los registros propios
 * del flujo de certificados y las notificaciones dirigidas a esta subregión.
 */

export const SUBREGION_SALUD_ACTUAL_ID = 'srs-guarico';
export const SUBREGION_SALUD_ACTUAL_NOMBRE = 'Subregión de Salud Guárico';
export const ESTADO_SUBREGION_ACTUAL_ID = 'guarico';
export const ESTADO_SUBREGION_ACTUAL_NOMBRE = 'Guárico';

/**
 * Vigencia provisional de los exámenes para la evaluación del certificado.
 * Los valores son una decisión de prototipo: el equipo de salud debe confirmar
 * los períodos reales antes de convertirlos en reglas de negocio.
 */
export const VIGENCIA_EXAMENES_MESES: Readonly<Record<string, number>> = {
  vih: 6,
  vdrl: 6,
  'hepatitis-b': 6,
  hemoglobina: 12,
  glicemia: 3,
};

export const EXAMENES_REQUERIDOS_CERTIFICADO: readonly string[] = ['vih', 'vdrl'];

export const SOLICITUDES_CERTIFICADO_MOCK: readonly SolicitudCertificado[] = [
  {
    id: 'cert-001',
    codigo: 'CERT-GUA-2026-001',
    ciudadanoId: 'c-15',
    fechaSolicitud: '2026-10-27',
    estado: 'solicitado',
    solicitadoPor: 'José Gregorio Rondón',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-002',
    codigo: 'CERT-GUA-2026-002',
    ciudadanoId: 'c-16',
    fechaSolicitud: '2026-10-28',
    estado: 'solicitado',
    solicitadoPor: 'María Elena Blanco',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Requiere el certificado para un trámite laboral.',
    correoEnviado: false,
  },
  {
    id: 'cert-003',
    codigo: 'CERT-GUA-2026-003',
    ciudadanoId: 'c-19',
    fechaSolicitud: '2026-10-20',
    estado: 'autorizado',
    solicitadoPor: 'Luis Fernando Rojas',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-21',
    fechaEmision: null,
    motivo: 'Cumple con el esquema de inmunizaciones y la serología exigida.',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-004',
    codigo: 'CERT-GUA-2026-004',
    ciudadanoId: 'c-21',
    fechaSolicitud: '2026-10-15',
    estado: 'descartado',
    solicitadoPor: 'Rafael Antonio Suárez',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-16',
    fechaEmision: null,
    motivo:
      'El toxoide tetánico está vencido y la serología se encuentra fuera del período de vigencia. Debe actualizar los requisitos y solicitar nuevamente.',
    observaciones: 'Solicitud presentada en el Ambulatorio Rural Calabozo.',
    correoEnviado: false,
  },
  {
    id: 'cert-005',
    codigo: 'CERT-GUA-2026-005',
    ciudadanoId: 'c-22',
    fechaSolicitud: '2026-10-10',
    estado: 'emitido',
    solicitadoPor: 'Génesis Paola Medina',
    revisadoPor: 'Lic. Carlos Rojas',
    fechaRevision: '2026-10-11',
    fechaEmision: '2026-10-12',
    motivo: 'Cumple con el esquema de inmunizaciones y la serología exigida.',
    observaciones: 'Solicitud presentada en el Hospital Central de San Juan.',
    correoEnviado: false,
  },
  {
    id: 'cert-006',
    codigo: 'CERT-GUA-2026-006',
    ciudadanoId: 'c-3',
    fechaSolicitud: '2026-10-29',
    estado: 'solicitado',
    solicitadoPor: 'Ana Lucía Rodríguez',
    revisadoPor: 'Pendiente',
    fechaRevision: null,
    fechaEmision: null,
    motivo: '',
    observaciones: 'Solicitud registrada desde la ficha ciudadana de la subregión.',
    correoEnviado: false,
  },
];

/**
 * Notificaciones de la subregión.
 *
 * Solo se generan cuando una solicitud de certificado reúne todos los
 * requisitos y queda lista para que la subregión la revise. No hay avisos por
 * vencimiento de vacunas o exámenes.
 */
export const NOTIFICACIONES_SUBREGION_MOCK: readonly NotificacionSrs[] = [
  {
    id: 'notif-001',
    fecha: '2026-10-27T14:15:00',
    tipo: 'solicitud_certificado',
    titulo: 'Certificado listo para revisión',
    mensaje:
      'La solicitud de José Gregorio Rondón reúne todos los requisitos vigentes. Revisa el caso y decide si autorizas la emisión.',
    personaNombre: 'José Gregorio Rondón',
    personaCedula: '15324687',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: false,
    prioridad: 'alta',
    enlace: '/SRS/certificados/cert-001',
  },
  {
    id: 'notif-002',
    fecha: '2026-10-20T11:05:00',
    tipo: 'solicitud_certificado',
    titulo: 'Certificado listo para revisión',
    mensaje:
      'La solicitud de Luis Fernando Rojas reúne todos los requisitos vigentes. Revisa el caso y decide si autorizas la emisión.',
    personaNombre: 'Luis Fernando Rojas',
    personaCedula: '8192457',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: true,
    prioridad: 'media',
    enlace: '/SRS/certificados/cert-003',
  },
  {
    id: 'notif-003',
    fecha: '2026-10-10T09:00:00',
    tipo: 'solicitud_certificado',
    titulo: 'Certificado listo para revisión',
    mensaje:
      'La solicitud de Génesis Paola Medina reúne todos los requisitos vigentes. Revisa el caso y decide si autorizas la emisión.',
    personaNombre: 'Génesis Paola Medina',
    personaCedula: '26548971',
    centroNombre: 'Hospital Central de San Juan',
    estadoId: ESTADO_SUBREGION_ACTUAL_ID,
    leida: true,
    prioridad: 'media',
    enlace: '/SRS/certificados/cert-005',
  },
];
