import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalSearchComponent } from './modal-search.component';
import { ConstantsService } from '../../services/constants.service';
import { SearchService } from '../../services/search/search.service';
import { Router } from '@angular/router';
import { RouterStub } from '../../mocks/router.stub';
import { SearchServiceStub } from '../../mocks/search.service.stub';
import { LookupComponent } from '../lookup/lookup.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ThrobberComponent } from '../throbber/throbber.component';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';

describe('ModalSearchComponent', () => {
  let component: ModalSearchComponent;
  let fixture: ComponentFixture<ModalSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, PerfectScrollbarModule, HttpClientTestingModule],
      declarations: [
        ModalSearchComponent,
        LookupComponent,
        SearchBarComponent,
        ThrobberComponent,
        SafeHtmlPipe
      ],
      providers: [
        ConstantsService,
        { provide: SearchService, useClass: SearchServiceStub },
        { provide: Router, useClass: RouterStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
