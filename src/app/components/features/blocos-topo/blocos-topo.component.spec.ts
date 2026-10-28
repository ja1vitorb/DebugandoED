import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocosTopoComponent } from './blocos-topo.component';

describe('BlocosTopoComponent', () => {
  let component: BlocosTopoComponent;
  let fixture: ComponentFixture<BlocosTopoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocosTopoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlocosTopoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
