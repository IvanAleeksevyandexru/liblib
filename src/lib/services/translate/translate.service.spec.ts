import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LibTranslateService } from './translate.service';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('TranslateService', () => {

  let translateService: LibTranslateService;
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

    translateService = TestBed.get(LibTranslateService);
    httpMock = TestBed.get(HttpTestingController);
  });



  it('TranslateService should create', () => {
    expect(translateService).toBeTruthy();
  });
});
