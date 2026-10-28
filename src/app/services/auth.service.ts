import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  totalPoints?: number;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiBase = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiBase}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res && res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  register(payload: any) {
    return this.http.post<any>(`${this.apiBase}/auth/register`, payload).pipe(
      tap(res => {
        if (res && res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  private loadUser(): User | null {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }
}
