import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  confirmEmail = '';
  password = '';
  confirm = '';
  birthDate = '';
  educationLevel = '';
  institution = '';
  // state = '';
  // city = '';
  role: 'STUDENT' | 'TEACHER' = 'STUDENT';
  selectedAvatar = '/assets/images/avatar/vecteezy_man-avatar-vector_23402465.jpg';
  loading = false;
  error: string | null = null;

  avatars = [
    { id: 1, url: '/assets/images/avatar/avatar1.png', name: 'Avatar 1' },
    { id: 2, url: '/assets/images/avatar/avatar2.png', name: 'Avatar 2' },
    { id: 3, url: '/assets/images/avatar/avatar3.png', name: 'Avatar 3' },
    { id: 4, url: '/assets/images/avatar/avatar4.png', name: 'Avatar 4' },
    { id: 5, url: '/assets/images/avatar/avatar5.png', name: 'Avatar 5' },
    { id: 6, url: '/assets/images/avatar/avatar6.png', name: 'Avatar 6' }
  ];

  institutions = [
    'Universidade Federal de Uberlândia - (UFU)',
    'Universidade de Brasília - (UnB)',
    'Universidade Federal da Bahia - (UFBA)',
    'Universidade Federal da Fronteira Sul - (UFFS)',
    'Universidade Federal da Grande Dourados - (UFGD)',
    'Universidade Federal da Integração Latino-Americana - (UNILA)',
    'Universidade Federal da Lusofonia Afro-Brasileira - (UNILAB)',
    'Universidade Federal da Paraíba - (UFPB)',
    'Universidade Federal de Alagoas - (UFAL)',
    'Universidade Federal de Alfenas - (UNIFAL-MG)',
    'Universidade Federal de Campina Grande - (UFCG)',
    'Universidade Federal de Catalão - (UFCat)',
    'Universidade Federal de Ciências da Saúde de Porto Alegre - (UFCSPA)',
    'Universidade Federal de Goiás - (UFG)',
    'Universidade Federal de Itajubá - (UNIFEI)',
    'Universidade Federal de Jataí - (UFJ)',
    'Universidade Federal de Juiz de Fora - (UFJF)',
    'Universidade Federal de Lavras - (UFLA)',
    'Universidade Federal de Mato Grosso - (UFMT)',
    'Universidade Federal de Mato Grosso do Sul - (UFMS)',
    'Universidade Federal de Minas Gerais - (UFMG)',
    'Universidade Federal de Ouro Preto - (UFOP)',
    'Universidade Federal de Pelotas - (UFPel)',
    'Universidade Federal de Pernambuco - (UFPE)',
    'Universidade Federal de Rondônia - (UNIR)',
    'Universidade Federal de Rondonópolis - (UFR)',
    'Universidade Federal de Roraima - (UFRR)',
    'Universidade Federal de Santa Catarina - (UFSC)',
    'Universidade Federal de Santa Maria - (UFSM)',
    'Universidade Federal de São Carlos - (UFSCar)',
    'Universidade Federal de São João del-Rei - (UFSJ)',
    'Universidade Federal de São Paulo - (UNIFESP)',
    'Universidade Federal de Sergipe - (UFS)',
    'Universidade Federal de Uberlândia - (UFU)',
    'Universidade Federal de Viçosa - (UFV)',
    'Universidade Federal do ABC - (UFABC)',
    'Universidade Federal do Acre - (UFAC)',
    'Universidade Federal do Agreste de Pernambuco - (UFAPE)',
    'Universidade Federal do Amapá - (UNIFAP)',
    'Universidade Federal do Amazonas - (UFAM)',
    'Universidade Federal do Cariri - (UFCA)',
    'Universidade Federal do Ceará - (UFC)',
    'Universidade Federal do Delta do Parnaíba - (UFDPar)',
    'Universidade Federal do Espírito Santo - (UFES)',
    'Universidade Federal do Estado do Rio de Janeiro - (UNIRIO)',
    'Universidade Federal do Maranhão - (UFMA)',
    'Universidade Federal do Norte de Tocantins - (UFNT)',
    'Universidade Federal do Oeste da Bahia - (UFOB)',
    'Universidade Federal do Oeste do Pará - (UFOPA)',
    'Universidade Federal do Pampa - (UNIPAMPA)',
    'Universidade Federal do Pará - (UFPA)',
    'Universidade Federal do Paraná - (UFPR)',
    'Universidade Federal do Piauí - (UFPI)',
    'Universidade Federal do Recôncavo da Bahia - (UFRB)',
    'Universidade Federal do Rio de Janeiro - (UFRJ)',
    'Universidade Federal do Rio Grande - (FURG)',
    'Universidade Federal do Rio Grande do Norte - (UFRN)',
    'Universidade Federal do Rio Grande do Sul - (UFRGS)',
    'Universidade Federal do Sul da Bahia - (UFSB)',
    'Universidade Federal do Sul e Sudeste do Pará - (UNIFESSPA)',
    'Universidade Federal do Tocantins - (UFT)',
    'Universidade Federal do Triângulo Mineiro - (UFTM)',
    'Universidade Federal do Vale do São Francisco - (UNIVASF)',
    'Universidade Federal dos Vales do Jequitinhonha e Mucuri - (UFVJM)',
    'Universidade Federal Fluminense - (UFF)',
    'Universidade Federal Rural da Amazônia - (UFRA)',
    'Universidade Federal Rural de Pernambuco - (UFRPE)',
    'Universidade Federal Rural do Rio de Janeiro - (UFRRJ)',
    'Universidade Federal Rural do Semi-Árido - (UFERSA)',
    'Universidade Tecnológica Federal do Paraná - (UTFPR)',
    'NENHUMA',
    'OUTRA'
  ];

  educationLevels = [
    'Aluno de Graduação',
    'Aluno de Ensino Médio',
    'Aluno de Graduação',
    'Aluno de Pós-Graduação',
    'Professor(a)',
    'Outro'
  ];

  customInstitution = '';

  constructor(private auth: AuthService, private router: Router) {}

  selectAvatar(avatarUrl: string) {
    this.selectedAvatar = avatarUrl;
  }

  submit() {
    if (this.email !== this.confirmEmail) {
      this.error = 'Email e confirmação não coincidem';
      return;
    }

    if (this.password !== this.confirm) {
      this.error = 'Senha e confirmação não coincidem';
      return;
    }

    this.loading = true;
    this.error = null;
    
    const finalInstitution = this.institution === 'OUTRA' ? this.customInstitution : this.institution;
    
    const payload: any = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      avatarUrl: this.selectedAvatar
    };

    if (this.birthDate) payload.birthDate = this.birthDate;
    if (this.educationLevel) payload.educationLevel = this.educationLevel;
    if (finalInstitution) payload.institution = finalInstitution;
    // if (this.state) payload.state = this.state;
    // if (this.city) payload.city = this.city;
    
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Erro ao registrar usuário';
      }
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
