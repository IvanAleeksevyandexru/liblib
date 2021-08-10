import { DadataResult } from '@epgu/types';

export type DeliverySubscribeStatus = 'REMIND_LATER' | 'NOT_SUBSCRIBED' | 'DENY_SUBSCRIPTION' | 'SUBSCRIBED' | 'UNSUBSCRIBED';

export interface DeliveryStatus {
  status: 'REMIND_LATER' | 'NOT_SUBSCRIBED' | 'DENY_SUBSCRIPTION' | 'SUBSCRIBED' | 'UNSUBSCRIBED';
  hint?: DeliveryStatusHint;
  regDt: string;
  dateTs: string;
}

export interface DeliveryStatusHint {
  available: boolean;
  popup: string;
  mobilePopup: string;
}

export interface DeliveryInfo {
  agreement: boolean;
  url: string;
  disclaimer: string;
}

export interface PopupData {
  title: string;
  subtitle: string;
  plvAddress?: DadataResult;
  prgAddress?: DadataResult;
  type: 'PLV' | 'PRG' | 'BOTH';
}

export interface GepsSaveAddresses {
  asString: string;
}

export interface GepsUpdateAddresses {
  status?: string;
  addresses: GepsSaveAddresses[];
}

export interface GepsAddressItem {
  apartment: string;
  asString: string;
  building: string;
  city: string;
  district: string;
  fiasId: string;
  house: string;
  housing: string;
  kladrId: string;
  locality: string;
  ownership: string;
  porch: string;
  postalCode: string;
  region: string;
  street: string;
}

export interface GepsAddresses {
  addresses: GepsAddressItem[];
}

export const comparingEsiaDadataAddresses = {
  zipCode: 'index',
  fiasCode: 'fiasCode',
  region: 'region',
  area: 'district',
  city: 'city',
  district: 'inCityDist',
  settlement: 'town',
  additionArea: 'additionalArea',
  additionAreaStreet: 'additionalStreet',
  street: 'street',
  house: 'house',
  frame: 'building1',
  building: 'building2',
  flat: 'apartment'
};

export interface AllSubscriptionResponse {
  items: SubscriptionItem[];
  pageStart: number;
  pageSize: number;
  totalCount: number;
  remind?: string;
  hint: SubscriptionHint;
}

export interface SubscriptionHint {
  available: boolean;
  popup: string;
  mobilePopup: string;
  disclaimer: string;
  url: string;
}

export interface SubscriptionInfo {
  items: SubscriptionItem[];
  hint: SubscriptionHint;
}

export interface SubscriptionItem {
  code: string;
  name: string;
  status: DeliverySubscribeStatus;
  stateTs?: string;
}
