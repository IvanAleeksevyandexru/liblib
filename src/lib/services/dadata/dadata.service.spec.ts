import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { DadataService } from './dadata.service';
import { ConstantsService } from '../constants.service';

describe('DadataService', () => {

  let dadataService: DadataService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, FormsModule, ReactiveFormsModule
      ],
      providers: [
        DadataService,
        ConstantsService,
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });

    dadataService = TestBed.get(DadataService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(dadataService).toBeDefined();
  });

});
