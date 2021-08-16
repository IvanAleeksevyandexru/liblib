import { Component, ContentChildren, Input, OnInit, QueryList, AfterContentInit, OnDestroy } from '@angular/core';
import { ExpansionPanelComponent } from '../expansion-panel';

@Component({
  selector: 'lib-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit, AfterContentInit, OnDestroy {

  @ContentChildren(ExpansionPanelComponent) public panels: QueryList<ExpansionPanelComponent>;
  @Input() public closeOthers = false; // Если true, то при открытии группы, остальные будут закрываться
  @Input() public openAll = false; // Открывать ли все группы изначально

  constructor() { }

  public ngOnInit() {
  }

  public ngAfterContentInit() {
    if (!this.panels) {
      return;
    }
    this.panels.forEach((group) => {
      group.toggle.subscribe(() => {
        this.checkGroupsState(group);
      });
      if (this.openAll) {
        this.closeOthers = false;
        group.opened = true;
      }
    });
  }

  public checkGroupsState(group) {
    if (this.closeOthers) {
      this.panels.forEach((item) => {
        if (item !== group) {
          item.opened = false;
        }
      });
    }
  }

  public ngOnDestroy() {
    this.panels.forEach((group) => {
      group.toggle.unsubscribe();
    });
  }
}
