import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Node {
  valor: number;
  proximo: number | null;
}

@Component({
  selector: 'app-lista-teste',
  imports: [CommonModule],
  templateUrl: './lista-teste.component.html',
  styleUrl: './lista-teste.component.scss'
})
export class ListaTesteComponent {

  lista: Node[] = [
    { valor: 23, proximo: 5 }, { valor: 5, proximo: 100 }, { valor: 100, proximo: 25 },
    { valor: 25, proximo: 70 }, { valor: 70, proximo: 958 }, { valor: 958, proximo: 9 },
    { valor: 9, proximo: 346 }, { valor: 346, proximo: 44 }, { valor: 44, proximo: null }
  ];

}
