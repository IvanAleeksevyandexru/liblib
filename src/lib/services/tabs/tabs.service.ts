import { Injectable } from '@angular/core';
import { Tab, Tabs, MAIN_TABS } from '../../models/tabs';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadService } from '../load/load.service';

@Injectable({
  providedIn: 'root'
})
export class TabsService {

  constructor(
    private loadService: LoadService
  ) {
  }

  private tabs: Map<any, BehaviorSubject<Tabs>> = new Map<any, BehaviorSubject<Tabs>>();
  private appliedAccess: Map<any, Array<string> | string> = new Map<any, Array<string> | string>();

  public register(tabsName: any): Observable<Tabs> {
    this.createOrUpdate(tabsName);
    return this.tabs.get(tabsName).asObservable();
  }

  public unregister(tabsName: any): void {
    if (this.tabs.has(tabsName)) {
      this.tabs.get(tabsName).complete();
    }
    this.tabs.delete(tabsName);
  }

  public setTabs(tabsName: any, tabs: Tab[] | Tabs): Tabs {
    return this.createOrUpdate(tabsName, Array.isArray(tabs) ? {tabs} : tabs);
  }

  // возвращаемый объект табов имеет прямой байнд на юай, т.е. его модификация может непосредственно менять вью
  public getTabs(tabsName: any): Tabs {
    if (this.tabs.has(tabsName)) {
      return this.tabs.get(tabsName).getValue();
    } else {
      return this.createOrUpdate(tabsName);
    }
  }

  public setTabsVisibility(tabsName: any, visibility: boolean): Tabs {
    return this.createOrUpdate(tabsName, {visible: visibility});
  }

  // метод оставлен для совместимости
  public setVisibleTabs(visibility: boolean) {
    this.setTabsVisibility(MAIN_TABS, visibility);
  }

  public hideTabsAccordingToAccess(tabsName: any, accessTags: Array<string> | string) {
    this.appliedAccess.set(tabsName, accessTags);
    const tabs = this.getTabs(tabsName);
    tabs.tabs.forEach((tab: Tab) => {
      if (tab.access && !tab.access.find((accessTag: string) => accessTags.includes(accessTag))) {
        tabs.hideTab(tab);
      }
    });
  }

  public hideTabsAccordingToConfig(tabsName: any, configName: string): void {
    if (this.loadService.config.excludeMenuItems &&
        this.loadService.config.excludeMenuItems[configName] &&
        this.loadService.config.excludeMenuItems[configName].length
    ) {
      const tabs = this.getTabs(tabsName);
      tabs.tabs.forEach((tab: Tab) => {
        if (this.loadService.config.excludeMenuItems[configName].includes(tab.id)) {
          tabs.hideTab(tab);
        }
      });
    }
  }

  public hideTabsAccordingToTrusted(tabsName: any, trusted: boolean) {
    const tabs = this.getTabs(tabsName);
    tabs.tabs.forEach((tab: Tab) => {
      if (tab.trusted && tab.trusted !== trusted) {
        tabs.hideTab(tab);
      }
    });
  }

  private createOrUpdate(tabsName: any, tabsProperties?: {[key: string]: any}): Tabs {
    if (!tabsName) {
      throw new Error('Invalid Tabs Group Name');
    }
    const existing = this.tabs.has(tabsName) ? this.tabs.get(tabsName).getValue() : null;
    if (existing && !tabsProperties) {
      return existing;
    }
    // Object.assign т.к. набор табов и их видимость сетится раздельно асинхронно из разных мест в разное время
    const updated = Object.assign(new Tabs(), existing || {}, tabsProperties || {}) as Tabs;
    if (!this.tabs.has(tabsName)) {
      const subj = new BehaviorSubject<Tabs>(updated);
      this.tabs.set(tabsName, subj);
    }
    this.tabs.get(tabsName).next(updated);
    if (this.appliedAccess.has(tabsName)) {
      this.hideTabsAccordingToAccess(tabsName, this.appliedAccess.get(tabsName));
    }
    return updated;
  }

}
