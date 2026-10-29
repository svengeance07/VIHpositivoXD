import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecera común de las vistas de la Subregión de Salud.
 * Mantiene la jerarquía visual de /PS y el master, con un acento propio para
 * las acciones contextuales de cada página.
 */
@Component({
  selector: 'app-srs-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './srs-encabezado.html',
  styleUrl: './srs-encabezado.css',
})
export class SrsEncabezado {
  readonly eyebrow = input('Subregión de Salud');
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
}
