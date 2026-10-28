import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDuplamenteInsereFimComponent } from './lista-duplamente-insere-fim.component';

describe('ListaDuplamenteInsereFimComponent', () => {
  let component: ListaDuplamenteInsereFimComponent;
  let fixture: ComponentFixture<ListaDuplamenteInsereFimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDuplamenteInsereFimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDuplamenteInsereFimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
