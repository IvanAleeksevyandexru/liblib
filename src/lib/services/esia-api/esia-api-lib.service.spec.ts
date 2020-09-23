import { TestBed } from '@angular/core/testing';

import { EsiaApiService } from './esia-api-lib.service';

describe('EsiaApiService', () => {
  let service: EsiaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsiaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
