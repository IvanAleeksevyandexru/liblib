import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { async, TestBed } from '@angular/core/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from './feeds.service';

describe('FeedsService', () => {

  let feedsService: FeedsService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, RouterTestingModule
      ],
      providers: [
        FeedsService,
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });

    feedsService = TestBed.inject(FeedsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(feedsService).toBeDefined();
  });
});
