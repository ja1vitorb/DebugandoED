import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VetorComponent } from './components/vetor/vetor.component';
import { HomeComponent } from './components/home/home.component';
import { MatrizComponent } from './components/matriz/matriz.component';
import { AvailableChallengesComponent } from './components/available-challenges/available-challenges.component';
import { ChallengesListComponent } from './components/challenges-list/challenges-list.component';
import { MissionViewComponent } from './components/mission-view/mission-view.component';
import { PonteiroComponent } from './components/features/ponteiro/ponteiro.component';
import { PilhaComponent } from './components/features/pilha/pilha.component';
import { FilasComponent } from './components/filas/filas.component';
import { FilaBasicaComponent } from './components/features/fila-basica/fila-basica.component';
import { FilaTrocaComponent } from './components/features/fila-troca/fila-troca.component';
import { FilaCircularComponent } from './components/features/fila-circular/fila-circular.component';
import { ListasComponent } from './components/listas/listas.component';
import { ListaEncadeadaComponent } from './components/lista-encadeada/lista-encadeada.component';
import { ListaDuplamenteEncadeadaComponent } from './components/lista-duplamente-encadeada/lista-duplamente-encadeada.component';
import { ListaInsereInicioComponent } from './components/features/listaEncadeada/lista-insere-inicio/lista-insere-inicio.component';
import { ListainsereFimComponent } from './components/features/listaEncadeada/listainsere-fim/listainsere-fim.component';
import { ListainsereOrdenadoComponent } from './components/features/listaEncadeada/listainsere-ordenado/listainsere-ordenado.component';
import { ListaTesteComponent } from './components/features/lista-teste/lista-teste.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { ConquistasComponent } from './components/conquistas/conquistas.component';
import { SavedStructuresComponent } from './components/saved-structures/saved-structures.component';
import { ListaDuplamenteInsereInicioComponent } from './components/features/listaDuplamenteEncadeada/lista-duplamente-insere-inicio/lista-duplamente-insere-inicio.component';
import { ListaDuplamenteInsereFimComponent } from './components/features/listaDuplamenteEncadeada/lista-duplamente-insere-fim/lista-duplamente-insere-fim.component';
import { ListaDuplamenteInsereOrdenadoComponent } from './components/features/listaDuplamenteEncadeada/lista-duplamente-insere-ordenado/lista-duplamente-insere-ordenado.component';
import { GrafosComponent } from './components/grafos/grafos.component';
export const routes: Routes = [
  { path: '', component: HomeComponent }, // ✅ Definir a Home como rota principal
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'vetor', component: VetorComponent },
  {path: 'matriz', component: MatrizComponent},
  { path: 'desafios', component: AvailableChallengesComponent },
  { path: 'desafios/:structure', component: ChallengesListComponent },
  { path: 'desafio/:structure/:id', component: MissionViewComponent },
  { path: 'desafio/:structure', component: MissionViewComponent },
  { path: 'ponteiro', component: PonteiroComponent},
  {path: 'pilha', component: PilhaComponent},
  {path: 'filas', component: FilasComponent},
  {path: 'filaBasica', component: FilaBasicaComponent},
  {path: 'filaTroca', component: FilaTrocaComponent},
  {path: 'filaCircular', component: FilaCircularComponent},
  {path: 'listas', component: ListasComponent},
  {path: 'listaEncadeada', component: ListaEncadeadaComponent},
  {path: 'listaDuplamenteEncadeada', component: ListaDuplamenteEncadeadaComponent},
  {path: 'listaEncadeadaInicio', component: ListaInsereInicioComponent},
  {path: 'listaEncadeadaFim', component: ListainsereFimComponent},
  {path: 'listaEncadeadaOrdenada', component: ListainsereOrdenadoComponent},
  {path: 'listaTeste', component: ListaTesteComponent},
  {path: 'listaDuplamenteInsereInicio', component: ListaDuplamenteInsereInicioComponent},
  {path: 'listaDuplamenteEncadeadaFim', component: ListaDuplamenteInsereFimComponent},
  {path: 'listaDuplamenteEncadeadaOrdenada', component: ListaDuplamenteInsereOrdenadoComponent},
  { path: 'grafos', component: GrafosComponent },
  { path: 'ranking', component: RankingComponent }, // ✅ Rota pública de ranking
  { path: 'conquistas', component: ConquistasComponent }, // ✅ Página de conquistas/medalhas
  { path: 'estruturas-salvas', component: SavedStructuresComponent }, // ✅ Estruturas salvas
  { path: 'professor/dashboard', component: TeacherDashboardComponent }, // ✅ Dashboard do professor
  { path: '**', redirectTo: '' },
   // Qualquer rota inválida vai para a Home
];

export const appRouting = provideRouter(routes); 