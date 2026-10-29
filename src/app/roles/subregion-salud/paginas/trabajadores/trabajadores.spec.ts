import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SubregionSaludTrabajadores } from './trabajadores';
import { DatosSubregionSaludService } from '../../../../nucleo/servicios/datos-subregion-salud.service';
import { DatosMasterService } from '../../../../nucleo/servicios/datos-master.service';
import { SesionService } from '../../../../nucleo/servicios/sesion.service';

describe('SubregionSaludTrabajadores', () => {
  let fixture: ComponentFixture<SubregionSaludTrabajadores>;
  let component: SubregionSaludTrabajadores;
  let datosSRS: DatosSubregionSaludService;
  let datosMaster: DatosMasterService;
  let sesion: SesionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubregionSaludTrabajadores],
      providers: [provideRouter([])],
    }).compileComponents();

    datosMaster = TestBed.inject(DatosMasterService);
    datosMaster.limpiarAlmacenamiento();

    datosSRS = TestBed.inject(DatosSubregionSaludService);
    sesion = TestBed.inject(SesionService);

    fixture = TestBed.createComponent(SubregionSaludTrabajadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra la lista inicial de trabajadores tipo 2 y métricas de Guárico', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(datosSRS.trabajadores().length).toBeGreaterThan(0);
    expect(el.textContent).toContain('Trabajadores tipo 2');
    expect(el.textContent).toContain('Personal de salud · Guárico');
  });

  it('permite filtrar trabajadores por rol y por término de búsqueda', () => {
    const el = fixture.nativeElement as HTMLElement;
    const initialCount = component['resultados']().length;
    expect(initialCount).toBeGreaterThan(0);

    // Filtrar por jefe
    component['rol'].set('jefe');
    fixture.detectChanges();
    expect(component['resultados']().every((t) => t.esJefe)).toBe(true);

    // Filtrar por trabajador
    component['rol'].set('trabajador');
    fixture.detectChanges();
    expect(component['resultados']().every((t) => !t.esJefe)).toBe(true);

    // Filtrar por término
    const primerTrabajador = datosSRS.trabajadores()[0];
    component['rol'].set('todos');
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

  it('permite registrar un nuevo trabajador tipo 2 mediante el formulario modal y se refleja inmediatamente', () => {
    const conteoInicial = datosSRS.trabajadores().length;
    const conteoTrabajadoresInicial = component['conteoTrabajadores']();

    // Abrir modal
    component['abrirAlta']();
    fixture.detectChanges();
    expect(component['altaAbierta']()).toBe(true);

    const centroGuarico = datosSRS.centros()[0].centro.id;

    // Completar datos
    component['actualizarAlta']('nombre', 'Lic. Roberto Enfermero');
    component['actualizarAlta']('cedula', '27999888');
    component['actualizarAlta']('correo', 'roberto.enfermero@vih.gob.ve');
    component['actualizarAlta']('profesionId', 'prof-enf');
    component['actualizarAlta']('centroId', centroGuarico);
    component['actualizarAlta']('tipo', 'trabajador');
    fixture.detectChanges();

    expect(component['formularioValido']()).toBe(true);

    // Guardar
    const mockEvent = new Event('submit');
    component['guardar'](mockEvent);
    fixture.detectChanges();

    expect(component['altaAbierta']()).toBe(false);
    expect(component['errorAlta']()).toBe('');

    // Verificar en SRS
    expect(datosSRS.trabajadores().length).toBe(conteoInicial + 1);
    expect(component['conteoTrabajadores']()).toBe(conteoTrabajadoresInicial + 1);

    const encontrado = datosSRS.trabajadores().find((t) => t.personal.cedula === '27999888');
    expect(encontrado).toBeDefined();
    expect(encontrado?.personal.nombre).toBe('Lic. Roberto Enfermero');
    expect(encontrado?.esJefe).toBe(false);

    // Verificar que aparece en resultados()
    expect(component['resultados']().some((t) => t.personal.cedula === '27999888')).toBe(true);

    // Verificar en el DOM renderizado
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Lic. Roberto Enfermero');
    expect(el.textContent).toContain('27999888');
  });
});
