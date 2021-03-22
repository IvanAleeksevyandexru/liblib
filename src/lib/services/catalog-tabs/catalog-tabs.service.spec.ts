import { TestBed } from '@angular/core/testing';

import { CatalogTabsService } from './catalog-tabs.service';

describe('CatalogTabsService', () => {
  let service: CatalogTabsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogTabsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
