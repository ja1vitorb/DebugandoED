import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SavedStructuresService, SavedStructure } from '../../services/saved-structures.service';
import { StructureLoaderService } from '../../services/structure-loader.service';

@Component({
  selector: 'app-saved-structures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-structures.component.html',
  styleUrls: ['./saved-structures.component.scss']
})
export class SavedStructuresComponent implements OnInit {
  savedStructures: SavedStructure[] = [];
  loading: boolean = true;
  selectedStructures: Set<string> = new Set();
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private savedStructuresService: SavedStructuresService,
    private structureLoaderService: StructureLoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSavedStructures();
  }

  loadSavedStructures(): void {
    this.loading = true;
    this.savedStructuresService.getUserSavedStructures().subscribe({
      next: (structures) => {
        this.savedStructures = structures;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar estruturas:', error);
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleSelection(structureId: string): void {
    if (this.selectedStructures.has(structureId)) {
      this.selectedStructures.delete(structureId);
    } else {
      this.selectedStructures.add(structureId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedStructures.size === this.savedStructures.length) {
      this.selectedStructures.clear();
    } else {
      this.savedStructures.forEach(s => this.selectedStructures.add(s.id));
    }
  }

  isSelected(structureId: string): boolean {
    return this.selectedStructures.has(structureId);
  }

  isAllSelected(): boolean {
    return this.savedStructures.length > 0 && 
           this.selectedStructures.size === this.savedStructures.length;
  }

  deleteSelected(): void {
    if (this.selectedStructures.size === 0) {
      this.showMessage('Selecione pelo menos uma estrutura para deletar', 'error');
      return;
    }

    if (!confirm(`Deseja realmente deletar ${this.selectedStructures.size} estrutura(s)?`)) {
      return;
    }

    let deletedCount = 0;
    const toDelete = Array.from(this.selectedStructures);

    toDelete.forEach((structureId, index) => {
      this.savedStructuresService.deleteStructure(structureId).subscribe({
        next: () => {
          deletedCount++;
          if (index === toDelete.length - 1) {
            this.showMessage(`${deletedCount} estrutura(s) deletada(s) com sucesso`, 'success');
            this.selectedStructures.clear();
            this.loadSavedStructures();
          }
        },
        error: (error) => {
          console.error('Erro ao deletar estrutura:', error);
          this.showMessage('Erro ao deletar algumas estruturas', 'error');
        }
      });
    });
  }

  loadStructure(structure: SavedStructure): void {
    // Usa o StructureLoaderService para carregar a estrutura
    this.structureLoaderService.loadStructure(structure.structureType, structure.data);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  getStructureTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'VETOR': 'Vetor',
      'MATRIZ': 'Matriz',
      'PONTEIRO': 'Ponteiro',
      'PILHA': 'Pilha',
      'FILA': 'Fila',
      'FILA_CIRCULAR': 'Fila Circular',
      'FILA_COM_TROCA': 'Fila com Troca',
      'LISTA_ENCADEADA': 'Lista Encadeada',
      'LISTA_DUPLAMENTE_ENCADEADA': 'Lista Duplamente Encadeada'
    };
    return labels[type] || type;
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
}
