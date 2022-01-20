import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { INotifier, Notifier, NotifierType } from '@epgu/ui/models/notifier';

@Injectable({
  providedIn: 'root',
})
export class NotifierService {
  private subject = new Subject<Notifier>();
  private keepAfterRouteChange = false;

  constructor() {}

  public onNotifier(notifierId?: string): Observable<Notifier> {
    return this.subject
      .asObservable()
      .pipe(filter(x => x && x.notifierId === notifierId));
  }

  public success(config: Partial<INotifier>) {
    this.notifier(
      new Notifier({
        ...config,
        type: NotifierType.Success,
      }),
    );
  }

  public process(config: Partial<INotifier>) {
    this.notifier(
      new Notifier({
        ...config,
        type: NotifierType.Process,
      }),
    );
  }

  public error(config: Partial<INotifier>) {
    this.notifier(
      new Notifier({
        ...config,
        type: NotifierType.Error,
      }),
    );
  }

  public warning(config: Partial<INotifier>) {
    this.notifier(
      new Notifier({
        ...config,
        type: NotifierType.Warning,
      }),
    );
  }

  public notifier(notifier: Notifier) {
    this.keepAfterRouteChange = notifier.keepAfterRouteChange;
    this.subject.next(notifier);
  }

  public clear(notifierId?: string) {
    this.subject.next(new Notifier({ notifierId }));
  }
}
