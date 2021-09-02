import { BehaviorSubject } from 'rxjs';
import { CounterData } from '@epgu/ui/models/counter';
import { LineBreak } from '@epgu/ui/models/common-enums';
import { UserAssuranceLevel } from '@epgu/ui/models/user-type-params';

export const MAIN_TABS = 'main_tabs'; // имя главных табов (условное, не обязано совпадать)
export const ASIDE_TABS = 'aside_tabs'; // имя боковых навигационных табов (условное, не обязано совпадать)

export interface Tab {
  id?: string; // ид не обязателен, если есть будет выводиться в хтмл, также нужен для скрытия по конфигу
  name: string; // текст или код транслитерации
  url?: string | { // урл перехода
    url: string;
    queryParams?: {[key: string]: string}
  };
  hidden?: boolean; // показывать ли вкладку
  active?: boolean; // активна ли вкладка
  disabled?: boolean; // заблокирована ли вкладка
  break?: LineBreak | string; // показывать линию разрыва перед или после
  counter?: CounterData | number; // подсветка количества новых/непрочитанных ассоциированных с этой вкладкой
  metric?: {[key: string]: any}; // метрика которую нужно послать при выборе
  access?: Array<string>; // если указано позволяет применять скрытие вкладок по секьюрити
  custom?: {[key: string]: any}; // дополнительная информация
  click?: () => boolean; // обработчик выбора вкладки, способен отменять переход возвратом false
  queryParams?: any;
  trusted?: boolean; // если указано, показывать вкладку только для подтвержденной УЗ
}

export class Tabs {

  constructor(something?: {[key: string]: any} | Tabs | Array<Tab>) {
    if (something) {
      if (Array.isArray(something)) {
        this.tabs = something;
        this.visible = true;
      } else {
        this.name = something.name;
        this.tabs = something.tabs;
        this.visible = something.visible;
      }
    }
    this.notifier = new BehaviorSubject<Tab>(this.getActiveTab());
  }

  public tabs: Array<Tab> = []; // список табов с собственными состояниями скрытия/активности
  public name: string | any; // имя табов для идентификации в сервисе
  public visible?: boolean; // видимость контрола табов, связанного с этим именем
  private notifier: BehaviorSubject<Tab>;

  public setActiveTab(tab: Tab) {
    (this.tabs || []).forEach((anyTab: Tab) => anyTab.active = false);
    if (this.tabs && this.tabs.includes(tab)) {
      tab.active = true;
      this.notifier.next(tab);
    } else {
      this.notifier.next(null);
    }
  }

  public getActiveTab() {
    return (this.tabs || []).find((tab: Tab) => tab.active);
  }

  public disabledTab(tab: Tab, preserveSelected = false) {
    if (this.tabs && this.tabs.includes(tab)) {
      tab.disabled = true;
      if (!preserveSelected && tab.active) {
        this.selectFirstOneAvaialble();
      }
    }
  }

  public hideTab(tab: Tab, preserveSelected = false) {
    if (this.tabs && this.tabs.includes(tab)) {
      tab.hidden = true;
      if (!preserveSelected && tab.active) {
        this.selectFirstOneAvaialble();
      }
    }
  }

  public showTab(tab: Tab) {
    if (this.tabs && this.tabs.includes(tab)) {
      tab.hidden = false;
    }
  }

  public selectFirstOneAvaialble() {
    this.setActiveTab(this.tabs.find((tab: Tab) => !tab.hidden && !tab.disabled));
  }

  public containsUrls() {
    return this.tabs.some((tab: Tab) => tab.url);
  }

  public verifyState() {
    const active = this.tabs.filter((tab: Tab) => tab.active);
    if (active.length > 1) {
      this.setActiveTab(active[0]);
    }
  }

  public watchForActive() {
    return this.notifier.asObservable();
  }
}

export interface LightTab {
  id: string; // тип фильтра таба
  name: string;
  hidden?: boolean;
  active?: boolean;
  access?: UserAssuranceLevel[];
}
