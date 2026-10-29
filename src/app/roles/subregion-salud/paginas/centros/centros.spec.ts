import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubregionSaludCentros } from './centros';
import { SubregionSaludTrabajadores } from '../trabajadores/trabajadores';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';

describe('Flujo DOM de creacion de centro y jefe desde SRS', () => {
  let fixtureCentros: ComponentFixture<SubregionSaludCentros>;
  let centrosComponent: SubregionSaludCentros;
  let datosSRS: DatosSubregionSaludService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubregionSaludCentros, SubregionSaludTrabajadores],
      providers: [provideRouter([])],
    }).compileComponents();

    datosSRS = TestBed.inject(DatosSubregionSaludService);
    fixtureCentros = TestBed.createComponent(SubregionSaludCentros);
    centrosComponent = fixtureCentros.componentInstance;
    fixtureCentros.detectChanges();
  });

  it('interactua con los elementos DOM y envia el formulario', () => {
    const el = fixtureCentros.nativeElement as HTMLElement;

    // Click "Agregar centro"
    const btnAgregar = el.querySelector('button.btn-primary') as HTMLButtonElement;
    btnAgregar.click();
    fixtureCentros.detectChanges();

    const form = el.querySelector('form.master-modal__cuerpo') as HTMLFormElement;
    expect(form).toBeTruthy();

    const inputs = form.querySelectorAll('input');
    const selects = form.querySelectorAll('select');

    // inputs[0]: Nombre
    inputs[0].value = 'Ambulatorio Los Llanos';
    inputs[0].dispatchEvent(new Event('input'));

    // inputs[1]: Codigo
    inputs[1].value = 'CS-GUA-88';
    inputs[1].dispatchEvent(new Event('input'));

    // selects[0]: Municipio
    selects[0].value = 'm-san-juan';
    selects[0].dispatchEvent(new Event('change'));
    fixtureCentros.detectChanges();

    // selects[1]: Parroquia
    expect(selects[1].disabled).toBe(false);
    selects[1].value = 'p-san-juan';
    selects[1].dispatchEvent(new Event('change'));
    fixtureCentros.detectChanges();

    // inputs[3]: Jefe Nombre (inputs[2] is disabled Estado)
    inputs[3].value = 'Dr. Juan Llanero';
    inputs[3].dispatchEvent(new Event('input'));

    // inputs[4]: Jefe Cedula
    inputs[4].value = '25890123';
    inputs[4].dispatchEvent(new Event('input'));

    // inputs[5]: Jefe Correo
    inputs[5].value = 'juan.llanero@vih.gob.ve';
    inputs[5].dispatchEvent(new Event('input'));
    fixtureCentros.detectChanges();

    expect((centrosComponent as any).formularioValido()).toBe(true);

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    form.dispatchEvent(new Event('submit'));
    fixtureCentros.detectChanges();

    expect((centrosComponent as any).errorAlta()).toBe('');
    expect((centrosComponent as any).altaAbierta()).toBe(false);

    // Verificar en datosSRS
    const nuevoTrabajador = datosSRS.trabajadores().find((t) => t.personal.cedula === '25890123');
    expect(nuevoTrabajador).toBeDefined();
    expect(nuevoTrabajador?.personal.nombre).toBe('Dr. Juan Llanero');

    // Verificar en SubregionSaludTrabajadores
    const fixtureTrabajadores = TestBed.createComponent(SubregionSaludTrabajadores);
    fixtureTrabajadores.detectChanges();
    const trabEl = fixtureTrabajadores.nativeElement as HTMLElement;
    expect(trabEl.textContent).toContain('Dr. Juan Llanero');
  });
});
