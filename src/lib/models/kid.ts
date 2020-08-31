import { Document } from './document';

export interface Kid {
  eTag?: string;
  id?: number;
  linkCode?: string;
  stateFacts?: string[];
  trusted?: boolean;
  updatedOn?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  inn?: string;
  snils?: string;
  documents?: {
    eTag?: string;
    stateFacts?: string[];
    elements?: Document[];
    docs?: Document[];
  };
  // кастомные поля
  birthCert?: Document;
  type?: string;
  hasNewDoc?: boolean | string;
  hasAccount?: boolean;

}
