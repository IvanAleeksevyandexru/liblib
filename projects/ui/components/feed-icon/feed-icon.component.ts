import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-feed-icon',
  templateUrl: './feed-icon.component.html',
  styleUrls: ['./feed-icon.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedIconComponent implements OnInit {

  @Input() public status: string;
  @Input() public title: string;
  @Input() public ipshStatus: string = '';

  constructor() { }

  public ngOnInit() {}

  public setFeedStatusCls(status: string): string[] {
    return ['status-' + status, 'feed-status', this.ipshStatus ? this.ipshStatus : ''];
  }

}
