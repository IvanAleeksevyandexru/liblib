import { TestBed } from '@angular/core/testing';

import { ConvertLangService } from './convert-lang.service';

describe('ConvertLangService', () => {
  let service: ConvertLangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertLangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
