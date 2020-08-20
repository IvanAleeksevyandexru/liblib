import { Component, EventEmitter, ChangeDetectorRef, Input, Output, Optional,
  OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Tab, Tabs, MAIN_TABS } from '../../models/tabs';
import { Translation, ModelControl } from '../../models/common-enums';
import { TabsService } from '../../services/tabs/tabs.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { Router, NavigationEnd } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnChanges, OnDestroy {

  // откуда управляется контрол: сервисом или локальным состоянием
  @Input() public control: ModelControl | string = ModelControl.SERVICE;
  // имя для регистрации в сервисе, не требуется для control === ModelControl.LOCAL
  // имя должно быть уникальным в пределах проекта, т.к. при уничтожении контрол уничтожает свое (по имени) состояние в сервисе
  @Input() public name: string = MAIN_TABS;
  // явное локальное состояние, игнорируется для ModelControl.SERVICE
  @Input() public tabs: Tabs = null;
  // как интерпретировать .text вкладки: как текст или как код транслитерации
  @Input() public translation: Translation | string = Translation.APP;
  // включает показ табов в виде дропдауна
  @Input() public responsive = HelperService.isMobile();
  // как сопоставлять урлы текущему: по совпадению только начала урла урлу вкладки или требуется полное совпадение
  @Input() public urlCompareMethod: 'exact' | 'starts-with' = 'starts-with';
  // событие выбора вкладки
  @Output() public selected = new EventEmitter<Tab>();

  constructor(protected tabsService: TabsService,
              @Optional() protected yaMetricService: YaMetricService,
              protected helperService: HelperService,
              protected router: Router,
              protected changeDetection: ChangeDetectorRef) { }

  public Translation = Translation;
  // состояние табов. могло придти локально или от сервиса, в любом случае оно атомарное и мутабл!
  // позволяется модификация объекта в источнике (снаружи) которое будет немедленно влиять на юай здесь
  public innerTabsState: Tabs = null;
  public set innerTabs(innerTabs: Tabs) {
    if (this.activeTabSubscription) {
      this.activeTabSubscription.unsubscribe();
    }
    innerTabs.verifyState();
    this.innerTabsState = innerTabs;
    this.activeTab = innerTabs.getActiveTab();
    this.activeTabSubscription = innerTabs.watchForActive().subscribe((tab: Tab) => {
      this.selected.emit(tab);
      this.activeTab = tab;
      this.changeDetection.detectChanges();
    });
    this.selectTabByUrlIfNeeded();
    this.changeDetection.detectChanges();
  }
  public get innerTabs(): Tabs {
    return this.innerTabsState;
  }
  public activeTab: Tab = null;
  public showMobTabs = false;
  private tabsSubscription: Subscription = null;
  private activeTabSubscription: Subscription = null;

  public ngOnInit() {
    if (this.control === ModelControl.LOCAL) {
      this.innerTabs = this.tabs;
    }
    if (this.control === ModelControl.SERVICE) {
      this.tabsSubscription = this.tabsService.register(this.name).subscribe((tabs: Tabs) => {
        this.innerTabs = tabs;
      });
    }
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.selectTabByUrlIfNeeded();
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.tabs && this.control === ModelControl.LOCAL) {
      this.innerTabs = this.tabs;
    }
  }

  public ngOnDestroy() {
    if (this.control === ModelControl.SERVICE && this.tabsSubscription) {
      this.tabsSubscription.unsubscribe();
      this.tabsService.unregister(this.name);
    }
  }

  // выделяет вкладку без срабатывания обработчиков, переходов и метрики
  public setActive(tab: Tab) {
    this.innerTabs.setActiveTab(tab);
  }

  // выделение вкладки пользователем с обработчиками, переходами и метриками
  public select(selectedTab: Tab) {
    if (selectedTab && (selectedTab.hidden || selectedTab.disabled)) {
      return;
    }
    const allowed = selectedTab && selectedTab.click ? selectedTab.click() : true;
    if (allowed !== false) {
      this.setActive(selectedTab);
      const proceed = () => {
        this.showMobTabs = false;
        if (selectedTab.url) {
          this.helperService.navigate(selectedTab.url);
        }
      };
      if (selectedTab.metric && this.yaMetricService) {
        this.yaMetricService.callReachGoalParamsAsMap(selectedTab.metric).then(proceed);
      } else {
        proceed();
      }
    }
  }

  public toggleTabsList(event: MouseEvent): void {
    this.showMobTabs = !this.showMobTabs;
  }

  // табы получают начальное состояние выделения автоматически (если не задано явно),
  // если это было сделано ошибочно - можно далее принудительно сбросить/изменить
  private selectTabByUrlIfNeeded() {
    const tabs = this.innerTabs;
    if (tabs && tabs.containsUrls()) {
      tabs.tabs.forEach((tab: Tab) => {
        if (tab.url) {
          const match = this.urlCompareMethod === 'exact' ? HelperService.isUrlEqualToCurrent : HelperService.isUrlStartsAsCurrent;
          if (match(tab.url)) {
            tabs.setActiveTab(tab);
          }
        }
      });
    } else {
      tabs.selectFirstOneAvaialble();
    }
  }

}
