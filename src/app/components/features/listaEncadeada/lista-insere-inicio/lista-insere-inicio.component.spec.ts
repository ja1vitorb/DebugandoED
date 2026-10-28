import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaInsereInicioComponent } from './lista-insere-inicio.component';

describe('ListaInsereInicioComponent', () => {
  let component: ListaInsereInicioComponent;
  let fixture: ComponentFixture<ListaInsereInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaInsereInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaInsereInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
