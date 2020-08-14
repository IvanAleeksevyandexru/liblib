import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {

  let catalogService: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });

    catalogService = TestBed.get(CatalogService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(catalogService).toBeDefined();
  });
});
