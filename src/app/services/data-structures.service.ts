import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

export interface DataStructure {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataStructuresService {
  private apiUrl = `${environment.apiUrl}/data-structures`;

  constructor(private http: HttpClient) {}

  getAllDataStructures(): Observable<DataStructure[]> {
    return this.http.get<DataStructure[]>(this.apiUrl);
  }

  getStructureIdByName(name: string): Observable<DataStructure | undefined> {
    return new Observable(observer => {
      this.getAllDataStructures().subscribe({
        next: (structures) => {
          const structure = structures.find(s => s.name === name);
          observer.next(structure);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
