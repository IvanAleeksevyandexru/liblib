import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EqueueComponent } from './equeue.component';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedsServiceStub } from '../../mocks/feeds.service.stub';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';

describe('EqueueComponent', () => {
  let component: EqueueComponent;
  let fixture: ComponentFixture<EqueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterModule ],
      declarations: [ EqueueComponent ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: FeedsService, useClass: FeedsServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EqueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
