import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../models/user';
import { FeedsService } from '../../services/feeds/feeds.service';
import { FeedsModel, SnippetModel } from '../../models/feed';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-equeue',
  templateUrl: './equeue.component.html',
  styleUrls: ['./equeue.component.scss']
})
export class EqueueComponent implements OnInit {

  @Input() public count = 0;
  @Output() public searching = new EventEmitter<boolean>();

  public user: User;
  public equeueData: SnippetModel[];
  public hasMore: boolean;

  constructor(
    private feedsService: FeedsService,
    public yaMetricService: YaMetricService,
    private loadService: LoadService
  ) {
  }

  public ngOnInit() {
    this.getEqueue();
  }

  private getEqueue(): void {
    this.searching.emit(true);
    this.feedsService.getFeeds({
      isEqueue: true,
      pageSize: this.count.toString(),
      types: 'EQUEUE',
      status: '!reject,!warn'
    }).subscribe((feeds: FeedsModel) => {
      this.hasMore = feeds.hasMore;
      this.searching.emit(false);
      if (feeds && feeds.items && feeds.items.length) {
        this.equeueData = feeds.items.map((feed) => {
          // сэтим parentOrderId (если он есть) чтобы создать сссылку на запись
          if (feed.data && feed.data.snippets && feed.data.snippets[0]) {
            if (feed.data.parentOrderId) {
              feed.data.snippets[0].parentOrderId = feed.data.parentOrderId;
            }
            feed.data.snippets[0].id = feed.id;
          }
          return feed.data && feed.data.snippets && feed.data.snippets[0];
        }).filter((feed) => feed !== undefined);
        this.sendYaMetric();
      }
    });
  }

  public trackById(index, item) {
    return item.id;
  }

  public equeueDataExist() {
    return this.equeueData && this.equeueData.length;
  }

  public getEqueueLink(item: SnippetModel): string {
    if (item.parentOrderId) {
      return `/order/${item.parentOrderId}/${item.id}`;
    } else {
      return `/order/equeue/${item.id}`;
    }
  }

  private sendYaMetric(): void {
    if (this.equeueDataExist()) {
      this.yaMetricService.callReachGoal('overviewUpcomingEqueues', {
        show: true,
        screen: this.loadService.attributes.deviceType
      });
    }
  }

  public onEqueueClick(isItem: boolean): void {
    this.yaMetricService.callReachGoal('overviewUpcomingEqueues', {
      action: isItem ? 'equeueRow' : 'all',
      screen: this.loadService.attributes.deviceType
    });
  }
}
