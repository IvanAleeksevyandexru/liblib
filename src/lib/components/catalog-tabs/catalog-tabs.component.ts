import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { SharedService } from '../../services/shared/shared.service';
import { Subscription } from 'rxjs';

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
  public sharedServiceSubscription: Subscription;

  constructor(
    public loadService: LoadService,
    public sharedService: SharedService
  ) {
  }

  public ngOnInit(): void {
      this.sharedServiceSubscription = this.sharedService.on('menuCatalogClick').subscribe(() => {
        this.closeCatalog();
      })
  }

  private closeAllTabs(): void {
    this.catalog.forEach(item => item.sideActive = false);
    this.catalog.forEach(item => item.mainActive = false);
  }

  public closeCatalog() {
    this.closeAllTabs();
    this.showCatalogTabItem = false;
  }

  public catalogTabListItemClick(item: any) {

    this.showCatalogTabItem = false;

    if (item.mainActive) {
      item.mainActive = false;
      return;
    }

    this.closeAllTabs();

    item.mainActive = !item.mainActive;

    this.currentCategoryCode = item.code;
    this.showCatalogTabItem = item.mainActive;
  }

  public ngOnDestroy() {
    this.sharedServiceSubscription.unsubscribe();
    this.closeAllTabs();
  }

}
