import {
  BillAttr,
  BillLink,
  PayMethod,
  PayRequsites,
  ServiceCategoryCode,
  SupplierSource
} from './bill.model';
import { ExtendedGibddDetails } from './gibdd-fine.model';
import { Vehicle } from './vehicle';
import { Observable } from 'rxjs';

export type PaymentStatus = 'NEW' | 'PAY_SERVICE_CONFIRMATION' | 'PAY_SERVICE_CONFIRMED' | 'BANK_PAY_ORDER_CONFIRMATION' |
  'BANK_PAY_ORDER_CONFIRMED' | 'SERVICE_PROVIDER_CONFIRMATION' | 'SERVICE_PROVIDER_CONFIRMED' | 'BANK_PAY_CONFIRMATION' |
  'GISGMP_QUITTANCE_STATUS' | 'PAYMENT_DENIED' | 'PAY_SERVICE_ABORTED' | 'PAYMENT_ABORTED' | 'PAYMENT_PPS_DENIED' | 'BANK_PAY_CONFIRMED';

export enum PaymentStatusColor {
  NEW = 'yellow',
  PAY_SERVICE_CONFIRMATION = 'yellow',
  PAY_SERVICE_CONFIRMED = 'yellow',
  BANK_PAY_ORDER_CONFIRMATION = 'yellow',
  BANK_PAY_ORDER_CONFIRMED = 'yellow',
  SERVICE_PROVIDER_CONFIRMATION = 'yellow',
  SERVICE_PROVIDER_CONFIRMED = 'green',
  BANK_PAY_CONFIRMATION = 'green',
  GISGMP_QUITTANCE_STATUS = 'green',
  PAYMENT_DENIED = 'red',
  PAYMENT_PPS_DENIED = 'red',
  PAY_SERVICE_ABORTED = 'red',
  PAYMENT_ABORTED = 'red',
  BANK_PAY_CONFIRMED = 'green'
}

export enum PaymentErrors {
  PaymentNotFound = 'PAYMENT_NOT_FOUND',
  PaymentNotAvailable = 'PAYMENT_NOT_AVAILABLE',
  Default = 'DEFAULT'
}

export type StatusColors = 'yellow' | 'green' | 'red';

export interface PaymentDetailsResponse {
  response: PaymentDetailsContent;
  error: {
    code: number;
    message: string;
  };
}

export interface PaymentDetailsContent {
  payment: Payment;
  paymentItems: PaymentItems;
}

export interface Payment {
  paymentId: number;
  status: {
    code: PaymentStatus;
    name: string;
  };
  amount: number;
  fee: number;
  totalAmount: number;
  createTime: string;
  payMethod: PayMethod;
  paySystem: {
    code: string;
    name: string;
  };
  bank: {
    code: string;
    name: string;
  };
  currencyCode: string;
  statusUpdated: string;
  quittanceStatusFK: string;
  serviceType: {
    code: string;
    name: string;
  };
  paid: boolean;
}

export interface PaymentItems {
  payRequsites: PayRequsites;
  billDate: string;
  billNumber: string;
  signature: string;
  comment: string;
  service: {
    code: string;
    name: string;
  };
  serviceCategory: {
    code: ServiceCategoryCode;
    name: string;
  };
  supplier: {
    code: string;
    name: string;
  };
  selectedByWhiteList: boolean;
  supplierSource: SupplierSource[];
  billSource: {
    code: string;
    name: string;
  };
  document: {
    number: string;
    typeName: string;
    typeDocCode?: string;
  };
  vehicle?: Vehicle;
  addAttrs: {
    addAttrs: BillAttr[];
  };
  isMessage: boolean;
  hasPhoto?: boolean;
  attrs?: any; // Кастомный атрибут. Преобразованный addAttrs к объекту
  hasAppealDepartment?: boolean;
  hasAppealPower?: boolean;
  addRegionAppeal?: boolean;
  isOwner?: boolean;
  refundAvailable?: boolean;
  routeNumber?: string;
}

export interface PaymentDetails extends PaymentItems {
  amount: number;
  isPaid: boolean;
  category: string;
  categoryName: string;
  formattedBillDate: string;
  subTitle: string;
  source: string;
  sourceUrl?: string;
  documentStr?: string;
  fine?: ExtendedGibddDetails;
  fssp?: {
    spi?: string;
    ip?: string;
    id?: string;
    billLinks?: BillLink[];
    debtText?: string;
  };
  stateDuty?: {
    orderId: string;
    orderUrl: string;
  };
  extendedPayment: ExtendedPayment;
}

export interface ExtendedPayment extends Payment {
  statusComment?: Observable<StatusComment>;
  statusColor?: StatusColors;
}

export interface StatusComment {
  comment: string;
  param?: string;
}
