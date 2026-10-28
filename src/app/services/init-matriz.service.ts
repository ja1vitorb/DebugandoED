import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InitMatrizService {
  private source = new Subject<void>();
  init$ = this.source.asObservable();

  trigger(): void {
    this.source.next();
  }
}