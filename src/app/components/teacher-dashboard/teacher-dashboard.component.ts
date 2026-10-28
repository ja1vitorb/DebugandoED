import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AnalyticsService, DashboardStats } from '../../services/analytics.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.analyticsService.getTeacherDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.error = 'Erro ao carregar as estatísticas. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  getTotalSubmissions(): number {
    if (!this.stats) return 0;
    return this.stats.overview.totalSubmissions;
  }

  getSuccessRate(): string {
    if (!this.stats) return '0%';
    return this.stats.overview.successRate;
  }

  getStructurePercentage(count: number): number {
    if (!this.stats || this.stats.overview.totalStudents === 0) return 0;
    return Math.round((count / this.stats.overview.totalStudents) * 100);
  }

  getStructureColor(index: number): string {
    const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e', '#16a085'];
    return colors[index % colors.length];
  }
}
