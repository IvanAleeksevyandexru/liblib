import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private eventMessage$ = new BehaviorSubject(null);
  public eventMessage = this.eventMessage$.asObservable();

  constructor() {
  }

  public send(key: any, data?: any) {
    this.eventMessage$.next({key, data});
  }

  public on(key: any) {
    return this.eventMessage.pipe(
        filter(event => {
          return event.key === key;
        }),
        map(event => event.data)
      );
  }

}
