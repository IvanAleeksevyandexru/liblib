import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { TabsAsideComponent } from './tabs-aside.component';
import { CounterComponent } from '../counter/counter.component';
import { LimitNumberPipe } from '../../pipes/limit-number/limit-number.pipe';

describe('TabsAsideComponent', () => {
  let component: TabsAsideComponent;
  let fixture: ComponentFixture<TabsAsideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ TabsAsideComponent, CounterComponent, LimitNumberPipe, LibTranslatePipe, AppTranslatePipe ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsAsideComponent);
    component = fixture.componentInstance;
    component.activeTab = { name: 'test' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
