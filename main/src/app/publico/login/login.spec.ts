import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Login } from './login';

describe('Login', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  function crear(): { fixture: ComponentFixture<Login>; element: HTMLElement } {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function elegirRol(element: HTMLElement, indice: number): void {
    element.querySelectorAll<HTMLButtonElement>('.rol')[indice].click();
  }

  function enviar(fixture: ComponentFixture<Login>, correo: string, clave: string): void {
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll<HTMLInputElement>('.paso input');
    inputs[0].value = correo;
    inputs[1].value = clave;
    element.querySelector<HTMLElement>('.paso .form ca-button')?.click();
    fixture.detectChanges();
  }

  it('hace el flujo de dos niveles para el personal de salud', () => {
    const { fixture, element } = crear();

    elegirRol(element, 1);
    fixture.detectChanges();
    enviar(fixture, 'centro@vih.gob.ve', 'centro123');

    expect(element.querySelectorAll('.perfil')).toHaveLength(2);

    element.querySelectorAll<HTMLButtonElement>('.perfil')[0].click();
    fixture.detectChanges();
    enviar(fixture, 'jefe.centro@vih.gob.ve', 'jefe123');

    expect(router.navigateByUrl).toHaveBeenCalledWith('/PS');
  });

  it('hace el flujo de dos niveles para la subregión', () => {
    const { fixture, element } = crear();

    elegirRol(element, 2);
    fixture.detectChanges();
    enviar(fixture, 'subregion@vih.gob.ve', 'subregion123');

    element.querySelectorAll<HTMLButtonElement>('.perfil')[1].click();
    fixture.detectChanges();
    enviar(fixture, 'analista.subregion@vih.gob.ve', 'analista123');

    expect(router.navigateByUrl).toHaveBeenCalledWith('/SRS');
  });

  it('deja entrar al master sin pedir un perfil', () => {
    const { fixture, element } = crear();

    elegirRol(element, 0);
    fixture.detectChanges();
    enviar(fixture, 'master@vih.gob.ve', 'master123');

    expect(element.querySelectorAll('.perfil')).toHaveLength(0);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/master');
  });

  it('muestra un error si las credenciales de la entidad no coinciden', () => {
    const { fixture, element } = crear();

    elegirRol(element, 1);
    fixture.detectChanges();
    enviar(fixture, 'centro@vih.gob.ve', 'incorrecta');

    expect(element.querySelector('.paso')?.textContent).toContain('no corresponden');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
