import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThrobberHexagonComponent} from './throbber-hexagon.component';

describe('ThrobberHexagonComponent', () => {
  let component: ThrobberHexagonComponent;
  let fixture: ComponentFixture<ThrobberHexagonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrobberHexagonComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrobberHexagonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
