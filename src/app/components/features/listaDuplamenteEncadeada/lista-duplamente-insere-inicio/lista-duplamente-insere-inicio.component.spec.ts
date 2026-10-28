import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDuplamenteInsereInicioComponent } from './lista-duplamente-insere-inicio.component';

describe('ListaDuplamenteInsereInicioComponent', () => {
  let component: ListaDuplamenteInsereInicioComponent;
  let fixture: ComponentFixture<ListaDuplamenteInsereInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDuplamenteInsereInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDuplamenteInsereInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
