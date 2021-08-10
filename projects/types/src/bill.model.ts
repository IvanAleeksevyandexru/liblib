import { Vehicle } from '@epgu/types';

export enum ServiceCategoryCode {
  Fine = 'FINE',
  Fns = 'FNS',
  Fssp = 'FSSP',
  Account = 'ACCOUNT',
  StateDuty = 'STATE_DUTY',
  Payment = 'PAYMENT',
}

export enum CardType {
  VISA = 'VISA',
  MasterCard = 'MasterCard',
  Maestro = 'Maestro',
  Mir = 'Mir',
  JCB = 'JCB',
  DinersClub = 'Diners Club',
}

export enum PayMethodCode {
  BANK_CARD = 'BANK_CARD',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
  SAMSUNG_PAY = 'SAMSUNG_PAY',
  MOBTEL = 'MOBTEL',
  QIWI = 'QIWI',
  YADENGI = 'YADENGI',
  elplat = 'elplat',
  webmoney = 'webmoney'
}

export enum PayMethodGroupCode {
  CARD = 'CARD',
  MPHONE = 'MPHONE',
  EMONEY = 'EMONEY',
  CONTACTLESS = 'CONTACTLESS'
}

export enum PaySystemCode {
  UNITELLER = 'UNITELLER',
  MEGAFON = 'MEGAFON',
  UTEL = 'UTEL', // Ростелеком
  BEELINE = 'BEELINE',
  MTC = 'MTC',
  TELE2 = 'TELE2',
  PPS_MTS_MEGAFON = 'pps_mts_megafon',
  PPS_MTS_MTS = 'pps_mts_mts',
  PPS_MTS_TELE2 = 'pps_mts_tele2',
  PPS_MTS_TINKOFF = 'pps_mts_tinkoff',
  PPS_MTS_YOTA = 'pps_mts_yota',
  PPS_MTS_BEELINE = 'pps_mts_beeline',
  PPS_MTS_MOTIV = 'pps_mts_motiv',
  QIWI = 'QIWI',
  YADENGI = 'YADENGI',
  elplat = 'pps_elplat',
  webmoney = 'PPS_webmoney',
  GOOGLE_PAY = 'GOOGLE_PAY',
  GooglePayMobi = 'GooglePay_mobi',
  APPLE_PAY = 'apple_pay',
  ApplePayMobi = 'ApplePay_mobi',
  SAMSUNG_PAY = 'SAMSUNG_PAY',
  SamsungPayMobi = 'SamsungPay_mobi',
  BankCard = 'BANK_CARD',
}

export enum BillsErrors {
  BillsCanceled = 'BILLS_CANCELED',
  BillsNotFound = 'BILLS_NOT_FOUND',
  BillsNotFoundSuccess = 'BILLS_NOT_FOUND_SUCCESS',
  BillsPaid = 'BILLS_PAID',
  BillsServiceNotAvailable = 'BILLS_SERVICE_NOT_AVAILABLE',
  BillsPaymentImpossible = 'BILLS_PAYMENT_IMPOSSIBLE',
  BillsMultiplePaymentNotAvailable = 'BILLS_MULTIPLE_PAYMENT_NOT_AVAILABLE',
  BillsHasUnidentifiedBills = 'BILLS_HAS_UNIDENTIFIED_BILLS',
  BillsInvalidArguments = 'BILLS_INVALID_ARGUMENTS',
  BillsNoAccessRights = 'BILLS_NO_ACCESS_RIGHTS',
  BillsNoAccessRightsUL = 'BILLS_NO_ACCESS_RIGHTS_UL',
  BillsDateEvaluated = 'BILLS_DATE_EVALUATED',
  BillsUncorrectNumber = 'BILLS_UNCORRECT_NUMBER',
  Default = 'DEFAULT'
}

export type BillDiscounts = 'ACTUAL_FOR_STATE_DUTY' | 'ACTUAL_FOR_GIBDD' | 'EXPIRED_FOR_GIBDD';

export interface BillsRequestParams {
  billIds?: number[];
  billNumber?: string;
  reqId?: string;
  senderTypeCode?: string;
  ci?: boolean;
  returnUrl?: string;
  billRequisitesOnly?: boolean;
  fkPayments?: boolean;
  version?: string;
  platform?: string;
  device?: string;
  browser?: string;
  subscribe?: boolean;
  ipshonly?: boolean;
  epgu_id?: string;
  vehicles?: boolean;
  interfaceTypeCode?: string;
  PayerIdType?: string;
  PayerIdNum?: string;
}

