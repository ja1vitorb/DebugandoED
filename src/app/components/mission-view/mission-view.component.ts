import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChallengesApiService } from '../../services/challenges-api.service';
import { StructureDataService } from '../../services/structure-data.service';
import { MatrizDataService } from '../../services/matriz-data.service';
import { VetorComponent } from '../vetor/vetor.component';
import { MatrizComponent } from '../matriz/matriz.component';

@Component({
  selector: 'app-mission-view',
  templateUrl: './mission-view.component.html',
  styleUrls: ['./mission-view.component.scss'],
  imports: [RouterModule, CommonModule, TranslateModule]
})
export class MissionViewComponent implements OnInit, OnDestroy {
  structure: string | null = null;
  challenge: any = null;
  selectedComponent: any = null;

  minutes: number = 5;
  seconds: number = 60;
  timerInterval: any;
  timeExpired: boolean = false;

  @ViewChild('structureContainer', { read: ViewContainerRef, static: false })
  structureContainer!: ViewContainerRef;
  
  private componentRef: ComponentRef<any> | null = null;

  private componentMap: Record<string, any> = {
    VETOR: VetorComponent,
    VETOR_COMP: VetorComponent,
    VETOR_COMPONENT: VetorComponent,
    MATRIZ: MatrizComponent,
    MATRIZ_COMP: MatrizComponent
  };

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private api: ChallengesApiService,
    private structureDataService: StructureDataService,
    private matrizDataService: MatrizDataService
  ) {}

  ngOnInit(): void {
    this.structure = this.route.snapshot.paramMap.get('structure');
    // Try to read passed state first (router.navigate state)
    const stateAny: any = history.state;
    if (stateAny && stateAny.challenge) {
      this.challenge = stateAny.challenge;
    }

    if (!this.challenge && this.structure) {
      // fallback: fetch challenges for structure and find by id
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.api.getChallenges(this.structure).subscribe({
          next: (list: any[]) => {
            this.challenge = list.find((x) => String(x.id) === String(id)) || null;
          },
          error: () => (this.challenge = null)
        });
      }
    }

    // decide which structural component to render
    if (this.structure) {
      const key = this.structure.toUpperCase();
      this.selectedComponent = this.componentMap[key] || null;
    }

    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.seconds--;
      
      if (this.seconds === 0) {
        this.minutes--;
        this.seconds = 60;
      }

      if (this.minutes === 0 && this.seconds === 0) {
        this.timeExpired = true;
        this.handleTimeExpired();
      }
    }, 1000);
  }

  handleTimeExpired(): void {
    clearInterval(this.timerInterval);
    alert('Tempo esgotado! A missão será encerrada.');
    this.router.navigate(['/desafios']);
  }

  submitMission(): void {
    if (this.timeExpired) {
      alert('Tempo esgotado!');
      return;
    }

    console.log('=== SUBMIT MISSION DEBUG ===');
    console.log('Structure type:', this.structure);
    console.log('ComponentRef exists:', !!this.componentRef);
    
    let structureData: any = null;
    
    if (this.componentRef && this.componentRef.instance) {
      const instance = this.componentRef.instance;
      
      if (typeof instance.getVectorData === 'function') {
        structureData = instance.getVectorData();
      } else if (typeof instance.getMatrizData === 'function') {
        structureData = instance.getMatrizData();
      } else if (typeof instance.getData === 'function') {
        structureData = instance.getData();
      }
    }
    
    
    if (!structureData) {
      
      if (this.structure?.toUpperCase() === 'VETOR') {
        structureData = this.structureDataService.getStructureData();
      }
      else if (this.structure?.toUpperCase() === 'MATRIZ') {
        const matrizData = this.matrizDataService.obterDados();

        if (matrizData.matrizCaixas && matrizData.matrizCaixas.length > 0) {
          structureData = {
            matriz: matrizData.matrizCaixas,
            linhas: matrizData.countLinha || matrizData.matrizCaixas.length,
            colunas: matrizData.countColuna || (matrizData.matrizCaixas[0]?.length || 0)
          };
        } else {
        }
      }
    }
    
    let formattedAnswer: any = {};
    
    if (this.structure?.toUpperCase() === 'VETOR' && structureData) {
      const vectorString = structureData.vetor.join(';');
      formattedAnswer = {
        type: 'VETOR',
        vetor: structureData.vetor,
        tamanho: structureData.tamanho,
        formatted: vectorString  
      };
    } else if (this.structure?.toUpperCase() === 'MATRIZ' && structureData) {
      const flattenedValues: any[] = [];
      
      if (Array.isArray(structureData.matriz)) {
        for (let i = 0; i < structureData.linhas; i++) {
          for (let j = 0; j < structureData.colunas; j++) {
            if (structureData.matriz[i] && structureData.matriz[i][j] !== undefined) {
              flattenedValues.push(structureData.matriz[i][j]);
            }
          }
        }
      }
      
      formattedAnswer = {
        type: 'MATRIZ',
        dimensions: `${structureData.linhas};${structureData.colunas}`,
        values: flattenedValues
      };
      
    } else {
      alert('Por favor, interaja com a estrutura de dados antes de submeter.');
      return;
    }

    const submissionData = {
      challengeId: String(this.challenge?.id),
      dataStructureType: this.structure || undefined,
      submittedAnswer: formattedAnswer
    };


    this.api.submitChallenge(submissionData).subscribe({
      next: (response: any) => {
        const points = response.pointsAwarded || 0;
        let message = response.message || 'Missão enviada!';
        
        if (response.earnedMedals && response.earnedMedals.length > 0) {
          message += `\n🏆 Medalhas conquistadas: ${response.earnedMedals.join(', ')}`;
        }
        
        if (response.unlockedStructures && response.unlockedStructures.length > 0) {
          message += `\n🔓 Novas estruturas desbloqueadas: ${response.unlockedStructures.join(', ')}`;
        }
        
        alert(message);
        this.router.navigate(['/desafios']);
      },
      error: (error: any) => {
        const errorMessage = error?.error?.message || 'Erro ao enviar a missão. Tente novamente.';
        alert(errorMessage);
      }
    });
  }

  cancelMission(): void {
    if (confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
      this.router.navigate(['/desafios']);
    }
  }
}
