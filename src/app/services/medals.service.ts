import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../enviroments/environment';

export interface Medal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  unlockCriteria: string;
  isUnlocked?: boolean;
  earnedAt?: Date;
}

export interface UserMedalsResponse {
  user: {
    id: string;
    name: string;
    email: string;
    totalPoints: number;
    avatarUrl: string | null;
  };
  medals: Medal[];
}

export interface CheckMedalsResponse {
  newMedals: Medal[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedalsService {
  private apiUrl = `${environment.apiUrl}/medals`;
  private newMedalsSubject = new BehaviorSubject<Medal[]>([]);
  public newMedals$ = this.newMedalsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllMedals(): Observable<Medal[]> {
    return this.http.get<Medal[]>(this.apiUrl);
  }

  getUserMedals(): Observable<UserMedalsResponse> {
    return this.http.get<UserMedalsResponse>(`${this.apiUrl}/user`);
  }

  checkAndAwardMedals(): Observable<CheckMedalsResponse> {
    return this.http.post<CheckMedalsResponse>(`${this.apiUrl}/check`, {}).pipe(
      tap(response => {
        if (response.newMedals.length > 0) {
          this.newMedalsSubject.next(response.newMedals);
        }
      })
    );
  }

  clearNewMedals(): void {
    this.newMedalsSubject.next([]);
  }
}
