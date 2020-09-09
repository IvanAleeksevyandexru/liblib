import { VrfStu, VrfValStu } from './verifying-status';

export type DocumentType = 'RF_DRIVING_LICENSE' | 'BRTH_CERT' | 'RF_BRTH_CERT' | 'FID_BRTH_CERT' | 'OLD_BRTH_CERT' | 'MDCL_PLCY' |
  'MLTR_ID' | 'RF_PASSPORT' | 'RF_INT_PASSPORT' | 'FRGN_PASS' | 'FID_DOC' | 'RSDNC_PERMIT' | 'RFG_CERT' |
  'CERT_REG_IMM' | 'DIVORCE_CERT' | 'MARRIED_CERT' | 'FATHERHOOD_CERT' |
  'NAME_CHANGE_CERT' | 'MDCL_BRTH_CERT' | 'KID_RF_BRTH_CERT' | 'DRUGS_INQUIRY' | 'NO_CRIMINAL_INQUIRY'
  // Кастомные типы
  | 'SNILS' | 'INN' | 'DOCS' | 'ORG_INFO' | 'BRANCH_INFO' | 'CHILD' | 'VEHICLE' | 'KID_ACT_RECORD' | 'EXAM';

export interface DocumentValue {
  number?: string;
  expiryDate?: string;
  issueDate?: string;
  issueId?: string;
  issuedBy?: string;
  series?: string;
  firstName?: string;
  lastName?: string;
  latinLastName?: string;
  latinFirstName?: string;
  actNo?: string;
  actDate?: string;
  // Поля для документов с новых рестов
  birthDate?: string;
  experience?: number;
  categories?: string[];
}

export interface Document extends DocumentValue {
  eTag?: string;
  stateFacts?: string[];
  id?: number;
  type: DocumentType;
  vrfStu?: VrfStu;
  vrfValStu?: VrfValStu;
  verifyingValue?: DocumentValue;
}

export interface CustomDocumentExt extends Document {
  serviceUrl?: string;
}

export interface CommonCert {
  oid?: string;
  id?: string;
  guid?: string;
  status?: string;
  relevance?: string;
  type: DocumentType;
  seriesFirst?: string;
  seriesSecond?: string;
  series?: string;
  number?: string;
  issueDate?: string | Date;
  departmentDoc?: string;
  getDateDoc?: string;
  actNo?: string;
  recordDate?: string | Date;
  issuedBy?: string;
}

export interface DocumentHistoryRequest {
  id?: string;
  relevance?: string;
  type?: string;
}

export interface OldDocument extends Document {
  passportType?: string;
  invalidityReason?: string;
  passportStatus?: string;
}

export interface DocumentsHistory {
  oid?: string;
  id?: string;
  version?: number;
  createdOn?: number;
  updatedOn?: number;
  receiptDocDate?: number;
  relevance?: string;
  status?: string;
  legalForce?: boolean;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  gender?: string;
  birthDate?: string;
  departmentDoc?: string;
  history?: OldDocument[];
  type?: string;
}
