import {FeedModel, FeedsModel} from '../models/feed';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class FeedsServiceStub {

  public getFeeds() {
    return EMPTY;
  }

  public setFixedIcon(feed: FeedModel): boolean {
    return false;
  }

  public getFeedDetails() {
    return EMPTY;
  }
}
