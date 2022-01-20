import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LightTab } from '@epgu/ui/models';
import { Translation } from '@epgu/ui/models/common-enums';
import { UserAssuranceLevel } from '@epgu/ui/models/user-type-params';

@Component({
  selector: 'lib-tabs-scrolling',
  templateUrl: './tabs-scrolling.component.html',
  styleUrls: ['./tabs-scrolling.component.scss']
})
export class TabsScrollingComponent implements OnInit, OnChanges {

  public activeTab: LightTab;
  public showTabs = false;
  public scrollConfig = {
    suppressScrollY: true,
    wheelPropagation: true
  };
  public Translation = Translation;

  @Input() public tabs: LightTab[];
  @Input() public initActiveTab: string; // id таба, который должен быть включен по умолчанию
  @Input() public styleView: 'underlined' = 'underlined';
  @Input() public backgroundColor: 'fff' | 'transparent' = 'fff';
  @Input() public translation: Translation | string = Translation.APP;
  @Input() public userAssuranceLevel?: UserAssuranceLevel;
  @Input() public tabsBoxWidth: '100%' | 'max-content' = 'max-content';

  @Output() public changeTab = new EventEmitter<LightTab>();

  constructor() { }

  public ngOnInit(): void {
    if (this.tabs && this.tabs.length) {
      if (this.userAssuranceLevel) {
        this.hideNotAccessTabs();
      }
      this.setActiveTab();
    }
  }

  private hideNotAccessTabs(): void {
    this.tabs.forEach((tab: LightTab) => {
      if (tab.access) {
        if (!tab.access.includes(this.userAssuranceLevel)) {
          tab.hidden = true;
        }
      }
    });
  }

  private setActiveTab(): void {
    const url = location.pathname.split('/');
    if (url[url.length - 1] !== this.tabs[0].id) {
      this.activeTab = this.tabs.find((tab: LightTab) => {
        return tab.id === url[url.length - 1];
      });
    } else {
      if (this.initActiveTab) {
        this.activeTab = this.tabs.find(item => item.id === this.initActiveTab);
      }
    }

    if (!this.activeTab) {
      this.activeTab = this.tabs[0];
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName of Object.keys(changes)) {
      if (propName === 'initActiveTab') {
        const tab = this.tabs.find(item => item.id === changes.initActiveTab.currentValue);
        if (tab) {
          this.onTabClick(null, tab);
        }
      }
    }
  }

  public onTabClick(event: Event, item: LightTab): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.activeTab = item;
    this.showTabs = false;
    this.changeTab.emit(this.activeTab);
  }
}

