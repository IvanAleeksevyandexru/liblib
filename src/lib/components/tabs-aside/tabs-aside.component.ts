import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Tab } from '../../models/tabs';
import { Translation } from '../../models/common-enums';
import { CounterData } from '../../models/counter';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

@Component({
  selector: 'lib-tabs-aside',
  templateUrl: './tabs-aside.component.html',
  styleUrls: ['./tabs-aside.component.scss']
})
export class TabsAsideComponent implements OnInit {
  @Input() public tabs: Tab[];
  @Input() public translation: Translation | string = Translation.APP;
  @Output() public tabItem = new EventEmitter();

  public showTabs = false;
  public activeTab: Tab;
  public commonCounter: CounterData;
  public Translation = Translation;

  constructor(
    public router: Router,
    public yaMetricService: YaMetricService
  ) {}

  public ngOnInit() {
    if (this.tabs) {
      this.activeTab = this.tabs[0];
      this.selectActiveTab();
    }
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.selectActiveTab();
      }
    });
  }

  public selectActiveTab(): void {
    this.tabs.forEach((item: Tab) => {
      if (this.router.url.indexOf(item.url) > -1) {
        this.activeTab = item;
      }
      this.updateCommonCounter();
    });
  }

  public onClick() {
    this.showTabs = !this.showTabs;
  }

  public onTabClick(item: Tab) {
    this.yaMetricService.yaMetricAside(item.mnemonic);
    this.activeTab = item;
    this.showTabs = false;
    this.updateCommonCounter();
  }

  private updateCommonCounter() {
    const firstTabWithUnreadCounter = this.tabs.find(item => item.counter && item.counter.unread > 0);
    if (firstTabWithUnreadCounter && firstTabWithUnreadCounter.counter !== this.commonCounter) {
      this.commonCounter = firstTabWithUnreadCounter.counter;
    }
  }

}
