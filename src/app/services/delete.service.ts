import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeleteService {
  private delSource = new Subject<{ linha: number; coluna: number }>();
  del$ = this.delSource.asObservable();

  sendDelete(payload: { linha: number; coluna: number }) {
    this.delSource.next(payload);
  }
}