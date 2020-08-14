import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tab } from '../../models/tabs';
import { Translation } from '../../models/common-enums';
import { TabsService } from '../../services/tabs/tabs.service';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  @Input() public translation: Translation | string = Translation.APP;
  @Output() public tabItem = new EventEmitter();

  constructor(public tabsService: TabsService,
              public router: Router) { }

  public Translation = Translation;

  public onTabClick(item: Tab) {
    return this.router.navigate([item.url]);
  }
}
