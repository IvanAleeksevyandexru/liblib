import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaptchaComponent } from './captcha.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { ConstantsService } from '../../services/constants.service';

describe('CaptchaComponent', () => {
  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ CaptchaComponent, LibTranslatePipe ],
      providers: [
        ConstantsService,
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
