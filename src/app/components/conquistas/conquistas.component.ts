import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedalsService, Medal } from '../../services/medals.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conquistas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conquistas.component.html',
  styleUrls: ['./conquistas.component.scss']
})
export class ConquistasComponent implements OnInit {
  medals: Medal[] = [];
  userPoints: number = 0;
  userName: string = '';
  userAvatar: string = '';
  selectedMedal: Medal | null = null;
  selectedMedalIndex: number = -1;
  loading: boolean = true;

  constructor(
    private medalsService: MedalsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedals();
  }

  loadMedals(): void {
    this.loading = true;
    this.medalsService.getUserMedals().subscribe({
      next: (response) => {
        this.userName = response.user.name;
        this.userPoints = response.user.totalPoints;
        this.userAvatar = response.user.avatarUrl || '/assets/images/avatars/avatar1.png';
        
        this.medals = response.medals;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar medalhas:', error);
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getMedalImage(medal: Medal): string {
    const baseNumber = parseInt(medal.imageUrl || '1');
    const imageNumber = medal.isUnlocked ? baseNumber + 1 : baseNumber;
    return `/assets/images/medals/${imageNumber}.png`;
  }

  getDisplayMedalImage(medal: Medal): string {
    const baseNumber = parseInt(medal.imageUrl || '1');
    const displayNumber = baseNumber + 2;
    return `/assets/images/medals/${displayNumber}.png`;
  }

  showMedalDetails(medal: Medal, index: number): void {
    this.selectedMedal = medal;
    this.selectedMedalIndex = index;
  }

  closeMedalDetails(): void {
    this.selectedMedal = null;
    this.selectedMedalIndex = -1;
  }

  isLastColumn(index: number): boolean {
    return (index % 4) === 3;
  }
}
