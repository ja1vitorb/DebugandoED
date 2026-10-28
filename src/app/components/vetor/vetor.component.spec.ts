import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetorComponent } from './vetor.component';

describe('VetorComponent', () => {
  let component: VetorComponent;
  let fixture: ComponentFixture<VetorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
