import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {GosbarComponent} from './gosbar.component';
import {LoadService} from '../../services/load/load.service';
import {LoadServiceStub} from '../../mocks/load.service.stub';
import {LoadAsyncStaticService} from '../../services/load-async-static/load-async-static.service';
import {GosbarService} from '../../services/gosbar/gosbar.service';

describe('GosbarComponent', () => {
  let component: GosbarComponent;
  let fixture: ComponentFixture<GosbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GosbarComponent ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub },
        { provide: LoadAsyncStaticService, useClass: LoadAsyncStaticService},
        { provide: GosbarService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GosbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
