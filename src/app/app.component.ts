import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MenuComponent } from './components/menu/menu.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ standalone
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule, 
    MenuComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'debugandoed';

  exibirAviso = false;
  private resizeHandler = () => this.verificarTamanhoTela();

  private rotasSemMenu = ['/login', '/register'];

  constructor(private router: Router, private translate: TranslateService) {
    translate.addLangs(['en', 'pt']);

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang && ['en', 'pt'].includes(browserLang) ? browserLang : 'pt');
  }

  ngOnInit(): void {
    this.verificarTamanhoTela();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  verificarTamanhoTela(): void {
    this.exibirAviso = window.innerWidth < 800;
  }

  switchLang(lang: 'pt' | 'en'): void {
    this.translate.use(lang);
  }

  // Verifica se a rota atual está na lista de rotas sem menu
  get mostrarMenu(): boolean {
    return !this.rotasSemMenu.includes(this.router.url);
  }
}
