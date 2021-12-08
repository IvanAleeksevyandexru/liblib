export type NotficationTransportType = 'SMS' | 'EMAIL' | 'PUSH' | 'SOC_VK' | 'SOC_VB' | 'SOC_OK';

export interface NotificationEventType {
  code: string;
  name: string;
  allowedTransport?: NotficationTransportType[];
  fixedTransport?: NotficationTransportType[];
  childs?: ChildEventType[];
}

export interface NotificationEvent extends NotificationEventType {
  blockedNotifications?: any[];
  notificationEventType: NotificationEventType;
  selectedTransport?: NotficationTransportType[];
}

export interface Notifications extends NotificationEvent {
  notificationPlan: NotificationEvent[];
  total: number;
}

export interface NotificationPeriod {
  offset: number;
  from: number;
  to: number;
}

export interface NotificationPeriodItem {
  id: number;
  text: string;
}

export interface ChildEventType {
  code: string;
  description: string;
  childStatus: any;
  name: string;
}
