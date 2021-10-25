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
    SIGN?: CounterData;
    CLAIM?: CounterData;
    PAYMENT?: CounterData;
    PAYMENTS_EGISSO?: CounterData;
    DRAFT?: CounterData;
    EQUEUE?: CounterData;
    FEEDBACK?: CounterData;
    LINKED_ACCOUNT?: CounterData;
    ACCOUNT?: CounterData;
    ACCOUNT_CHILD?: CounterData;
    BIOMETRICS?: CounterData;
    PROFILE?: CounterData;
    ELECTION_INFO?: CounterData;
  };
}

export enum CounterType {
  GEPS = 'GEPS',
  PARTNERS = 'PARTNERS',
  ORDER = 'ORDER',
  CLAIM = 'CLAIM',
  COMPLEX_ORDER = 'COMPLEX_ORDER',
  APPEAL = 'APPEAL',
  SIGN = 'SIGN',
  PAYMENT = 'PAYMENT',
  PAYMENTS_EGISSO = 'PAYMENTS_EGISSO',
  DRAFT = 'DRAFT',
  EQUEUE = 'EQUEUE',
  FEEDBACK = 'FEEDBACK',
  ACCOUNT = 'ACCOUNT',
  ACCOUNT_CHILD = 'ACCOUNT_CHILD',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT',
  PROFILE = 'PROFILE',
  BIOMETRICS = 'BIOMETRICS',
  ESIGNATURE = 'ESIGNATURE',
  ELECTION_INFO = 'ELECTION_INFO',
  ORGANIZATION = 'ORGANIZATION',
  BUSINESSMAN = 'BUSINESSMAN',
  KND_APPEAL = 'KND_APPEAL',
  MIXED = 'MIXED'
}

export enum CounterTarget {
  USER = 'USER',
  ACCOUNT = 'ACCOUNT',
  ORG = 'ORG',
  BIOMETRY = 'BIOMETRY',
  SETTINGS = 'SETTINGS',
  STATEMENTS = 'STATEMENTS',
  MESSAGES = 'MESSAGES',
  PAYMENTS = 'PAYMENTS',
  ESIGNATURE = 'ESIGNATURE',
  PAYMENTS_EGISSO = 'PAYMENTS_EGISSO',
  ACCOUNT_CHILD = 'ACCOUNT_CHILD',
  ELECTION_INFO = 'ELECTION_INFO',
  KND_APPEAL = 'KND_APPEAL',
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
