import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { MockComponent } from '../../mocks/mock.component';
import { LocationComponent } from './location.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { CookieService } from '../../services/cookie/cookie.service';
import { CookieServiceStub } from '../../mocks/cookie.service.stub';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        LocationComponent, LibTranslatePipe, AppTranslatePipe,
        MockComponent({ selector: 'lib-radio', inputs: ['disabled', 'labelText', 'checked', 'errorMessage', 'ngModel'] }),
        MockComponent({ selector: 'lib-button', inputs: ['disabled', 'size'] }),
        MockComponent({ selector: 'lib-lookup', inputs: ['itemsProvider', 'queryMinSymbolsCount', 'ngModel'] })
      ],
      providers: [
        { provide: LibTranslateService, useClass: LibTranslateServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: CookieService, useClass: CookieServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
