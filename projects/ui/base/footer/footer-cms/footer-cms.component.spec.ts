import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../../../services/load/load.service';
import { LoadServiceStub } from '../../../mocks/load.service.stub';
import { FooterCmsComponent } from './footer-cms.component';

describe('FooterCmsComponent', () => {
  let component: FooterCmsComponent;
  let fixture: ComponentFixture<FooterCmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ FooterCmsComponent ],
      providers: [{ provide: LoadService, useClass: LoadServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
