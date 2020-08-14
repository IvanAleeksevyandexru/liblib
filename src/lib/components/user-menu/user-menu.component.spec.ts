import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CounterComponent } from '../counter/counter.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { MenuService } from '../../services/menu/menu.service';
import { MenuServiceStub } from '../../mocks/menu.service.stub';
import { AuthService } from '../../services/auth/auth.service';
import { AuthServiceStub } from '../../mocks/auth.service.stub';
import { UserMenuComponent } from './user-menu.component';
import { MockComponent } from '../../mocks/mock.component';
import { UserMenuState } from '../../models/user-menu';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LimitNumberPipe } from '../../pipes/limit-number/limit-number.pipe';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PerfectScrollbarModule, RouterTestingModule.withRoutes([])],
      declarations: [
        UserMenuComponent, CounterComponent, LibTranslatePipe, AppTranslatePipe, LimitNumberPipe,
        MockComponent({ selector: 'lib-tabs' })
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
    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    component.state = {active: true, isMobileView: false} as UserMenuState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should has some links on desk', () => {
    const links: DebugElement[] = debugElement.queryAll(By.css('.menu-desk .user-menu-links li'));

    expect(links.length).toEqual(6);
    expect(links[0].nativeNode.innerText).toContain('Услуги');
  });

});
