import { TestBed } from '@angular/core/testing';

import { EstadoBlocosService } from './estado-blocos.service';

describe('EstadoBlocosService', () => {
  let service: EstadoBlocosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoBlocosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
