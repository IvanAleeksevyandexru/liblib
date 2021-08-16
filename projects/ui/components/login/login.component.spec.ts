import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LimitNumberPipe } from '../../pipes/limit-number/limit-number.pipe';
import { RouterStub } from '../../mocks/router.stub';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { LocationStrategy } from '@angular/common';
import { LocationStrategyStub } from '../../mocks/location-strategy.stub';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { LoginComponent } from './login.component';
import { MockComponent } from '../../mocks/mock.component';

const USER_MOCK = require('../../mocks/user.mock.json');

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule
      ],
      declarations: [
        LoginComponent, LibTranslatePipe,
        MockComponent({ selector: 'lib-counter', inputs: ['counter'] })
      ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: LocationStrategy, useClass: LocationStrategyStub },
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login button when no user data', () => {
    const nativeElement = fixture.nativeElement;
    const loginLink = nativeElement.querySelector('a');

    expect(loginLink.innerHTML).toContain('Личный кабинет');
  });

  it('should show user data when passed', () => {
    component.user = USER_MOCK;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;
    const userData = nativeElement.querySelector('.user-data');

    expect(userData.innerHTML).toContain(component.user.lastName);
  });
});
