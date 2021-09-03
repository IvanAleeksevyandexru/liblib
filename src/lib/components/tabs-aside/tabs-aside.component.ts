import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit, OnChanges, OnDestroy, Optional } from '@angular/core';
import { Tab, Tabs, ASIDE_TABS } from '../../models/tabs';
import { TabsComponent } from '../tabs/tabs.component';
import { Translation, ModelControl } from '../../models/common-enums';
import { TabsService } from '../../services/tabs/tabs.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { Router } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'lib-tabs-aside',
  templateUrl: './tabs-aside.component.html',
  styleUrls: ['./tabs-aside.component.scss']
})
export class TabsAsideComponent extends TabsComponent implements OnInit, OnChanges, OnDestroy {

  // откуда управляется контрол: сервисом или локальным состоянием
  @Input() public control: ModelControl | string = ModelControl.SERVICE;
  // имя для регистрации в сервисе, не требуется для control === ModelControl.LOCAL
  // имя должно быть уникальным в пределах проекта, т.к. при уничтожении контрол уничтожает свое (по имени) состояние в сервисе
  @Input() public name: string = ASIDE_TABS;
  // явное локальное состояние, игнорируется для ModelControl.SERVICE
  @Input() public tabs: Tabs = null;
  // как интерпретировать .text вкладки: как текст или как код транслитерации
  @Input() public translation: Translation | string = Translation.APP;
  // скрытие отображения мобильного и планшетного меню если доступно не более одной вкладки
  @Input() public hideMobileViewIfOne: boolean;
  // событие выбора вкладки
  @Output() public selected = new EventEmitter<Tab>();

  constructor(
    protected tabsService: TabsService,
    @Optional() protected yaMetricService: YaMetricService,
    protected helperService: HelperService,
    protected router: Router,
    protected changeDetection: ChangeDetectorRef
  ) {
    super(tabsService, yaMetricService, helperService, router, changeDetection);
  }

  public expanded = false;

  public toggle() {
    this.expanded = !this.expanded;
  }

  public select(tab: Tab) {
    this.expanded = false;
    super.select(tab);
  }

  public hideForMobile(tabs: Tab[]): boolean {
    return this.hideMobileViewIfOne && !!tabs && tabs.filter(item => !item.hidden).length < 2;
  }

}
