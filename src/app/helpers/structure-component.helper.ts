import { OnInit, OnDestroy, Directive } from '@angular/core';
import { CurrentStructureService } from '../services/current-structure.service';
import { StructureLoaderService } from '../services/structure-loader.service';

/**
 * Interface que os componentes de estrutura devem implementar
 */
export interface StructureComponent {
  structureType: string;
  updateCurrentStructure(): void;
  loadFromData(data: any): void;
}


export class StructureComponentHelper {
  constructor(
    private component: StructureComponent,
    private currentStructureService: CurrentStructureService,
    private structureLoaderService: StructureLoaderService
  ) {}


  onInit(): void {
    this.checkAndLoadPendingStructure();
    this.component.updateCurrentStructure();
  }


  onDestroy(): void {
    this.currentStructureService.clearCurrentStructure();
  }

 
  private checkAndLoadPendingStructure(): void {
    const pendingData = this.structureLoaderService.getPendingLoad();
    
    if (pendingData && pendingData.structureType === this.component.structureType) {
      this.component.loadFromData(pendingData);
      alert(`${this.component.structureType} carregada com sucesso!`);
    }
  }


  updateState(state: any): void {
    this.currentStructureService.setCurrentStructure(state);
  }
}
