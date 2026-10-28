import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDuplamenteInsereOrdenadoComponent } from './lista-duplamente-insere-ordenado.component';

describe('ListaDuplamenteInsereOrdenadoComponent', () => {
  let component: ListaDuplamenteInsereOrdenadoComponent;
  let fixture: ComponentFixture<ListaDuplamenteInsereOrdenadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDuplamenteInsereOrdenadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDuplamenteInsereOrdenadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
