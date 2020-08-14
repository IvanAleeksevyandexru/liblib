import { Component, Input, OnInit } from '@angular/core';
import { EdsItem } from '../../../models/ds.plugin.model';

@Component({
  selector: 'lib-eds-item',
  templateUrl: './eds-item.component.html',
  styleUrls: ['./eds-item.component.scss']
})
export class EdsItemComponent implements OnInit {
  @Input() public item: EdsItem;

  constructor() { }

  public ngOnInit() {
  }

}
