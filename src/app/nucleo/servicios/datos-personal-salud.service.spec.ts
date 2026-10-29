import { TestBed } from '@angular/core/testing';

import { DatosPersonalSaludService } from './datos-personal-salud.service';

describe('DatosPersonalSaludService', () => {
  let service: DatosPersonalSaludService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosPersonalSaludService);
  });

  it('inicializa con métricas globales coherentes del centro de salud', () => {
    const metricas = service.metricasCentro();
    expect(metricas.vacunasHoy).toBeGreaterThan(0);
    expect(metricas.enfermerosActivos).toBeGreaterThan(0);
    expect(metricas.dosisMenoresHoy + metricas.dosisAdultosHoy).toBe(metricas.vacunasHoy);
  });

  it('permite alternar entre el modo Jefe de Centro y el modo Enfermero', () => {
    service.setModoManual('jefe');
    expect(service.esJefe()).toBe(true);

    service.setModoManual('enfermero');
    expect(service.esJefe()).toBe(false);
  });

  it('registra una nueva aplicación de vacuna e incrementa las métricas operativas', () => {
    const totalInicial = service.aplicaciones().length;
    const enfermero = service.enfermeroActual();
    const vacunasHoyInicial = enfermero.vacunasAplicadasHoy;

    const nueva = service.aplicarVacuna({
      pacienteId: 'pac-01',
      pacienteCedula: '14.567.890',
      pacienteNombre: 'Alejandro Morales García',
      esMenor: false,
      vacunaId: 'vac-covid',
      vacunaNombre: 'COVID-19 Refuerzo Bivalente',
      dosis: 5,
      lote: 'COV-2026-05',
      enfermeroId: enfermero.id,
      enfermeroNombre: enfermero.nombre,
    });

    expect(nueva.id).toBeDefined();
    expect(service.aplicaciones().length).toBe(totalInicial + 1);

    const enfermeroActualizado = service.enfermeros().find((e) => e.id === enfermero.id);
    expect(enfermeroActualizado?.vacunasAplicadasHoy).toBe(vacunasHoyInicial + 1);
  });

  it('registra un reporte de reacción adversa (ESAVI) hacia la subregión', () => {
    const totalReportes = service.reportes().length;
    const enfermero = service.enfermeroActual();

    const reporte = service.registrarReporteIncidencia({
      pacienteId: 'pac-02',
      pacienteCedula: '21.432.765',
      pacienteNombre: 'Valeria Daniela Rivas',
      vacunaId: 'vac-toxoide',
      vacunaNombre: 'Toxoide Tetánico Diftérico (Td)',
      lote: 'TOX-2026-12',
      fechaAplicacion: '2026-10-27',
      sintomas: ['Eritema local', 'Prurito leve'],
      indicacionesDictadas: 'Observación y compresas frías.',
      gravedad: 'leve',
      enfermeroId: enfermero.id,
      enfermeroNombre: enfermero.nombre,
      subregionDestinoId: 'srs-distrito-capital',
    });

    expect(reporte.estadoSubregion).toBe('enviado');
    expect(service.reportes().length).toBe(totalReportes + 1);
  });
});
