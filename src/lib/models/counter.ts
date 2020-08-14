export interface CounterData {
  total?: number;
  unread: number;
  type?: CounterType;
}

export interface CountersModel {
  total: number;
  counters: {
    GEPS?: CounterData;
    ORDER?: CounterData;
    CLAIM?: CounterData;
    PAYMENT?: CounterData;
    DRAFT?: CounterData;
    EQUEUE?: CounterData;
    FEEDBACK?: CounterData;
    ACCOUNT?: CounterData;
    BIOMETRICS?: CounterData;
    PROFILE?: CounterData;
  };
}

export enum CounterType {
  GEPS = 'GEPS',
  ORDER = 'ORDER',
  CLAIM = 'CLAIM',
  PAYMENT = 'PAYMENT',
  DRAFT = 'DRAFT',
  EQUEUE = 'EQUEUE',
  FEEDBACK = 'FEEDBACK',
  ACCOUNT = 'ACCOUNT',
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
  EMPTY = 'EMPTY'
}

export type CounterFilter  = (key: string) => boolean;
