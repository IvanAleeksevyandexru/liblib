import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-catalog-tabs-list',
  templateUrl: './catalog-tabs-list.component.html',
  styleUrls: ['./catalog-tabs-list.component.scss']
})
export class CatalogTabsListComponent implements OnInit, OnDestroy {

  @Input() public catalog: any;
  @Input() public viewType: 'main-page-view' | 'side-view';
  @Output() public catalogTabListItemClick = new EventEmitter<any>();

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
  }


  public ngOnDestroy() {
  }

  public tabClick($event: any, item: any) {
    $event.preventDefault();
    $event.stopPropagation();
    item.viewType = this.viewType;
    this.catalogTabListItemClick.emit(item);
  }
}
