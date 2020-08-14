import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { MockComponent } from '../../mocks/mock.component';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { AuthService } from '../../services/auth/auth.service';
import { AuthServiceStub } from '../../mocks/auth.service.stub';
import { MenuService } from '../../services/menu/menu.service';
import { MenuServiceStub } from '../../mocks/menu.service.stub';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MenuComponent, LibTranslatePipe, AppTranslatePipe,
        MockComponent({ selector: 'lib-logo' }),
        MockComponent({ selector: 'lib-login', inputs: ['userCounter'] }),
        MockComponent({ selector: 'lib-tabs' }),
        MockComponent({ selector: 'lib-button', inputs: ['type', 'size', 'internalLink'] }),
        MockComponent({ selector: 'lib-user-menu', inputs: ['state']}),
        MockComponent({ selector: 'lib-counter', inputs: ['counter']})
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub },
        { provide: MenuService, useClass: MenuServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should has 3 links', () => {
    const links = debugElement.query(By.css('.links-wrapper')).nativeElement;

    expect(links.innerHTML).toContain('Услуги');
    expect(links.innerHTML).toContain('Оплата');
    expect(links.innerHTML).toContain('Поддержка');
  });

  it('should load categories on mouseenter', () => {
    debugElement
      .query(By.css('.category-link'))
      .triggerEventHandler('mouseenter', null);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.showCategories).toEqual(true);
      expect(component.categories.length).toEqual(17);
    });
  });

  it('should close categories on mouseleave', () => {
    debugElement
      .query(By.css('.category-link'))
      .triggerEventHandler('mouseleave', null);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.showCategories).toEqual(false);
    });
  });
});
