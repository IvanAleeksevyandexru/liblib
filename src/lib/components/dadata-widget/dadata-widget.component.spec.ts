import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PlainInputComponent } from '../plain-input/plain-input.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { BaseMaskedInputComponent } from '../base-masked-input/base-masked-input.component';
import { ThrobberComponent } from '../throbber/throbber.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DadataWidgetComponent } from './dadata-widget.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { TranslateServiceStub, LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConstantsService } from '../../services/constants/constants.service';

describe('DadataWidgetComponent', () => {
  let component: DadataWidgetComponent;
  let fixture: ComponentFixture<DadataWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, PerfectScrollbarModule, HttpClientTestingModule ],
      declarations: [
        DadataWidgetComponent, PlainInputComponent, CheckboxComponent, SearchBarComponent, BaseMaskedInputComponent,
        AutocompleteComponent, ThrobberComponent, LibTranslatePipe, AppTranslatePipe, SafeHtmlPipe ],
      providers: [
        ConstantsService,
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DadataWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