export interface Bill {
  actualBeforeDate?: string;
  addAttrs: BillAttr[];
  amount: number;
  billDate: string;
  billId: number;
  billName: string;
  billNumber: string;
  signature?: string;
  billSource?: {
    code: string;
    name: string;
  };
  billStatus?: {
    code: string;
    name: string;
  };
  billSumm: BillSumm[];
  comment?: string;
  createDate?: string;
  currencyCode?: string;
  isPaid: boolean;
  payRequsites?: PayRequsites;
  service?: {
    code: string;
    name: string;
  };
  serviceCategory?: {
    code: ServiceCategoryCode;
    name: string;
  };
  serviceType?: {
    code: string;
    name: string;
  };
  paidIds?: PaidId[];
  billLinks?: BillLink[];
  selectedByWhiteList?: boolean;
  supplierSource?: SupplierSource[];
  fsspApplyButton?: boolean;
  fsspRequestButton?: boolean;
  isMessage?: boolean;
  vehicle?: Vehicle;
  hasPhoto?: boolean;
  attrs?: any; // Кастомный атрибут. Преобразованный addAttrs к объекту
  hasAppealDepartment?: boolean;
  hasAppealPower?: boolean;
  refundAvailable?: boolean;
  routeNumber?: string;
}

export interface BillSumm {
  summId: string;
  summ: string;
}

export interface BillAttr {
  name: string;
  title: string;
  value: string;
}

export interface PayRequsites {
  account: string;
  bankName: string;
  bic: string;
  corrAccount: string;
  kbk: string;
  okato: string;
  oktmo: string;
  payPurpose: string;
  receiverInn: string;
  receiverKpp: string;
  receiverName: string;
}

export interface PaidId {
  amount: number;
  date: string;
  fee: number;
  id: number;
  userId?: number;
}

export interface BillLink {
  amount: number;
  comment: string;
  billDate: string;
  supplierFullName: string;
  billId: string;
  billNumber: string;
  signature?: string;
  vehicle?: Vehicle;
  serviceCategory?: {
    code: ServiceCategoryCode;
    name: string;
  };
}

export interface SupplierSource {
  sourceApplication: string;
  sourceFullName?: string;
  sourcePhone?: string;
  sourceShortName: string;
  sourceURL?: string;
  nameSourceApplication: string;
  isGibdd: boolean;
  sourceCode?: string;
}

export interface FkPayment {
  amount: number;
  bankName?: string;
  bankPaymentExtId: string;
  billNumber: string;
  changeStatus: string;
  payDate: string;
  paymentStatus: string;
  prDocDate: string;
  prDocNum: string;
  prKbk: string;
  prOktmo?: string;
  prOkato: string;
  prPurpCode: string;
  prTaxPeriod: string;
  prTypeCode: string;
  purpose: string;
  recInn: string;
  recKpp: string;
  recipientDate: string;
}

export interface BillResponse {
  response: {
    bills?: Bill[];
    payOptions?: PayOption[];
    fkPayments?: FkPayment[];
    fkSmevVersion?: number;
    hasEditableSumm?: number;
    hasUnidentifiedBills?: boolean;
    unidentifiedBillIds?: number[];
    userHasAddress?: boolean;
    warning?: boolean;
    paiedBillIds?: number[];
    requisites?: {
      uin: number;
      name: string;
    }
  };
  error: BillResponseError;
}

export interface BillResponseError {
  code: number;
  message?: string;
  fkSmevVersion?: number;
  requestId?: string;
}

export interface PayOption {
  amount: number;
  cardInfo?: CardInfo;
  fee?: number;
  feeMin?: number;
  feeMax?: number;
  hash: string;
  payMethod: PayMethod;
  payMethodGroup: PayMethodGroup;
  paySystem: PaySystem;
  paymentInstrument?: PaymentInstrument;
  lastPayMethod?: boolean;
  // кастомные поля
  isHidden?: boolean;
}

export interface CardInfo {
  cardIin: string;
  cardTypeCode: CardType;
  emitentBankName: string;
}

export interface PayMethod {
  code: PayMethodCode;
  name: string;
  value?: string;
}

export interface PayMethodGroup {
  code: PayMethodGroupCode;
  name: string;
  value?: string;
}

export interface PaySystem {
  code: PaySystemCode;
  name: string;
  value?: string;
}

export interface PaymentInstrument {
  code: number;
  name: string;
}

export interface BillAddAttr {
  ReceiverPdfName?: string;
  docType?: string;
  docNumber?: string;
  isDiscountApplied?: boolean;
  originalAmount?: string;
  DiscountDate?: string;
  MultiplierSize?: string;
}

export interface ErrorInfo {
  code: number;
  message?: string;
  fkSmevVersion?: number;
  requestId?: string;
  type: BillsErrors;
  billNumber?: string;
  date?: string;
  supplier?: string;
}

export interface ICommissionResult {
  error: {
    errorCode: number;
    errorMessage: string;
  };
  payOptions: {
    payOptions: PayOption[];
  };
}
