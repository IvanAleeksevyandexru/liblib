import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Notifier, NotifierType } from '../../models/notifier.model';

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  private subject = new Subject<Notifier>();
  private keepAfterRouteChange = false;

  constructor() {}

  public onNotifier(notifierId?: string): Observable<Notifier> {
    return this.subject.asObservable().pipe(filter(x => x && x.notifierId === notifierId));
  }

  public success(config) {
    this.notifier(new Notifier({
      message: config.message,
      type: NotifierType.Success,
      notifierId : config.notifierId,
      onCancel: config.onCancel,
      onAction: config.onAction,
      actionName: config.actionName,
      showIcon: config.showIcon
    }));
  }

  public process(config) {
    this.notifier(new Notifier({
      message: config.message,
      type: NotifierType.Process,
      notifierId : config.notifierId,
      onCancel: config.onCancel,
      onAction: config.onAction,
      actionName: config.actionName,
      showIcon: config.showIcon
    }));
  }

  public error(config) {
    this.notifier(new Notifier({
      message: config.message,
      type: NotifierType.Error,
      notifierId : config.notifierId,
      onCancel: config.onCancel,
      onAction: config.onAction,
      actionName: config.actionName,
      showIcon: config.showIcon
    }));
  }

  public notifier(notifier: Notifier) {
    this.keepAfterRouteChange = notifier.keepAfterRouteChange;
    this.subject.next(notifier);
  }

  public clear(notifierId ?: string) {
    this.subject.next(new Notifier({notifierId}));
  }
}

