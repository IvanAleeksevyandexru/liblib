export class Notifier {
  public type: NotifierType;
  public message: string;
  public notifierId: string;
  public keepAfterRouteChange: boolean;
  public showIcon: boolean;
  public onCancel: () => void;
  public onAction: () => void;
  public actionName: string;

  constructor(init?: Partial<Notifier>) {
    Object.assign(this, init);
  }
}

export class NotifierSetting {
  public singleNotifier?: boolean;
  public removeDelay?: number;
  public maxNotificationsCount?: number;
  public showCloseAllCount?: number;
  public align?: 'right' | 'left';
  public theme?: 'light' | 'dark';
  public animated?: boolean;
}

export enum NotifierType {
  Success,
  Error,
  Process
}
