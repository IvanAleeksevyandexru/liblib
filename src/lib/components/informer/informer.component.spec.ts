import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformerComponent } from './informer.component';
import { ToMoneyPipe } from '../../pipes/to-money/to-money.pipe';
import { DeclinePipe } from '../../pipes/decline/decline.pipe';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';

import { MockComponent } from '../../mocks/mock.component';

describe('InformerMainComponent', () => {
  let component: InformerComponent;
  let fixture: ComponentFixture<InformerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [
        InformerComponent,
        MockComponent({selector: 'lib-button', inputs: ['color', 'size', 'width']}),
        MockComponent({selector: 'lib-throbber-hexagon', inputs: ['size']}),
        ToMoneyPipe,
        DeclinePipe,
        LibTranslatePipe],
      providers: [
        {provide: LibTranslateService, useClass: LibTranslateServiceStub},
        {provide: LoadService, useClass: LoadServiceStub},
        {provide: DeclinePipe, useClass: DeclinePipe},
        {provide: Router, useClass: RouterStub},
        YaMetricService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
