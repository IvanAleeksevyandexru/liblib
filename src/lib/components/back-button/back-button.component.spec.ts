import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from '../button/button.component';
import { LoaderComponent } from '../loader/loader.component';
import { BackButtonComponent } from './back-button.component';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConstantsService } from '../../services/constants/constants.service';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';

describe('BackButtonComponent', () => {
  let component: BackButtonComponent;
  let fixture: ComponentFixture<BackButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([]) ],
      providers: [
        ConstantsService,
        { provide: LoadService, useClass: LoadServiceStub }
      ],
      declarations: [ BackButtonComponent, ButtonComponent, LoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
