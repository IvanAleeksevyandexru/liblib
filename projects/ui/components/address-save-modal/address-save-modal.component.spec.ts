import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { RouterStub } from '../../mocks/router.stub';
import { LoaderComponent } from '../../base/loader/loader.component';
import { ButtonComponent } from '../../base/button/button.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub, TranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe, AppTranslatePipe } from '../../pipes/translate/translate.pipe';
import { AddressSaveModalComponent } from './address-save-modal.component';

describe('AddressSaveModalComponent', () => {
  let component: AddressSaveModalComponent;
  let fixture: ComponentFixture<AddressSaveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule ],
      declarations: [ AddressSaveModalComponent, ButtonComponent, LoaderComponent, LibTranslatePipe, AppTranslatePipe ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
