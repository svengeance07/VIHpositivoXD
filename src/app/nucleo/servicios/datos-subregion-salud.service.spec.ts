import { TestBed } from '@angular/core/testing';

import { DatosSubregionSaludService } from './datos-subregion-salud.service';

describe('DatosSubregionSaludService', () => {
  let service: DatosSubregionSaludService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
});
