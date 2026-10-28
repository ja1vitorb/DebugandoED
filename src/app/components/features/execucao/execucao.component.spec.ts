import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecucaoComponent } from './execucao.component';

describe('ExecucaoComponent', () => {
  let component: ExecucaoComponent;
  let fixture: ComponentFixture<ExecucaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecucaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecucaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
