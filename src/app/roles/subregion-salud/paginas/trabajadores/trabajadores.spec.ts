import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubregionSaludTrabajadores } from './trabajadores';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';

describe('SubregionSaludTrabajadores', () => {
  let fixture: ComponentFixture<SubregionSaludTrabajadores>;
  let component: SubregionSaludTrabajadores;
  let datosSRS: DatosSubregionSaludService;
  let datosMaster: DatosMasterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubregionSaludTrabajadores],
      providers: [provideRouter([])],
    }).compileComponents();

    datosMaster = TestBed.inject(DatosMasterService);
    datosMaster.limpiarAlmacenamiento();

    datosSRS = TestBed.inject(DatosSubregionSaludService);

    fixture = TestBed.createComponent(SubregionSaludTrabajadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra la lista inicial de jefes de centro tipo 2 y métricas de Guárico', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(datosSRS.trabajadores().length).toBeGreaterThan(0);
    expect(el.textContent).toContain('Jefes de centro');
    expect(el.textContent).toContain('Jefaturas de salud · Guárico');
  });

  it('permite filtrar jefes de centro por centro y por término de búsqueda', () => {
    const initialCount = component['resultados']().length;
    expect(initialCount).toBeGreaterThan(0);
    expect(component['resultados']().every((t) => t.esJefe)).toBe(true);

    // Filtrar por término
    const primerTrabajador = datosSRS.trabajadores()[0];
    component['termino'].set(primerTrabajador.personal.cedula);
    fixture.detectChanges();
    expect(
      component['resultados']().some((t) => t.personal.cedula === primerTrabajador.personal.cedula),
    ).toBe(true);

    // Limpiar filtros
    component['limpiar']();
    fixture.detectChanges();
    expect(component['resultados']().length).toBe(initialCount);
  });

  it('permite asignar un nuevo jefe de centro tipo 2 mediante el formulario modal y se refleja inmediatamente', () => {
    const conteoInicial = datosSRS.trabajadores().length;

    // Abrir modal
    component['abrirAlta']();
    fixture.detectChanges();
    expect(component['altaAbierta']()).toBe(true);

    const centroGuarico = datosSRS.centros()[0].centro.id;

    // Completar datos
    component['actualizarAlta']('nombre', 'Dr. Roberto Jefe');
    component['actualizarAlta']('cedula', '27999888');
    component['actualizarAlta']('correo', 'roberto.jefe@vih.gob.ve');
    component['actualizarAlta']('profesionId', 'prof-med');
    component['actualizarAlta']('centroId', centroGuarico);
    fixture.detectChanges();

    expect(component['formularioValido']()).toBe(true);

    // Guardar
    const mockEvent = new Event('submit');
    component['guardar'](mockEvent);
    fixture.detectChanges();

    expect(component['altaAbierta']()).toBe(false);
    expect(component['errorAlta']()).toBe('');

    // Reemplaza al jefe anterior del centro manteniendo 1 usuario por centro
    expect(datosSRS.trabajadores().length).toBe(conteoInicial);

    const encontrado = datosSRS.trabajadores().find((t) => t.personal.cedula === '27999888');
    expect(encontrado).toBeDefined();
    expect(encontrado?.personal.nombre).toBe('Dr. Roberto Jefe');
    expect(encontrado?.esJefe).toBe(true);

    // Verificar que aparece en resultados()
    expect(component['resultados']().some((t) => t.personal.cedula === '27999888')).toBe(true);

    // Verificar en el DOM renderizado
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dr. Roberto Jefe');
    expect(el.textContent).toContain('27999888');
  });
});
