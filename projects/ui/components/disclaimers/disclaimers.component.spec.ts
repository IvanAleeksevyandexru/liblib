import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerComponent } from './disclaimers.component';
import { ThrobberComponent } from '../throbber/throbber.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DisclaimerService } from '../../services/disclaimers/disclaimers.service';
import { CookieService } from '../../services/cookie/cookie.service';
import { CookieServiceStub } from '../../mocks/cookie.service.stub';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from '../../mocks/mock.component';

describe('DisclaimerComponent', () => {
  let component: DisclaimerComponent;
  let fixture: ComponentFixture<DisclaimerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DisclaimerComponent,
        ThrobberComponent,
        MockComponent({selector: 'lib-plain-input',
          inputs: ['clearable', 'name', 'readOnly', 'contextClass', 'maxlength', 'formControlName']}),
        MockComponent({ selector: 'lib-button', inputs: ['type', 'size', 'disabled'] }),
        LibTranslatePipe
      ],
      providers: [
        DisclaimerService,
        {provide: CookieService, useClass: CookieServiceStub},
        {provide: LoadService, useClass: LoadServiceStub},
        {provide: LibTranslateService, useClass: LibTranslateServiceStub},
      ],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
    })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
