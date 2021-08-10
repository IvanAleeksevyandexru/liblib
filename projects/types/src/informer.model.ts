export type TypeDataOfInformers = 'ERROR' | 'NO_DEBT' | 'AL10' | 'NO_RIGHTS';

export type TypeStatus = 'error' | 'load' | 'debt' | 'no_debt' | 'al10' | 'no_rights';

export enum TypeDebt {
  FINE = 'fine',
  FSSP = 'fssp',
  FNS = 'fns',
  STATE_DUTY = 'stateDuty',
  ACCOUNT = 'account'
}

export enum WordsOfDebt {
  FINE = 'штраф|штрафа|штрафов',
  FSSP = 'судебная задолженность|судебных задолженности|судебных задолженностей',
  FNS = 'налоговая задолженность|налоговых задолженности|налоговых задолженностей',
  STATE_DUTY = 'госпошлина|госпошлины|госпошлин',
  ACCOUNT = 'счёт|счёта|счетов',
  ALL = 'начисление|начисления|начислений'
}

export enum TypeIcons {
  ERROR = 'search',
  NO_DEBT = 'ok',
  AL10 = 'warn',
  NO_RIGHTS = 'search'
}

export interface InformerShortInterface {
  result?: ResultInterface;
  hint?: HintInterface;
  error: ErrorInterface;
}

export interface ResultInterface {
  originalAmount?: number; // цена без скидки
  amount: number; // цена со скидкой или просто цена
  total: number; // кол-во доков, по которым созданы начисления
  totalDocs: number; // общее кол-во доков юзера
  fine?: DebtInterface; // штрафы
  fssp?: DebtInterface; // судебные задолженности
  fns?: DebtInterface; // налоговые задолженности
  stateDuty?: DebtInterface; // госпошлины
  account?: DebtInterface; // счета
}

export interface DebtInterface {
  originalAmount?: number;
  amount: number;
  total: number;
}

export interface HintInterface {
  code: string;
  days?: number;
}

export interface ErrorInterface {
  code: number;
  message: string;
}

export class DataInformer {
  public title: string;
  public icon: string;
  public button: string;
  public price: number;
  public priceDiscount: number;
  public docs: string;
  public type: string;

  constructor() {
    this.title = '';
    this.icon = '';
    this.button = '';
    this.price = 0;
    this.priceDiscount = 0;
    this.docs = '';
    this.type = ''
  }
}

export interface DebtYaMetricInterface {
  counter?: number;
  types?: {
    fine?: number;
    fssp?: number;
    fns?: number;
    stateDuty?: number;
    account?: number;
  };
}

