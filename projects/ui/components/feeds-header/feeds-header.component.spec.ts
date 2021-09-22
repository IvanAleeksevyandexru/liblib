import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../../mocks/translate.service.stub';
import { FeedsHeaderComponent } from './feeds-header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('FeedsHeaderComponent', () => {
  let component: FeedsHeaderComponent;
  let fixture: ComponentFixture<FeedsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ FeedsHeaderComponent ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LoadService, useClass: LoadServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
