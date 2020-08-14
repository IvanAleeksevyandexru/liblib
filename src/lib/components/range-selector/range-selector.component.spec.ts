import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RangeSelectorComponent } from './range-selector.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { StandardMaskedInputComponent } from '../standard-masked-input/standard-masked-input.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SimpleSelectComponent } from '../simple-select/simple-select.component';
import { QuestionHelpTipComponent } from '../question-help-tip/question-help-tip.component';
import { InvalidResultsTipComponent } from '../invalid-results-tip/invalid-results-tip.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateServiceStub, LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { PipedMessagePipe } from '../../pipes/piped-message/piped-message.pipe';

describe('RangeSelectorComponent', () => {
  let component: RangeSelectorComponent;
  let fixture: ComponentFixture<RangeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule, NoopAnimationsModule ],
      declarations: [ RangeSelectorComponent, DatePickerComponent,
        DropdownComponent, SimpleSelectComponent, StandardMaskedInputComponent, PipedMessagePipe,
        QuestionHelpTipComponent, InvalidResultsTipComponent, LibTranslatePipe, AppTranslatePipe ],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
