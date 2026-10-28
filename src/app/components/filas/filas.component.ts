import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-filas',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './filas.component.html',
  styleUrl: './filas.component.scss'
})
export class FilasComponent {
  tituloPag = 'QUEUE_SWAP.GENERIC_TITLE';

  menuItems = [
      { labelKey: 'QUEUE_COMPONENT.BASIC_QUEUE', icon: 'fila.svg', route: '/filaBasica', descricaoKey: 'QUEUE.MODAL_QUEUE.SIMULATION_BASIC', corpo: './filaBasica.svg', corpoRoute: '/corpoFila'},
      { labelKey: 'QUEUE_COMPONENT.SWAP_QUEUE', icon: 'fila.svg', route: '/filaTroca', descricaoKey: 'QUEUE.MODAL_QUEUE.SIMULATION_SWAP', corpo: './filaComTroca.svg', corpoRoute: '/corpoFilaComTroca'},
      { labelKey: 'QUEUE_COMPONENT.CIRCLE_QUEUE', icon: 'fila.svg', route: '/filaCircular', descricaoKey: 'QUEUE.MODAL_QUEUE.SIMULATION_CIRCLE', corpo: './corpoFila.svg', corpoRoute: '/corpoFilaCircular'}
    ];

    getImagePath(icon: string): string {
    return `/images/${icon}`;
  }
}
