import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InsertService {
  private insertSource = new Subject<string>();
  insert$ = this.insertSource.asObservable();

  sendInsert(value: string) {
    this.insertSource.next(value);
  }
}