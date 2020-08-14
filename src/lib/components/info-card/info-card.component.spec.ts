import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';
import { InfoCardComponent } from './info-card.component';
import { ProfileService } from '../../services/profile/profile.service';
import { ConstantsService } from '../../services/constants.service';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../../mocks/translate.service.stub';
import { AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { LocationStrategy } from '@angular/common';
import { LocationStrategyStub } from '../../mocks/location-strategy.stub';

describe('InfoCardComponent', () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;
  let container: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterModule ],
      declarations: [ InfoCardComponent, AppTranslatePipe ],
      providers: [
        ProfileService,
        ConstantsService,
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: LocationStrategy, useClass: LocationStrategyStub },
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    component.data = {
      type: 'RF_PASSPORT'
    };
    container = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create card with RF passport title', () => {
    expect(container.querySelectorAll('.title')[0].innerHTML).toBe('Паспорт РФ');
  });
});
