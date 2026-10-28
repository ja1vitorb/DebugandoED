import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDuplamenteEncadeadaComponent } from './lista-duplamente-encadeada.component';

describe('ListaDuplamenteEncadeadaComponent', () => {
  let component: ListaDuplamenteEncadeadaComponent;
  let fixture: ComponentFixture<ListaDuplamenteEncadeadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDuplamenteEncadeadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDuplamenteEncadeadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
