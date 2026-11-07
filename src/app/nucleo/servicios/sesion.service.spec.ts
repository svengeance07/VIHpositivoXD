import { TestBed } from '@angular/core/testing';

import { SesionService } from './sesion.service';

describe('SesionService', () => {
  let service: SesionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SesionService);
  });

  function requerir<T>(valor: T | null): T {
    if (valor === null) {
      throw new Error('Se esperaba un valor, pero llegó null');
    }

    return valor;
  }

  it('valida al master y crea la sesión sin entidad', () => {
    const cuenta = requerir(service.validarCuenta(1, 'MASTER@vih.gob.ve ', 'master123'));

    const sesion = service.entrar(cuenta);

    expect(sesion.rol).toBe(1);
    expect(sesion.nombre).toBe('Ana Rodríguez');
    expect(sesion.nombreUsuario).toBe('master');
    expect(sesion.entidad).toBeNull();
    expect(service.autenticado()).toBe(true);
  });

  it('rechaza credenciales incorrectas o de otro rol', () => {
    expect(service.validarCuenta(1, 'master@vih.gob.ve', 'otra')).toBeNull();
    expect(service.validarCuenta(2, 'master@vih.gob.ve', 'master123')).toBeNull();
  });

  it('valida directamente al jefe de centro de salud (rol 2) sin sub-usuarios', () => {
    expect(service.validarCuenta(2, 'jefe.centro@vih.gob.ve', 'otra')).toBeNull();

    const centro = requerir(service.validarCuenta(2, 'jefe.centro@vih.gob.ve', 'jefe123'));
    const sesion = service.entrar(centro);

    expect(sesion.rol).toBe(2);
    expect(sesion.entidad).toBe('Centro de Salud La Pastora');
    expect(sesion.nombre).toBe('Dra. María Pérez');
    expect(sesion.correo).toBe('jefe.centro@vih.gob.ve');
  });

  it('registra o actualiza la cuenta directa del jefe de un centro o subregión', () => {
    service.registrarCuentaCentro(
      {
        id: 'cs-nuevo-test',
        nombre: 'Ambulatorio Nuevo Test',
        rol: 2,
      },
      {
        id: 'p-jefe-test',
        nombre: 'Dra. Nueva Jefe',
        correo: 'nueva.jefe@vih.gob.ve',
        clave: 'clave789',
      },
    );

    const cuenta = requerir(service.validarCuenta(2, 'nueva.jefe@vih.gob.ve', 'clave789'));
    expect(cuenta.nombre).toBe('Dra. Nueva Jefe');
    expect(cuenta.entidad).toBe('Ambulatorio Nuevo Test');
    expect(cuenta.centroId).toBe('cs-nuevo-test');
  });

  it('valida directamente al jefe de subregión (rol 3) y cierra la sesión', () => {
    const subregion = requerir(service.validarCuenta(3, 'jefe.subregion@vih.gob.ve', 'jefe123'));

    service.entrar(subregion);
    expect(service.sesion()?.rol).toBe(3);
    expect(service.sesion()?.nombre).toBe('Lic. Carlos Rojas');
    expect(service.sesion()?.entidad).toBe('Subregión de Salud Guárico');

    service.salir();
    expect(service.sesion()).toBeNull();
    expect(service.autenticado()).toBe(false);
  });
});
