import { TestBed } from '@angular/core/testing';

import { RedirectsService } from './redirects.service';

describe('RedirectsService', () => {
  let service: RedirectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedirectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
