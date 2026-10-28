import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListainsereFimComponent } from './listainsere-fim.component';

describe('ListainsereFimComponent', () => {
  let component: ListainsereFimComponent;
  let fixture: ComponentFixture<ListainsereFimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListainsereFimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListainsereFimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
