import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-catalog-tabs',
  templateUrl: './catalog-tabs.component.html',
  styleUrls: ['./catalog-tabs.component.scss']
})
export class CatalogTabsComponent implements OnInit, OnDestroy {

  @Input() public catalog: any;
  @Input() public mobile: boolean;

  public showCatalogTabItem: boolean;
  public currentCategoryCode: string;

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
  }

  private closeAllTabs(): void {
    this.catalog.forEach(item => item.active = false);
  }

  public closeCatalog() {
    this.closeAllTabs();
    this.showCatalogTabItem = false;
  }

  public ngOnDestroy() {
    this.closeAllTabs();
  }

  catalogTabListItemClick(item: any) {

    this.showCatalogTabItem = false;

    if (item.active) {
      item.active = false;
      return;
    }

    this.closeAllTabs();

    item.active = !item.active;

    this.currentCategoryCode = item.code;
    this.showCatalogTabItem = item.active;
  }
}
