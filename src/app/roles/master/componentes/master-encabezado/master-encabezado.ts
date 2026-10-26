import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Cabecera común de las páginas internas del master. */
@Component({
  selector: 'app-master-encabezado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './master-encabezado.html',
  styleUrl: './master-encabezado.css',
})
export class MasterEncabezado {
  readonly eyebrow = input('Sistema V');
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
}
