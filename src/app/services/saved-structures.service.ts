import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

export interface SavedStructureData {
  structureType: string;
  size: number;
  elements: any[];
  metadata?: any;
}

export interface SavedStructure {
  id: string;
  name: string;
  structureType: string;
  structureId: string;
  data: SavedStructureData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSavedStructureDto {
  dataStructureId: string;
  name: string;
  data: SavedStructureData;
}

@Injectable({
  providedIn: 'root'
})
export class SavedStructuresService {
  private apiUrl = `${environment.apiUrl}/saved-structures`;

  constructor(private http: HttpClient) {}

 
  getUserSavedStructures(): Observable<SavedStructure[]> {
    return this.http.get<SavedStructure[]>(this.apiUrl);
  }

  getSavedStructureById(structureId: string): Observable<SavedStructure> {
    return this.http.get<SavedStructure>(`${this.apiUrl}/${structureId}`);
  }


  getUserStructuresByType(dataStructureId: string): Observable<SavedStructure[]> {
    return this.http.get<SavedStructure[]>(`${this.apiUrl}/type/${dataStructureId}`);
  }


  saveStructure(dto: CreateSavedStructureDto): Observable<SavedStructure> {
    return this.http.post<SavedStructure>(this.apiUrl, dto);
  }


  deleteStructure(structureId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${structureId}`);
  }

  deleteAllUserStructuresByType(dataStructureId: string): Observable<{ message: string; count: number }> {
    return this.http.delete<{ message: string; count: number }>(`${this.apiUrl}/type/${dataStructureId}`);
  }
}
