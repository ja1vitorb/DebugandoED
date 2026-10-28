import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PonteiroComponent } from './ponteiro.component';

describe('PonteiroComponent', () => {
  let component: PonteiroComponent;
  let fixture: ComponentFixture<PonteiroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PonteiroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PonteiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
