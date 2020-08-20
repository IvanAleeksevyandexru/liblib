import { TestBed } from '@angular/core/testing';

import { PsoService } from './pso.service';

describe('PsoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PsoService = TestBed.inject(PsoService);
    expect(service).toBeTruthy();
  });
});
