import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmActionComponent } from './confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../../mocks/translate.service.stub';
import { AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { MockComponent } from '../../mocks/mock.component';

describe('ConfirmActionComponent', () => {
  let component: ConfirmActionComponent;
  let fixture: ComponentFixture<ConfirmActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfirmActionComponent, AppTranslatePipe,
        MockComponent({ selector: 'lib-button', inputs: ['disabled', 'size', 'color'] })
      ],
      providers: [
       { provide: TranslateService, useClass: TranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
