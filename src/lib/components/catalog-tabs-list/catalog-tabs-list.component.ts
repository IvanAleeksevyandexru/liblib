import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { CatalogData } from '../../models/catalog';

@Component({
  selector: 'lib-catalog-tabs-list',
  templateUrl: './catalog-tabs-list.component.html',
  styleUrls: ['./catalog-tabs-list.component.scss']
})
export class CatalogTabsListComponent implements OnInit, OnDestroy {

  @Input() public catalog: CatalogData[];
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Output() public catalogTabListItemClick = new EventEmitter<CatalogData>();

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {

  }

  public ngOnDestroy() {
  }

  public tabClick($event: any, item: CatalogData) {
    $event.preventDefault();
    $event.stopPropagation();
    item.viewType = this.viewType;
    this.catalogTabListItemClick.emit(item);
  }
}
