import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { LocationStrategy } from '@angular/common';
import { LocationStrategyStub } from '../../mocks/location-strategy.stub';
import { By } from '@angular/platform-browser';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { Translation } from '../../models/common-enums';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let service: BreadcrumbsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule ],
      declarations: [ BreadcrumbsComponent, LibTranslatePipe, AppTranslatePipe ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: LocationStrategy, useClass: LocationStrategyStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub },
        BreadcrumbsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    component.translation = Translation.NONE;
    service = TestBed.get(BreadcrumbsService);
    service.setLinks([{
      url: '/',
      name: 'Главная'
    }, {
      url: '/category',
      name: 'Услуги'
    }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have titles from service data', () => {
    const element = fixture.debugElement.query(By.css('.items')).nativeElement;

    component.links$.subscribe(links => {
      for (const link of links) {
        expect(element.innerHTML).toContain(link.name);
      }
    });
  });
});
