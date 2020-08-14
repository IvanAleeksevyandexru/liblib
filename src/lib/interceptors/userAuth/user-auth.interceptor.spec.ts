import { UserAuthInterceptor } from './user-auth.interceptor';
import {inject, TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth/auth.service';
import { AuthServiceStub } from '../../mocks/auth.service.stub';

describe('UserAuthInterceptor', () => {

  let authInterceptor: UserAuthInterceptor;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserAuthInterceptor,
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    });

    authInterceptor = TestBed.get(UserAuthInterceptor);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create an instance', () => {
    expect(authInterceptor).toBeDefined();
  });
});
