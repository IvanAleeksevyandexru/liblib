import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThrobberComponent } from './throbber.component';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import {LoadService} from '../../services/load/load.service';

describe('ThrobberComponent', () => {
  let component: ThrobberComponent;
  let fixture: ComponentFixture<ThrobberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrobberComponent ],
      providers: [{ provide: LoadService, useClass: LoadServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrobberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
