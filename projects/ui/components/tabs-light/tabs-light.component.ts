import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LightTab } from '@epgu/ui/models';
import { Translation } from '@epgu/ui/models/common-enums';

@Component({
  selector: 'lib-tabs-light',
  templateUrl: './tabs-light.component.html',
  styleUrls: ['./tabs-light.component.scss']
})
export class TabsLightComponent implements OnInit, OnChanges {

  public activeTab: LightTab;
  public showTabs = false;

  @Input() public tabs: LightTab[];
  @Input() public initActiveTab: string; // id таба, который должен быть включен по умолчанию
  @Input() public styleView: 'link' | 'button' = 'link';
  @Input() public wrapRow = false; // допустимо ли расположение табов в несколько строк
  @Input() public transformSize: 'md' | 'sm' = 'sm'; // размер, при котором произойдет переход от табов к выпадающему списку
  @Input() public tabsAlign: 'center' | 'left' | 'full' = 'left'; // выравние табов: center - по центру, left - слева, full - на всю ширину
  @Input() public dropdownWidth: 'fit' | 'full' = 'fit'; // fit - выпадающий список по размеру контента, full - во всю ширину блока
  @Input() public dropdownAlign: 'center' | 'left' = 'left'; // выравнивание выпадающего списка
  @Input() public translation: Translation | string = Translation.APP;

  @Output() public changeTab = new EventEmitter<LightTab>();

  constructor() {
  }

  public Translation = Translation;

  public ngOnInit() {
    if (this.tabs && this.tabs.length) {
      if (this.initActiveTab) {
        this.activeTab = this.tabs.find(item => item.id === this.initActiveTab);
      }
      if (!this.activeTab) {
        this.activeTab = this.tabs[0];
      }
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      if (propName === 'initActiveTab') {
        const tab = this.tabs.find(item => item.id === changes.initActiveTab.currentValue);
        if (tab) {
          this.onTabClick(null, tab);
        }
      }
    }
  }

  public toggleTabsList(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.showTabs = !this.showTabs;
  }

  public onTabClick(event: Event, item: LightTab) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.activeTab = item;
    this.showTabs = false;
    this.changeTab.emit(this.activeTab);
  }
}
