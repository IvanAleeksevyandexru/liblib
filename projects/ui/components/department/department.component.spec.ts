import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DepartmentComponent } from './department.component';
import { ConstantsService } from '../../services/constants/constants.service';
import { LibTranslateService } from '../../services/translate/translate.service';
import { LibTranslateServiceStub } from '../../mocks/translate.service.stub';
import { LibTranslatePipe } from '../../pipes/translate/translate.pipe';

describe('DepartmentComponent', () => {
  let component: DepartmentComponent;
  let fixture: ComponentFixture<DepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [{ provide: LibTranslateService, useClass: LibTranslateServiceStub }, ConstantsService],
      declarations: [ DepartmentComponent, LibTranslatePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentComponent);
    component = fixture.componentInstance;
    component.orgName = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show orgName', () => {
    const container = fixture.nativeElement.querySelector('.department-title .text-plain') as HTMLElement;
    expect(container.innerText).toBe('test');

  });
});
