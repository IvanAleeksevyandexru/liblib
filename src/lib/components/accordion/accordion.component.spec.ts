import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { By } from '@angular/platform-browser';

import { AccordionComponent } from './accordion.component';
import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';

@Component({template: `
    <lib-accordion [closeOthers]="closeOthers">
      <lib-expansion-panel *ngFor="let i of [0, 1, 2, 3]" [title]="'title'">
        <p>Content {{i}}</p>
      </lib-expansion-panel>
    </lib-accordion>`})
class PanelsSetComponent {
  @ViewChild(AccordionComponent, {static: false}) public accordion: AccordionComponent;
  @ViewChildren(ExpansionPanelComponent) public panels: QueryList<ExpansionPanelComponent>;
  public closeOthers = false;
}

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;
  let componentWithPanelsSet: PanelsSetComponent;
  let fixtureWithPanelsSet: ComponentFixture<PanelsSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccordionComponent, ExpansionPanelComponent, PanelsSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    fixtureWithPanelsSet = TestBed.createComponent(PanelsSetComponent);
    componentWithPanelsSet = fixtureWithPanelsSet.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ensure only one item is expanded at a time with closeOthers=true', () => {
    componentWithPanelsSet.closeOthers = true;
    fixtureWithPanelsSet.detectChanges();
    const panels = fixtureWithPanelsSet.debugElement.queryAll(By.css('.panel-container'));
    const panelInstances = componentWithPanelsSet.panels.toArray();
    fixtureWithPanelsSet.detectChanges();

    panelInstances[0].opened = true;
    fixtureWithPanelsSet.detectChanges();
    expect(panels[0].nativeElement.classList).toContain('opened');
    expect(panels[1].nativeElement.classList).not.toContain('opened');

    const panel1Header = panels[1].nativeElement.querySelector('.panel-header');
    panel1Header.click();
    fixtureWithPanelsSet.detectChanges();
    expect(panels[0].nativeElement.classList).not.toContain('opened');
    expect(panels[1].nativeElement.classList).toContain('opened');
  });
});
