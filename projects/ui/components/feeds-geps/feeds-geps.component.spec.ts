import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedsGepsComponent } from './feeds-geps.component';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { AuthService } from '../../services/auth/auth.service';
import { AuthServiceStub } from '../../mocks/auth.service.stub';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedsServiceStub } from '../../mocks/feeds.service.stub';
import { ThrobberComponent } from '../../base/throbber/throbber.component';
import { CheckboxComponent } from '../../controls/checkbox/checkbox.component';
import { StaticBannerComponent } from '../banner-static/banner-static.component';
import { TimeToEventPipe } from '../../pipes/time-to-event/time-to-event.pipe';
import { TimeToEventGepsPipe } from '../../pipes/time-to-event-geps/time-to-event-geps.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';
import { HighlightPipe } from '../../pipes/highlight/highlight.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { RouterStub } from '../../mocks/router.stub';

describe('FeedsGepsComponent', () => {
  let component: FeedsGepsComponent;
  let fixture: ComponentFixture<FeedsGepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule, HttpClientTestingModule ],
      declarations: [
        FeedsGepsComponent, ThrobberComponent, CheckboxComponent, StaticBannerComponent,
        TimeToEventPipe, TimeToEventGepsPipe, HighlightPipe, SafeHtmlPipe, LibTranslatePipe
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: FeedsService, useClass: FeedsServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsGepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
