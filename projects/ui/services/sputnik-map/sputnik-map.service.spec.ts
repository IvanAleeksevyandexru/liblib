import { TestBed } from '@angular/core/testing';

import { SputnikMapService } from './sputnik-map.service';

describe('SputnikMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SputnikMapService = TestBed.inject(SputnikMapService);
    expect(service).toBeTruthy();
  });
});
