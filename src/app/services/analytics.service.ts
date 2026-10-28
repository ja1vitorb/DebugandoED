import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

export interface RankingUser {
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  avatarUrl: string | null;
  institution: string | null;
  educationLevel: string | null;
  totalSubmissions: number;
  medalsEarned: number;
}

export interface StructureLevel {
  structure: string;
  studentsUnlocked: number;
}

export interface DashboardOverview {
  totalStudents: number;
  totalSubmissions: number;
  correctSubmissions: number;
  incorrectSubmissions: number;
  successRate: string;
  champions: number;
  totalPointsDistributed: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  structureLevels: StructureLevel[];
  students: StudentDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRanking(): Observable<RankingUser[]> {
    return this.http.get<RankingUser[]>(`${this.apiUrl}/analytics/ranking`);
  }


  getTeacherDashboard(): Observable<DashboardStats> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<DashboardStats>(`${this.apiUrl}/analytics/dashboard`, { headers });
  }
}
