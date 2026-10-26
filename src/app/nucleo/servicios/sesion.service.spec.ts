import { TestBed } from '@angular/core/testing';

import { SesionService } from './sesion.service';

describe('SesionService', () => {
  let service: SesionService;

  beforeEach(() => {
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

    const sesion = service.entrar(cuenta, null);

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

  it('exige validar el sub-perfil en los roles 2 y 3', () => {
    const centro = requerir(service.validarCuenta(2, 'centro@vih.gob.ve', 'centro123'));
    expect(centro.perfiles.length).toBeGreaterThan(1);

    expect(
      service.validarPerfil(centro, 'centro-jefe', 'jefe.centro@vih.gob.ve', 'otra'),
    ).toBeNull();

    const perfil = requerir(
      service.validarPerfil(centro, 'centro-jefe', 'jefe.centro@vih.gob.ve', 'jefe123'),
    );
    expect(perfil.tipo).toBe('jefe');

    const sesion = service.entrar(centro, perfil);
    expect(sesion.entidad).toBe('Centro de Salud La Pastora');
    expect(sesion.nombre).toBe('Dra. María Pérez');
  });

  it('permite sub-perfiles en la subregión y cierra la sesión', () => {
    const subregion = requerir(service.validarCuenta(3, 'subregion@vih.gob.ve', 'subregion123'));
    const perfil = requerir(
      service.validarPerfil(
        subregion,
        'subregion-analista',
        'analista.subregion@vih.gob.ve',
        'analista123',
      ),
    );

    expect(perfil.tipo).toBe('trabajador');
    service.entrar(subregion, perfil);
    expect(service.sesion()?.rol).toBe(3);

    service.salir();
    expect(service.sesion()).toBeNull();
    expect(service.autenticado()).toBe(false);
  });
});
