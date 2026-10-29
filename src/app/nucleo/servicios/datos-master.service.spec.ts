import { TestBed } from '@angular/core/testing';

import type { FiltrosCiudadano } from '../modelos/master';
import { CatalogosService } from './catalogos.service';
import { DatosMasterService } from './datos-master.service';

const FILTROS_VACIOS: FiltrosCiudadano = {
  nombres: '',
  apellidos: '',
  cedula: '',
  vacunaId: '',
  edadMin: '',
  edadMax: '',
  examenId: '',
  creadoDesde: '',
  creadoHasta: '',
  sexo: '',
  etniaId: '',
  estadoId: '',
  municipioId: '',
  parroquiaId: '',
};

describe('DatosMasterService', () => {
  let service: DatosMasterService;
  let catalogos: CatalogosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosMasterService);
    service.limpiarAlmacenamiento();
    catalogos = TestBed.inject(CatalogosService);
  });

  it('mantiene coherentes las referencias de los mocks', () => {
    const vacunas = new Set(catalogos.vacunas().map((vacuna) => vacuna.id));
    const examenes = new Set(catalogos.examenes().map((examen) => examen.id));

    for (const centro of service.centros()) {
      expect(service.estado(centro.estadoId)).not.toBeNull();
      expect(service.municipio(centro.municipioId)?.estadoId).toBe(centro.estadoId);
      expect(service.parroquia(centro.parroquiaId)?.municipioId).toBe(centro.municipioId);
      expect(service.personal(centro.encargadoId)).not.toBeNull();
    }

    for (const fila of service.personalVista()) {
      expect(fila.centro).not.toBeNull();
      expect(fila.parroquia).not.toBeNull();
      expect(fila.profesion).not.toBe('');
    }

    for (const ciudadano of service.ciudadanos()) {
      expect(service.estado(ciudadano.estadoId)).not.toBeNull();
      expect(service.municipio(ciudadano.municipioId)?.estadoId).toBe(ciudadano.estadoId);
      expect(service.parroquia(ciudadano.parroquiaId)?.municipioId).toBe(ciudadano.municipioId);
      expect(ciudadano.vacunas.every((vacuna) => vacunas.has(vacuna.vacunaId))).toBe(true);
      expect(ciudadano.examenes.every((examen) => examenes.has(examen.examenId))).toBe(true);
    }

    for (const lote of service.lotes()) {
      expect(vacunas.has(lote.vacunaId)).toBe(true);
      expect(service.centro(lote.destinoCentroId)).not.toBeNull();
      expect(service.personal(lote.responsableId)).not.toBeNull();
    }
  });

  it('arma las subregiones con su jefe y sus centros', () => {
    const subregiones = service.subregiones();

    expect(subregiones.length).toBeGreaterThan(0);
    expect(subregiones.every((fila) => fila.jefe !== null)).toBe(true);
    expect(subregiones.every((fila) => fila.estado !== null)).toBe(true);
  });

  it('cruza sexo y vacuna al buscar ciudadanos', () => {
    const resultados = service.buscarCiudadanos({
      ...FILTROS_VACIOS,
      sexo: 'F',
      vacunaId: 'fiebre-amarilla',
    });

    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados.every((ciudadano) => ciudadano.sexo === 'F')).toBe(true);
    expect(
      resultados.every((ciudadano) =>
        ciudadano.vacunas.some((vacuna) => vacuna.vacunaId === 'fiebre-amarilla'),
      ),
    ).toBe(true);
  });

  it('filtra por ubicación y etnia sin mezclar expedientes de otros estados', () => {
    const resultados = service.buscarCiudadanos({
      ...FILTROS_VACIOS,
      estadoId: 'zulia',
      etniaId: 'wayuu',
    });

    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados.every((ciudadano) => ciudadano.estadoId === 'zulia')).toBe(true);
    expect(resultados.every((ciudadano) => ciudadano.etniaId === 'wayuu')).toBe(true);
  });

  it('crea una subregión con su jefe y conserva la relación en las vistas', () => {
    const creada = service.crearSubregion({
      nombre: 'Subregión de Salud Falcón',
      estadoId: 'falcon',
      jefeNombre: 'Dra. Prueba Falcón',
      jefeCedula: '99999999',
      jefeCorreo: 'prueba.falcon@vih.gob.ve',
    });

    expect(creada).not.toBeNull();
    if (!creada) {
      return;
    }

    expect(service.subregiones().some((fila) => fila.centro.id === creada.id)).toBe(true);
    expect(service.jefeDeCentro(creada.id)?.nombre).toBe('Dra. Prueba Falcón');
    expect(service.personalDeCentro(creada.id)).toHaveLength(1);
  });

  it('no permite dos subregiones para el mismo estado', () => {
    const alta = {
      nombre: 'Subregión de Salud Falcón',
      estadoId: 'falcon',
      jefeNombre: 'Dra. Prueba Falcón',
      jefeCedula: '99999999',
      jefeCorreo: 'prueba.falcon@vih.gob.ve',
    };

    expect(service.crearSubregion(alta)).not.toBeNull();
    expect(service.crearSubregion({ ...alta, nombre: 'Subregión duplicada' })).toBeNull();
  });

  it('registra un jefe nuevo y actualiza el encargado del centro', () => {
    const centro = service.centrosVista()[0];
    const empleado = service.crearEmpleado({
      nombre: 'Dr. Nuevo Jefe',
      cedula: '88888888',
      correo: 'nuevo.jefe@vih.gob.ve',
      telefono: '0414-000-0000',
      profesionId: 'medico-cirujano',
      centroId: centro.centro.id,
      tipo: 'jefe',
    });

    expect(empleado).not.toBeNull();
    if (!empleado) {
      return;
    }

    expect(service.centro(centro.centro.id)?.encargadoId).toBe(empleado.id);
    expect(service.personalVista().find((fila) => fila.personal.id === empleado.id)?.esJefe).toBe(
      true,
    );
  });

  it('agrega una búsqueda al historial de auditoría', () => {
    const antes = service.busquedas().length;
    service.registrarBusqueda('Sexo F + Vacuna Td', 3);

    expect(service.busquedas()).toHaveLength(antes + 1);
    expect(service.busquedas()[0].resultados).toBe(3);
    expect(service.busquedas()[0].usuario).toBe('master');
  });

  it('persiste empleados creados en localStorage y los recupera al reinstanciar', () => {
    const centro = service.centrosVista()[0];
    const personalAntes = service.personalVista().length;

    const empleado = service.crearEmpleado({
      nombre: 'Lic. Persistencia',
      cedula: '77001122',
      correo: 'persistencia@vih.gob.ve',
      telefono: '0412-000-0000',
      profesionId: 'prof-enf',
      centroId: centro.centro.id,
      tipo: 'trabajador',
    });

    expect(empleado).not.toBeNull();
    expect(service.personalVista().length).toBe(personalAntes + 1);

    // Verificar que se guardó en localStorage
    const raw = localStorage.getItem('vih_personal_master_v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.some((p: { cedula: string }) => p.cedula === '77001122')).toBe(true);

    // Reinstanciar y comprobar que carga
    const service2 = TestBed.inject(DatosMasterService);
    expect(service2.personalVista().some((fila) => fila.personal.cedula === '77001122')).toBe(true);
  });

  it('persiste centros creados en localStorage', () => {
    const centrosAntes = service.centrosVista().length;

    const centro = service.crearCentro({
      nombre: 'Centro Persistido',
      codigo: 'CS-PER-01',
      estadoId: 'guarico',
      municipioId: 'm-san-juan',
      parroquiaId: 'p-san-juan',
      jefeNombre: 'Dra. Persistida',
      jefeCedula: '66001122',
      jefeCorreo: 'persistida@vih.gob.ve',
    });

    expect(centro).not.toBeNull();
    expect(service.centrosVista().length).toBe(centrosAntes + 1);

    const raw = localStorage.getItem('vih_centros_master_v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.some((c: { codigo: string }) => c.codigo === 'CS-PER-01')).toBe(true);
  });

  it('limpiarAlmacenamiento resetea datos al catálogo original', () => {
    // Crear datos nuevos
    service.crearEmpleado({
      nombre: 'Temporal',
      cedula: '00099900',
      correo: 'temporal@vih.gob.ve',
      telefono: '',
      profesionId: 'prof-enf',
      centroId: service.centrosVista()[0].centro.id,
      tipo: 'trabajador',
    });

    const conNuevo = service.personalVista().length;

    // Limpiar
    service.limpiarAlmacenamiento();

    expect(service.personalVista().length).toBeLessThan(conNuevo);
    expect(localStorage.getItem('vih_personal_master_v1')).toBeNull();
    expect(localStorage.getItem('vih_centros_master_v1')).toBeNull();
  });
});
