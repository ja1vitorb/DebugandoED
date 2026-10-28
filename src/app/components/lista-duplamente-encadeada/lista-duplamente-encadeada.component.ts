import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-duplamente-encadeada',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './lista-duplamente-encadeada.component.html',
  styleUrl: './lista-duplamente-encadeada.component.scss'
})
export class ListaDuplamenteEncadeadaComponent {
tituloPag = 'LINKED_LIST.DOUBLY_TITLE';

  menuItems = [
    { labelKey: 'LINKED_LIST.LABEL_INIT', icon: 'lista.svg', route: '/listaDuplamenteInsereInicio', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_INIT', corpo: './listaEncadeadaInsereInicio.svg', corpoRoute: '/corpoFila' },
    { labelKey: 'LINKED_LIST.LABEL_END', icon: 'lista.svg', route: '/listaDuplamenteEncadeadaFim', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_END', corpo: './listaEncadeadaInsereFim.svg', corpoRoute: '/corpoFilaComTroca' },
    { labelKey: 'LINKED_LIST.LABEL_ORDENATE', icon: 'lista.svg', route: '/listaDuplamenteEncadeadaOrdenada', descricaoKey: 'LINKED_LIST.LABEL_DESCRIPTION_ORDENATE', corpo: './listaEncadeadaInsereOrdenado.svg', corpoRoute: '/corpoFilaComTroca' }
  ];

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }
}
