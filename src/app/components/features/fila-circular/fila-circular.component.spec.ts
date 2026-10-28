import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilaCircularComponent } from './fila-circular.component';

describe('FilaCircularComponent', () => {
  let component: FilaCircularComponent;
  let fixture: ComponentFixture<FilaCircularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilaCircularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilaCircularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
