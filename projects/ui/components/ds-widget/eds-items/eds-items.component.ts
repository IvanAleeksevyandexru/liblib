import { Component, OnInit } from '@angular/core';
import { Modal } from '@epgu/ui/models';
import { EdsItem } from '@epgu/ui/models';

@Component({
  templateUrl: './eds-items.component.html',
  styleUrls: ['./eds-items.component.scss']
})
@Modal()
export class EdsItemsComponent implements OnInit {
  public items: EdsItem[] = [];
  public itemsOnPage: EdsItem[] = [];
  public pageSize = 3;
  public activePage: number;
  public select: (index: number) => {};

  public destroy: () => {};

  constructor() { }

  public ngOnInit() {
    this.pageChanged(1);
  }

  public onCancel(): void {
    this.destroy();
  }

  public onSelect(index: number): void {
    this.select(index);
    this.destroy();
  }

  public pageChanged(page: number): void {
    const startPosition = (page - 1) * this.pageSize;

    this.activePage = page;
    this.itemsOnPage = this.items.slice(startPosition, startPosition + this.pageSize);
  }
}
