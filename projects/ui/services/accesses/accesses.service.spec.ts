import { TestBed } from '@angular/core/testing';

import { AccessesService } from './accesses.service';

describe('AccessesService', () => {
  let service: AccessesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
