import { TestBed } from '@angular/core/testing';

import { YaMapService } from './ya-map.service';

describe('YaMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YaMapService = TestBed.get(YaMapService);
    expect(service).toBeTruthy();
  });
});
