import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UsuarioService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-available-challenges',
  templateUrl: './available-challenges.component.html',
  styleUrl: './available-challenges.component.scss',
  imports: [RouterModule, CommonModule, TranslateModule]
})
export class AvailableChallengesComponent implements OnInit {
  structures = [
    { key: 'VETOR', label: 'VETOR', unlocked: false, completed: false },
    { key: 'MATRIZ', label: 'MATRIZ', unlocked: false, completed: false },
    { key: 'PONTEIRO', label: 'PONTEIRO', unlocked: false, completed: false },
    { key: 'PILHA', label: 'PILHA', unlocked: false, completed: false },
    { key: 'FILA', label: 'FILA', unlocked: false, completed: false },
    { key: 'FILA_CIRCULAR', label: 'FILA CIRCULAR', unlocked: false, completed: false },
    { key: 'LISTA', label: 'LISTA', unlocked: false, completed: false },
    { key: 'LISTA_DUPLAMENTE', label: 'LISTA DUPLAMENTE', unlocked: false, completed: false },
  ];

  getImagePath(structure: any): string {
    const baseNames: { [key: string]: string } = {
      'VETOR': 'vetor',
      'MATRIZ': 'matriz',
      'PONTEIRO': 'ponteiro',
      'PILHA': 'pilha',
      'FILA': 'fila',
      'FILA_CIRCULAR': 'filacircular',
      'LISTA': 'lista',
      'LISTA_DUPLAMENTE': 'listaduplamente'
    };

    const baseName = baseNames[structure.key] || structure.key.toLowerCase();
    
    if (structure.completed) {
      if (baseName === 'vetor' || baseName === 'ponteiro') {
        return `/assets/images/desafios/${baseName}finalizado.png`;
      }
      return `/assets/images/desafios/${baseName}finalizada.png`;
    } else if (!structure.unlocked) {
      if (baseName === 'vetor') {
        return `/assets/images/desafios/${baseName}.png`;
      }
      if (baseName === 'ponteiro') {
        return `/assets/images/desafios/${baseName}bloqueado.png`;
      }
      return `/assets/images/desafios/${baseName}bloqueada.png`;
    } else {
      return `/assets/images/desafios/${baseName}.png`;
    }
  }

  openChallenges(structureKey: string) {
    this.router.navigate(['/desafios', structureKey]);
  }

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ngOnInit(): void {
    this.usuarioService.getStructureProgress().subscribe({
      next: (rows) => {
        this.structures = this.structures.map(s => {
          const row = rows.find(r => r.dataStructure?.name === s.key || r.dataStructure?.name === s.label);
          return { 
            ...s, 
            unlocked: row ? !!row.isUnlocked : s.unlocked,
            completed: row ? !!row.isCompleted : s.completed
          };
        });
      },
      error: (err) => {
        console.warn('Não foi possível carregar progresso das estruturas:', err);
      }
    });
  }
}
