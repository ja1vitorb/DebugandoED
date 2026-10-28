import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface LoadStructureData {
  structureType: string;
  size: number;
  elements: any[];
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StructureLoaderService {
  private pendingLoad: LoadStructureData | null = null;

  constructor(private router: Router) {}

  loadStructure(structureType: string, data: LoadStructureData): void {
    this.pendingLoad = data;
    
    const routeMap: { [key: string]: string } = {
      'VETOR': '/vetor',
      'MATRIZ': '/matriz',
      'PONTEIRO': '/ponteiro',
      'PILHA': '/pilha',
      'FILA': '/filaBasica',
      'FILA_CIRCULAR': '/filaCircular',
      'FILA_COM_TROCA': '/filaTroca',
      'LISTA_ENCADEADA': '/listaEncadeadaInicio',
      'LISTA_DUPLAMENTE_ENCADEADA': '/listaDuplamenteEncadeada'
    };

    const route = routeMap[structureType];
    if (route) {
      this.router.navigate([route]);
    } else {
      console.error('Tipo de estrutura não mapeado:', structureType);
      alert('Tipo de estrutura não suportado para carregamento');
    }
  }


  getPendingLoad(): LoadStructureData | null {
    const data = this.pendingLoad;
    this.pendingLoad = null; 
    return data;
  }


  hasPendingLoad(): boolean {
    return this.pendingLoad !== null;
  }


  clearPendingLoad(): void {
    this.pendingLoad = null;
  }
}
