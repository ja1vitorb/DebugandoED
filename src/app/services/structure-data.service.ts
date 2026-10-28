import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StructureDataService {
  private structureDataSubject = new BehaviorSubject<any>(null);
  public structureData$: Observable<any> = this.structureDataSubject.asObservable();

  constructor() {}

  setStructureData(data: any): void {
    this.structureDataSubject.next(data);
  }

  getStructureData(): any {
    return this.structureDataSubject.value;
  }

  clearStructureData(): void {
    this.structureDataSubject.next(null);
  }
}
