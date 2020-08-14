import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockComponent } from '../../mocks/mock.component';
import { FeedIconComponent } from '../feed-icon/feed-icon.component';
import { ThrobberComponent } from '../throbber/throbber.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateServiceStub, LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { FeedsComponent } from './feeds.component';
import { RemoveTagsPipe } from '../../pipes/remove-tags/remove-tags.pipe';
import { RemoveQuotesPipe } from '../../pipes/remove-quotes/remove-quotes.pipe';
import { HighlightPipe } from '../../pipes/highlight/highlight.pipe';
import { TimeLeftPipe } from '../../pipes/time-left/time-left.pipe';
import { TimeToEventPipe } from '../../pipes/time-to-event/time-to-event.pipe';
import { ToMoneyPipe } from '../../pipes/to-money/to-money.pipe';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedsServiceStub } from '../../mocks/feeds.service.stub';
import { ButtonComponent } from '../../components/button/button.component';
import { LoaderComponent } from '../../components/loader/loader.component';

describe('FeedsComponent', () => {
  let component: FeedsComponent;
  let fixture: ComponentFixture<FeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, RouterTestingModule
      ],
      declarations: [
        FeedsComponent, FeedIconComponent, ThrobberComponent, LoaderComponent, ButtonComponent,
        RemoveTagsPipe, RemoveQuotesPipe, TimeLeftPipe, TimeToEventPipe, ToMoneyPipe, HighlightPipe, LibTranslatePipe,
        MockComponent({ selector: 'lib-snippets', inputs: ['snippet', 'feed'] })
      ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: FeedsService, useClass: FeedsServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
