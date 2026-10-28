import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilasComponent } from './filas.component';

describe('FilasComponent', () => {
  let component: FilasComponent;
  let fixture: ComponentFixture<FilasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
