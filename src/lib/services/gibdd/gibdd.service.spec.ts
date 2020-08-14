import { TestBed } from '@angular/core/testing';

import { GibddService } from './gibdd.service';

describe('GibddService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GibddService = TestBed.get(GibddService);
    expect(service).toBeTruthy();
  });
});
