import { TestBed } from '@angular/core/testing';

import { FocusManager } from './focus.manager';

describe('FocusManager', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FocusManager = TestBed.inject(FocusManager);
    expect(service).toBeTruthy();
  });
});
