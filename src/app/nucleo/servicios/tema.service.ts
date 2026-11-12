import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type ModoTema = 'dark' | 'light';

const CLAVE_TEMA_STORAGE = 'vih_tema_visual';

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  private readonly document = inject(DOCUMENT);

  readonly tema = signal<ModoTema>(this.leerTemaInicial());
  readonly esOscuro = computed(() => this.tema() === 'dark');

  constructor() {
    this.aplicarTemaEnDom(this.tema());
  }

  alternarTema(): void {
    const siguiente: ModoTema = this.tema() === 'dark' ? 'light' : 'dark';
    this.establecerTema(siguiente);
  }

  establecerTema(modo: ModoTema): void {
    this.tema.set(modo);
    this.aplicarTemaEnDom(modo);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CLAVE_TEMA_STORAGE, modo);
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }

  private leerTemaInicial(): ModoTema {
    try {
      if (typeof localStorage !== 'undefined') {
        const guardado = localStorage.getItem(CLAVE_TEMA_STORAGE);
        if (guardado === 'light' || guardado === 'dark') {
          return guardado;
        }
      }
    } catch {
      // Ignorar
    }
    return 'dark';
  }

  private aplicarTemaEnDom(modo: ModoTema): void {
    const html = this.document?.documentElement;
    if (!html) {
      return;
    }
    html.setAttribute('data-theme', modo);
    html.style.colorScheme = modo;
  }
}
