import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilaBasicaComponent } from './fila-basica.component';

describe('FilaBasicaComponent', () => {
  let component: FilaBasicaComponent;
  let fixture: ComponentFixture<FilaBasicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilaBasicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilaBasicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
