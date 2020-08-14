import { Injectable } from '@angular/core';
import { Tab } from '../../models/tabs';
import { BehaviorSubject } from 'rxjs';
import { LoadService } from '../load/load.service';

@Injectable({
  providedIn: 'root'
})
export class TabsService {

  constructor(
    private loadService: LoadService
  ) {
  }

  private tabs: BehaviorSubject<Tab[]> = new BehaviorSubject<Tab[]>([]);
  private visible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public tabs$ = this.tabs.asObservable();

  public setTabs(data: Tab[]) {
    this.tabs.next(data);
  }

  public getTabs(id?: string): Tab[] {
    if (!id) {
      return this.tabs.getValue();
    } else {
      const filtered = this.tabs.getValue().find(item => item.id === id);
      return filtered.children;
    }
  }

  public setVisibleTabs(value) {
    this.visible.next(value);
  }

  public getVisibleTabs(): boolean {
    return this.visible.getValue();
  }

  public excludeItems(items: Tab[], name): Tab[] {
    if (this.loadService.config.excludeMenuItems &&
        this.loadService.config.excludeMenuItems[name] &&
        this.loadService.config.excludeMenuItems[name].length
    ) {
      return items.filter((item) => {
        return !this.loadService.config.excludeMenuItems[name].includes(item.id);
      });
    }
    return items;
  }

}
