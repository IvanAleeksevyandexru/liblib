import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpansionPanelComponent } from './expansion-panel.component';

describe('ExpansionPanelComponent', () => {
  let component: ExpansionPanelComponent;
  let fixture: ComponentFixture<ExpansionPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpansionPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand and collapse panel', () => {
    const panelContainer = fixture.nativeElement.querySelector('.panel-container');
    expect(panelContainer.classList).not.toContain('opened');
    component.opened = true;
    fixture.detectChanges();
    expect(panelContainer.classList).toContain('opened');
  });

  it('should toggle panel by click on header', () => {
    const panelContainer = fixture.nativeElement.querySelector('.panel-container');
    const panelHeader = fixture.nativeElement.querySelector('.panel-header');
    panelHeader.click();
    fixture.detectChanges();
    expect(panelContainer.classList).toContain('opened');
  });

  it('should emit change event by click on header', () => {
    const callbackListener = spyOn(component, 'onClick').and.callThrough();
    const panelHeader = fixture.nativeElement.querySelector('.panel-header');

    panelHeader.click();
    fixture.detectChanges();
    expect(callbackListener).toHaveBeenCalled();

    panelHeader.click();
    fixture.detectChanges();
    expect(callbackListener).toHaveBeenCalled();
  });
});
