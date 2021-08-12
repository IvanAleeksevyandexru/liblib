import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SnippetsComponent } from './snippets.component';
import { SnippetModel, FeedModel, FeedDataModel } from '../../models/feed';
import { ButtonComponent } from '../button/button.component';
import { LoaderComponent } from '../loader/loader.component';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedsServiceStub } from '../../mocks/feeds.service.stub';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { TimeToEventPipe } from '../../pipes/time-to-event/time-to-event.pipe';
import { LimitStringPipe } from '../../pipes/limit-string/limit-string.pipe';
import { RemoveTagsPipe } from '../../pipes/remove-tags/remove-tags.pipe';
import { DeclinePipe } from '../../pipes/decline/decline.pipe';

describe('SnippetsComponent', () => {
  let component: SnippetsComponent;
  let fixture: ComponentFixture<SnippetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule
      ],
      declarations: [
        SnippetsComponent, ButtonComponent, LoaderComponent, TimeToEventPipe, LimitStringPipe, RemoveTagsPipe, DeclinePipe
      ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: FeedsService, useClass: FeedsServiceStub },
        { provide: DeclinePipe, useClass: DeclinePipe }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetsComponent);
    component = fixture.componentInstance;
    component.snippet = {type: 'DRAFT'} as SnippetModel;
    component.feed = {data: {} as FeedDataModel} as FeedModel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
