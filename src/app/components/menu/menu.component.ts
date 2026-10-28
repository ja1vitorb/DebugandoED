import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, User } from '../../services/auth.service';
import { CurrentStructureService, CurrentStructureState } from '../../services/current-structure.service';
import { SavedStructuresService } from '../../services/saved-structures.service';
import { DataStructuresService } from '../../services/data-structures.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {


  menuItems = [
  { label: 'Estruturas', labelKey: 'MENU.STRUCTURES', icon: 'estruturas.svg', route: '/estruturas' },
  { label: 'Vetor', labelKey: 'MENU.VECTOR', icon: 'vetor.svg', route: '/vetor' },
  { label: 'Matriz', labelKey: 'MENU.MATRIX', icon: 'matriz.svg', route: '/matriz' },
  { label: 'Ponteiro', labelKey: 'MENU.POINTER', icon: 'ponteiro.svg', route: '/ponteiro' },
  { label: 'Pilha', labelKey: 'MENU.STACK', icon: 'pilha.svg', route: '/pilha'},
  { label: 'Filas', labelKey: 'MENU.QUEUE', icon: 'fila.svg', route: '/filas' },
  { label: 'Listas', labelKey: 'MENU.LIST', icon: 'lista.svg', route: '/listas' },
  { label: 'Grafos', labelKey: 'MENU.GRAPH', icon: 'grafo.svg', route: '/grafos' },
  ];

  currentLang: 'pt' | 'en' = 'pt';
  currentLangLabel: string = 'PT';

  currentUser: User | null = null;
  currentStructure: CurrentStructureState | null = null;
  canSave: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private translate: TranslateService, 
    public auth: AuthService, 
    public router: Router,
    private currentStructureService: CurrentStructureService,
    private savedStructuresService: SavedStructuresService,
    private dataStructuresService: DataStructuresService
  ) {
    const saved = localStorage.getItem('app_lang');
    this.currentLang = (saved === 'en') ? 'en' : 'pt';
    this.translate.setDefaultLang('pt');
    this.translate.use(this.currentLang);
    this.updateLangLabel();
    this.auth.user$.subscribe(u => this.currentUser = u);
  }

  ngOnInit(): void {
    // Observa mudanças na estrutura atual
    const structureSub = this.currentStructureService.currentStructure$.subscribe(structure => {
      this.currentStructure = structure;
      this.canSave = structure?.canSave || false;
    });
    this.subscriptions.push(structureSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'pt' ? 'en' : 'pt';
    this.translate.use(this.currentLang);
    localStorage.setItem('app_lang', this.currentLang);
    this.updateLangLabel();
  }

  private updateLangLabel() {
    this.currentLangLabel = this.currentLang === 'pt' ? 'PT' : 'EN';
  }

  getImagePath(icon: string): string {
    return `/images/${icon}`;
  }

  saveCurrentStructure(): void {
    if (!this.canSave || !this.currentStructure || !this.currentUser) {
      alert('Não há estrutura para salvar ou você não está logado.');
      return;
    }

   
    const name = prompt(
      `Salvar ${this.currentStructure.type}:`, 
      this.currentStructure.name || `${this.currentStructure.type} ${new Date().toLocaleTimeString()}`
    );

    if (!name) {
      return; 
    }

    this.dataStructuresService.getStructureIdByName(this.currentStructure.type).subscribe({
      next: (dataStructure) => {
        if (!dataStructure) {
          alert('Erro: Tipo de estrutura não encontrado.');
          return;
        }

        const saveData = {
          dataStructureId: dataStructure.id,
          name: name,
          data: this.currentStructure!.data
        };

        this.savedStructuresService.saveStructure(saveData).subscribe({
          next: () => {
            alert('Estrutura salva com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar estrutura: ' + (err.error?.message || err.message));
          }
        });
      },
      error: (err) => {
        console.error('Erro ao buscar estrutura:', err);
        alert('Erro ao buscar tipo de estrutura');
      }
    });
  }
}
