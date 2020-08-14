import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { BannersService } from './banners.service';
import { CookieService } from '../cookie/cookie.service';
import { CookieServiceStub } from '../../mocks/cookie.service.stub';

describe('BannersService', () => {

  let bannersService: BannersService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        BannersService,
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: CookieService, useClass: CookieServiceStub }
      ]
    });

    bannersService = TestBed.get(BannersService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(bannersService).toBeDefined();
  });
});

