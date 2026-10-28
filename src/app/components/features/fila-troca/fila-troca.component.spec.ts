import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilaTrocaComponent } from './fila-troca.component';

describe('FilaTrocaComponent', () => {
  let component: FilaTrocaComponent;
  let fixture: ComponentFixture<FilaTrocaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilaTrocaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilaTrocaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
