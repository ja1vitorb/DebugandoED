import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEncadeadaComponent } from './lista-encadeada.component';

describe('ListaEncadeadaComponent', () => {
  let component: ListaEncadeadaComponent;
  let fixture: ComponentFixture<ListaEncadeadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaEncadeadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEncadeadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
