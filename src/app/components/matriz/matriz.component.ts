import { Component } from '@angular/core';
import { BlocosTopoComponent } from "../features/blocos-topo/blocos-topo.component";
import { ExecucaoComponent } from "../features/execucao/execucao.component";
import { ModalComponent } from "../features/modal/modal.component";

@Component({
  selector: 'app-matriz',
  imports: [BlocosTopoComponent, ExecucaoComponent, ModalComponent],
  templateUrl: './matriz.component.html',
  styleUrl: './matriz.component.scss'
})
export class MatrizComponent {
  tituloPag: string = 'Matriz';
}
