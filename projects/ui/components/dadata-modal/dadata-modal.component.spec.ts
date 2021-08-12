import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DadataModalComponent } from './dadata-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';
import { ButtonComponent } from '../button/button.component';
import { LoaderComponent } from '../loader/loader.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivatedRouteStub } from '../../mocks/activated-route.stub';
import { RouterStub } from '../../mocks/router.stub';

describe('DadataModalComponent', () => {
  let component: DadataModalComponent;
  let fixture: ComponentFixture<DadataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule ],
      declarations: [ DadataModalComponent, ButtonComponent, LoaderComponent, LibTranslatePipe ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: LibTranslateService, useClass: LibTranslateServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DadataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
