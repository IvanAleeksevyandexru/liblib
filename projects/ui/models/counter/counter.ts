export interface CounterData {
  total?: number;
  unread: number;
  type?: CounterType;
}

export interface CountersModel {
  total: number;
  unread: number;
  counters: {
    GEPS?: CounterData;
    PARTNERS?: CounterData;
    ORDER?: CounterData;
    CLAIM?: CounterData;
    PAYMENT?: CounterData;
    DRAFT?: CounterData;
    EQUEUE?: CounterData;
    FEEDBACK?: CounterData;
    LINKED_ACCOUNT?: CounterData;
    ACCOUNT?: CounterData;
    BIOMETRICS?: CounterData;
    PROFILE?: CounterData;
  };
}

export enum CounterType {
  GEPS = 'GEPS',
  PARTNERS = 'PARTNERS',
  ORDER = 'ORDER',
  CLAIM = 'CLAIM',
  COMPLEX_ORDER = 'COMPLEX_ORDER',
  APPEAL = 'APPEAL',
  PAYMENT = 'PAYMENT',
  DRAFT = 'DRAFT',
  EQUEUE = 'EQUEUE',
  FEEDBACK = 'FEEDBACK',
  ACCOUNT = 'ACCOUNT',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT',
  PROFILE = 'PROFILE',
  BIOMETRICS = 'BIOMETRICS',
  ESIGNATURE = 'ESIGNATURE',
  MIXED = 'MIXED'
}

export enum CounterTarget {
  USER = 'USER',
  ACCOUNT = 'ACCOUNT',
  BIOMETRY = 'BIOMETRY',
  SETTINGS = 'SETTINGS',
  STATEMENTS = 'STATEMENTS',
  MESSAGES = 'MESSAGES',
  PAYMENTS = 'PAYMENTS',
  ESIGNATURE = 'ESIGNATURE',
  PARTNERS = 'PARTNERS',
  EMPTY = 'EMPTY'
}

export type CounterFilter  = (key: string) => boolean;

export interface CounterResponse {
  counter: CounterResponseItem[];
  total: number;
  unread: number;
}

export interface CounterResponseItem {
  total: number;
  type: CounterType;
  unread: number;
}
