import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CurrentStructureState {
  type: string; 
  name: string; 
  data: any;   
  canSave: boolean; 
}

@Injectable({
  providedIn: 'root'
})
export class CurrentStructureService {
  private currentStructureSubject = new BehaviorSubject<CurrentStructureState | null>(null);
  public currentStructure$: Observable<CurrentStructureState | null> = this.currentStructureSubject.asObservable();

  setCurrentStructure(structure: CurrentStructureState | null): void {
    this.currentStructureSubject.next(structure);
  }

  getCurrentStructure(): CurrentStructureState | null {
    return this.currentStructureSubject.value;
  }
  
  clearCurrentStructure(): void {
    this.currentStructureSubject.next(null);
  }
}
