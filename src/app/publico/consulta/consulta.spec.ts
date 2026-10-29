import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Consulta } from './consulta';

describe('Consulta', () => {
  let fixture: ComponentFixture<Consulta>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consulta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Consulta);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  function buscar(cedula: string): void {
    const input = element.querySelector<HTMLInputElement>('#cedula-consulta');
    const form = element.querySelector<HTMLFormElement>('.consulta-buscador');

    input!.value = cedula;
    input!.dispatchEvent(new Event('input'));
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('muestra los datos y permite simular el envío de un certificado emitido', () => {
    buscar('26548971');

    expect(element.textContent).toContain('Génesis Paola Medina');
    expect(element.querySelector('.consulta-certificado')?.textContent).toContain('Emitido');

    const enviar = [...element.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Enviar certificado'),
    );
    expect(enviar).toBeDefined();

    enviar!.click();
    fixture.detectChanges();

    expect(element.querySelector('.consulta-envio-ok')?.textContent).toContain('Envío registrado');
    expect(element.textContent).not.toContain('Enviar certificado a mi correo');
  });

  it('no ofrece envío para un certificado descartado', () => {
    buscar('4326719');

    expect(element.querySelector('.consulta-certificado')?.textContent).toContain('Descartado');
    expect(element.textContent).not.toContain('Enviar certificado a mi correo');
  });

  it('limpia el resultado al cambiar la cédula y avisa si no existe', () => {
    buscar('26548971');
    expect(element.textContent).toContain('Génesis Paola Medina');

    const input = element.querySelector<HTMLInputElement>('#cedula-consulta');
    input!.value = '00000000';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('.consulta-resultado')).toBeNull();

    const form = element.querySelector<HTMLFormElement>('.consulta-buscador');
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.querySelector('.consulta-error')?.textContent).toContain('No encontramos');
  });
});
