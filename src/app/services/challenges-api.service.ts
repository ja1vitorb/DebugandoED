import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class ChallengesApiService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getChallenges(dataStructureName: string) {
    const params = new HttpParams().set('dataStructureName', dataStructureName);
    return this.http.get<any[]>(`${this.api}/challenges`, { params });
  }

  submitChallenge(submissionData: any) {
    return this.http.post<any>(`${this.api}/submissions`, submissionData);
  }
}
