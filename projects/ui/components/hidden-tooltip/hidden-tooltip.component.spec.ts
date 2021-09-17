import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HiddenTooltipComponent } from './hidden-tooltip.component';

describe('HiddenTooltipComponent', () => {
  let component: HiddenTooltipComponent;
  let fixture: ComponentFixture<HiddenTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HiddenTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiddenTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should has hidden class by default', () => {
    const container = fixture.nativeElement.querySelector('.content') as HTMLElement;
    expect(container.classList.contains('hidden-content')).toBeTruthy();
  });

  it ('should has no hidden class on title click', () => {
    const caption = fixture.nativeElement.querySelector('.caption') as HTMLElement;
    const container = fixture.nativeElement.querySelector('.content') as HTMLElement;

    caption.click();
    fixture.detectChanges();
    expect(container.classList.contains('hidden-content')).toBeFalsy();
  });
});
