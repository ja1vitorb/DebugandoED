import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListainsereOrdenadoComponent } from './listainsere-ordenado.component';

describe('ListainsereOrdenadoComponent', () => {
  let component: ListainsereOrdenadoComponent;
  let fixture: ComponentFixture<ListainsereOrdenadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListainsereOrdenadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListainsereOrdenadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
