import { TestBed } from '@angular/core/testing';

import { ContainerOverlapManager } from './container-overlap.manager';

describe('ContainerOverlapManager', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContainerOverlapManager = TestBed.get(ContainerOverlapManager);
    expect(service).toBeTruthy();
  });
});
