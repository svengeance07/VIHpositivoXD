import { TestBed } from '@angular/core/testing';

import { CatalogosService } from './catalogos.service';

describe('CatalogosService', () => {
  let service: CatalogosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogosService);
  });

  it('expone los catálogos con datos', () => {
    expect(service.roles().length).toBe(4);
    expect(service.vacunas().length).toBeGreaterThan(0);
    expect(service.profesiones().length).toBeGreaterThan(0);
    expect(service.profesiones().some((profesion) => profesion.id === 'desempleado')).toBe(true);
    expect(service.examenes().length).toBe(5);
    expect(service.gradosInstruccion().length).toBeGreaterThan(0);
    expect(service.gruposEtnicos().length).toBeGreaterThan(0);
    expect(service.tiposEstablecimiento().length).toBeGreaterThan(0);
    expect(service.tiposSangre().length).toBe(8);
  });

  it('no repite identificadores dentro de un catálogo', () => {
    const catalogos: (readonly (string | number)[])[] = [
      service.roles().map((item) => item.id),
      service.vacunas().map((item) => item.id),
      service.profesiones().map((item) => item.id),
      service.examenes().map((item) => item.id),
      service.gradosInstruccion().map((item) => item.id),
      service.gruposEtnicos().map((item) => item.id),
      service.tiposEstablecimiento().map((item) => item.id),
    ];

    for (const ids of catalogos) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('define las cuatro vacunas del certificado como obligatorias', () => {
    expect(service.vacunas().length).toBe(4);
    expect(service.vacunas().every((vacuna) => vacuna.obligatoriaCertificado)).toBe(true);
  });

  it('solo tiene los tres estados de lote definidos', () => {
    expect(service.estadosLote().map((estado) => estado.id)).toEqual([
      'en_camino',
      'reportado',
      'aceptado',
    ]);
  });
});
