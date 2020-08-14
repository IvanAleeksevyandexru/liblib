import { TestBed } from '@angular/core/testing';

import { TabsService } from './tabs.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConstantsService } from '../constants.service';

describe('TabsService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ConstantsService
      ]
    });
  });

  it('should be created', () => {
    const service: TabsService = TestBed.get(TabsService);
    expect(service).toBeTruthy();
  });
});
