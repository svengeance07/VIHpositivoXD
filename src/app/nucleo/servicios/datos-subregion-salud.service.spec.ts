import { TestBed } from '@angular/core/testing';

import { DatosMasterService } from './datos-master.service';
import { DatosSubregionSaludService } from './datos-subregion-salud.service';

describe('DatosSubregionSaludService', () => {
  let service: DatosSubregionSaludService;
  let master: DatosMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    master = TestBed.inject(DatosMasterService);
    master.limpiarAlmacenamiento();
    service = TestBed.inject(DatosSubregionSaludService);
  });

  it('acota el personal tipo 2 y los ciudadanos al estado de la subregión', () => {
    expect(service.trabajadores().length).toBeGreaterThan(0);
    expect(
      service
        .trabajadores()
        .every(
          (trabajador) =>
            trabajador.personal.tipoCuenta === 2 && trabajador.estadoNombre === 'Guárico',
        ),
    ).toBe(true);

    expect(service.ciudadanos().length).toBeGreaterThan(0);
    expect(service.ciudadanos().every((ciudadano) => ciudadano.estadoId === 'guarico')).toBe(true);
  });

  it('calcula requisitos, vencimientos y línea de tiempo de una ficha', () => {
    const completa = service.ficha('c-15');
    const incompleta = service.ficha('c-16');
    const vencida = service.ficha('c-21');

    expect(completa?.aptoCertificado).toBe(true);
    expect(completa?.requisitosCumplidos).toBe(completa?.requisitosTotales);
    expect(completa?.lineaTiempo.length).toBeGreaterThan(0);

    expect(incompleta?.aptoCertificado).toBe(false);
    expect(
      incompleta?.requisitos.some(
        (requisito) => requisito.estado === 'incompleto' || requisito.estado === 'ausente',
      ),
    ).toBe(true);

    expect(vencida?.aptoCertificado).toBe(false);
    expect(vencida?.requisitos.some((requisito) => requisito.estado === 'vencido')).toBe(true);
    expect(vencida?.vacunasVencidas).toBeGreaterThan(0);
  });

  it('registra, autoriza y emite una solicitud sin generar avisos de decisión', () => {
    const notificacionesAntes = service.notificaciones().length;
    const creada = service.crearSolicitudCertificado('c-20');

    expect(creada).not.toBeNull();
    if (!creada) {
      return;
    }

    expect(creada.estado).toBe('solicitado');
    expect(creada.ficha.aptoCertificado).toBe(false);
    expect(service.solicitudActivaDeCiudadano('c-20')?.id).toBe(creada.id);
    expect(service.notificaciones().length).toBe(notificacionesAntes);
    expect(service.crearSolicitudCertificado('c-20')).toBeNull();

    expect(service.revisarSolicitud(creada.id, 'autorizado', '', 'Prueba')).toBe(true);
    expect(service.solicitud(creada.id)?.estado).toBe('autorizado');
    expect(service.solicitud(creada.id)?.revisadoPor).toBe('Prueba');
    expect(service.notificaciones().length).toBe(notificacionesAntes);

    expect(service.emitirSolicitud(creada.id, 'Prueba')).toBe(true);
    expect(service.solicitud(creada.id)?.estado).toBe('emitido');
    expect(service.solicitud(creada.id)?.fechaEmision).not.toBeNull();
    expect(service.solicitud(creada.id)?.correoEnviado).toBe(false);
    expect(service.notificaciones().length).toBe(notificacionesAntes);
  });

  it('notifica solo las solicitudes que reúnen todos los requisitos', () => {
    const notificacionesAntes = service.notificaciones().length;
    const completa = service.crearSolicitudCertificado('c-22');

    expect(completa).not.toBeNull();
    if (!completa) {
      return;
    }

    expect(completa.ficha.aptoCertificado).toBe(true);
    expect(service.notificaciones().length).toBe(notificacionesAntes + 1);
    expect(service.notificaciones()[0]?.tipo).toBe('solicitud_certificado');
    expect(service.notificaciones()[0]?.mensaje).toContain('requisitos');
    expect(service.notificaciones()[0]?.enlace).toBe(`/SRS/certificados/${completa.id}`);
  });

  it('exige un motivo para descartar una solicitud', () => {
    const creada = service.crearSolicitudCertificado('c-17');

    expect(creada).not.toBeNull();
    if (!creada) {
      return;
    }

    expect(service.revisarSolicitud(creada.id, 'descartado', '   ', 'Prueba')).toBe(false);
    expect(service.solicitud(creada.id)?.estado).toBe('solicitado');

    expect(
      service.revisarSolicitud(creada.id, 'descartado', 'No cumple los requisitos.', 'Prueba'),
    ).toBe(true);
    expect(service.solicitud(creada.id)?.estado).toBe('descartado');
    expect(service.solicitud(creada.id)?.motivo).toBe('No cumple los requisitos.');
  });

  it('consulta una ficha por cédula y permite el envío simulado del certificado aprobado', () => {
    const ficha = service.fichaPorCedula('V-26548971');

    expect(ficha?.ciudadano.id).toBe('c-22');
    expect(service.fichaPorCedula('00000000')).toBeNull();

    const certificado = service.certificadoPublicoDeCiudadano('c-22');
    expect(certificado?.estado).toBe('emitido');
    expect(certificado?.correoEnviado).toBe(false);

    expect(service.enviarCertificadoPorCorreo('cert-001')).toBe(false);
    expect(service.enviarCertificadoPorCorreo('cert-004')).toBe(false);
    expect(certificado && service.enviarCertificadoPorCorreo(certificado.id)).toBe(true);
    expect(service.solicitud('cert-005')?.correoEnviado).toBe(true);
    expect(service.enviarCertificadoPorCorreo('cert-005')).toBe(false);
  });

  it('marca notificaciones como leídas y conserva el ámbito del estado', () => {
    expect(
      service.notificaciones().every((notificacion) => notificacion.estadoId === 'guarico'),
    ).toBe(true);
    expect(
      service
        .notificaciones()
        .every((notificacion) => notificacion.tipo === 'solicitud_certificado'),
    ).toBe(true);

    const noLeida = service.notificaciones().find((notificacion) => !notificacion.leida);
    expect(noLeida).toBeDefined();
    if (!noLeida) {
      return;
    }

    const antes = service.notificacionesNoLeidas();
    service.marcarNotificacionLeida(noLeida.id);
    expect(service.notificacionesNoLeidas()).toBe(antes - 1);

    service.marcarTodasLeidas();
    expect(service.notificacionesNoLeidas()).toBe(0);
  });

  it('crea un trabajador tipo 2 desde la SRS y se refleja inmediatamente en trabajadores()', () => {
    const conteoAntes = service.trabajadores().length;
    const centroGuarico = service.centros()[0].centro.id;

    const creado = service.crearTrabajador({
      nombre: 'Lic. Nuevo Enfermero',
      cedula: '31999000',
      correo: 'nuevo.enfermero@vih.gob.ve',
      telefono: '0424-000-0000',
      profesionId: 'prof-enf',
      centroId: centroGuarico,
      tipo: 'trabajador',
    });

    expect(creado).not.toBeNull();
    expect(creado?.tipoCuenta).toBe(2);
    expect(creado?.activo).toBe(true);
    expect(service.trabajadores().length).toBe(conteoAntes + 1);

    const encontrado = service.trabajadores().find((t) => t.personal.cedula === '31999000');
    expect(encontrado).toBeDefined();
    expect(encontrado?.personal.nombre).toBe('Lic. Nuevo Enfermero');
    expect(encontrado?.esJefe).toBe(false);
    expect(encontrado?.estadoNombre).toBe('Guárico');
  });

  it('rechaza crear un trabajador en un centro de otro estado', () => {
    // Usar un centro de Zulia (fuera del ámbito SRS Guárico)
    const centroZulia = master.centros().find((c) => c.estadoId === 'zulia');
    expect(centroZulia).toBeDefined();

    const creado = service.crearTrabajador({
      nombre: 'Rechazado',
      cedula: '99000111',
      correo: 'rechazado@vih.gob.ve',
      telefono: '',
      profesionId: 'prof-enf',
      centroId: centroZulia!.id,
      tipo: 'trabajador',
    });

    expect(creado).toBeNull();
  });

  it('crea un centro con jefe desde la SRS y ambos se reflejan en centros() y trabajadores()', () => {
    const centrosAntes = service.centros().length;
    const trabajadoresAntes = service.trabajadores().length;

    const creado = service.crearCentro({
      nombre: 'Ambulatorio Test SRS',
      codigo: 'CS-GUA-SRS-01',
      estadoId: 'guarico',
      municipioId: 'm-san-juan',
      parroquiaId: 'p-san-juan',
      jefeNombre: 'Dr. Jefe SRS',
      jefeCedula: '55009988',
      jefeCorreo: 'jefe.srs@vih.gob.ve',
    });

    expect(creado).not.toBeNull();
    expect(service.centros().length).toBe(centrosAntes + 1);
    expect(service.trabajadores().length).toBe(trabajadoresAntes + 1);

    const jefe = service.trabajadores().find((t) => t.personal.cedula === '55009988');
    expect(jefe).toBeDefined();
    expect(jefe?.esJefe).toBe(true);
    expect(jefe?.personal.nombre).toBe('Dr. Jefe SRS');
  });

  it('rechaza crear un centro fuera del estado de la subregión', () => {
    const creado = service.crearCentro({
      nombre: 'Centro en Zulia',
      codigo: 'CS-ZUL-99',
      estadoId: 'zulia',
      municipioId: 'm-maracaibo',
      parroquiaId: 'p-coquivacoa',
      jefeNombre: 'Dra. Zulia',
      jefeCedula: '11001100',
      jefeCorreo: 'zulia@vih.gob.ve',
    });

    expect(creado).toBeNull();
  });
});
