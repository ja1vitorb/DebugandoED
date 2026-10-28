import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Retorna progresso das estruturas para o usuário autenticado
  getStructureProgress() {
    return this.http.get<any[]>(`${this.apiUrl}/users/me/structure-progress`);
  }


}
