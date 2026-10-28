import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChallengesApiService } from '../../services/challenges-api.service';

@Component({
	selector: 'app-challenges-list',
	templateUrl: './challenges-list.component.html',
	styleUrl: './challenges-list.component.scss',
	imports: [RouterModule, CommonModule, TranslateModule]
})
export class ChallengesListComponent implements OnInit {
	structureName: string | null = null;
	challenges: any[] = [];

		constructor(private route: ActivatedRoute, private api: ChallengesApiService, private router: Router) {}

	ngOnInit(): void {
		this.structureName = this.route.snapshot.paramMap.get('structure');
		if (this.structureName) {
			this.api.getChallenges(this.structureName).subscribe({
				next: (list: any[]) => {
					this.challenges = list;
					console.log('Desafios listados com sucesso:', list);
				},
				error: (err: any) => console.error('Erro ao listar desafios:', err)
			});
		}
	}

	openMission(c: any) {
		const structure = this.structureName || 'UNKNOWN';
		this.router.navigate(['/desafio', structure, c.id], { state: { challenge: c } });
	}
}

