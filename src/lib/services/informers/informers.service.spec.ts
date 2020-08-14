import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

import { InformersService } from './informers.service';

describe('InformersService', () => {
  let service: InformersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    });

    service = TestBed.get(InformersService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
