import { TestBed } from '@angular/core/testing';

import { IpshService } from './ipsh.service';

describe('IpshService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpshService = TestBed.inject(IpshService);
    expect(service).toBeTruthy();
  });
});
