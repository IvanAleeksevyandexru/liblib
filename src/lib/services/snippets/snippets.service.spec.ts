import { async, TestBed } from '@angular/core/testing';
import { SnippetsService } from './snippets.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from '../feeds/feeds.service';
import { FeedsServiceStub } from '../../mocks/feeds.service.stub';
import { SharedService } from '../shared/shared.service';

describe('SnippetsService', () => {

  let snippetsService: SnippetsService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        SnippetsService,
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: FeedsService, useClass: FeedsServiceStub },
        SharedService
      ]
    });
    snippetsService = TestBed.inject(SnippetsService);
  });

  it('should be created', () => {
    expect(snippetsService).toBeDefined();
  });
});
