import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService, RankingUser } from '../../services/analytics.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  ranking: RankingUser[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
    this.loading = true;
    this.error = null;

    this.analyticsService.getRanking().subscribe({
      next: (data) => {
        this.ranking = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ranking:', err);
        this.error = 'Erro ao carregar o ranking. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  getMedalIcon(position: number): string {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  }

  getMedalClass(position: number): string {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    if (position === 3) return 'bronze';
    return '';
  }

  getAvatarUrl(user: RankingUser): string {
    return user.avatarUrl || 'assets/default-avatar.png';
  }
}
