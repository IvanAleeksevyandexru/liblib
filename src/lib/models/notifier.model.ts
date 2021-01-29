export class Notifier {
  public type: NotifierType;
  public message: string;
  public notifierId: string;
  public keepAfterRouteChange: boolean;
  public showIcon: boolean;
  public onCancel: () => void;

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

export const NOTIFIER_DEFAULT_SETTING = {
  singleNotifier: false, // эквивалент maxNotificationsCount = 1
  removeDelay: 5000, // null - никогда, 0 - мгновенно, другое число - задержка (мс)
  maxNotificationsCount: 5, // размер очереди сообщений
  showCloseAllCount: 0, // 0 - никогда, 1 - всегда, более 1 - при определенном количестве и более
  theme: 'dark',
  align: 'left',
  animated: true
};
