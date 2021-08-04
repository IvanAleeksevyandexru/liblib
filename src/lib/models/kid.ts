import { CommonCert, Document, DocumentType } from './document';
import { DatesHelperService } from '../services/dates-helper/dates-helper.service';

export interface Kid {
  eTag?: string;
  id?: number;
  oid?: number;
  linkCode?: string;
  stateFacts?: string[];
  trusted?: boolean;
  updatedOn?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  birthPlace?: string;
  inn?: string;
  snils?: string;
  documents?: {
    eTag?: string;
    stateFacts?: string[];
    elements?: (Document | CommonCert)[];
    docs?: (Document | CommonCert)[];
    size?: number;
  };
}

export class Kid {
  public id?: number;
  public oid?: number;
  public linkCode?: string;
  public trusted?: boolean;
  public firstName: string;
  public lastName: string;
  public middleName?: string;
  public gender?: 'M' | 'F';
  public birthDate?: string;
  public birthPlace?: string;
  public inn?: string;
  public snils?: string;
  // кастомные поля
  public tempId?: number;
  public age?: number;
  public edit?: boolean;
  public subscribe?: boolean;
  public birthCert?: Document | CommonCert;
  public passport?: Document;
  public cert?: CommonCert;
  public medDocStatus?: string;
  public medOrgStatus?: string;
  public snilsStatus?: string;
  public state?: any;
  public documents?: {
    eTag?: string;
    stateFacts?: string[];
    elements?: (Document | CommonCert)[];
    docs?: (Document | CommonCert)[];
    size?: number;
  };
  public hasAccount?: any; // TODO возможно, поле более не актуально
  public readonly type;
  private readonly fields = [
    'id', 'oid', 'linkCode', 'firstName', 'lastName', 'middleName',
    'gender', 'birthDate', 'birthPlace', 'trusted', 'inn', 'snils'
  ];

  constructor(child: Kid, types: {[key: string]: DocumentType}) {
    this.mapFields(this, child);

    this.type = types.CHILD;
    this.age = DatesHelperService.calcAge(this.birthDate);

    if (this.age < 18) {
      this.subscribe = true;
    }

    this.documents = {
      elements: child.documents.elements
    };
    this.birthCert = { type: types.BIRTH_CERTIFICATE_RF } as Document;
    this.passport = { type: types.PASSPORT } as Document;
    this.cert = { type: types.FATHERHOOD_CERT } as CommonCert;

    this.documents.elements.forEach(doc => {
      ['eTag', 'stateFacts'].forEach(field => delete doc[field]);

      switch (doc.type) {
        case types.BIRTH_CERTIFICATE:
        case types.BIRTH_CERTIFICATE_RF:
        case types.BIRTH_CERTIFICATE_FID:
        case types.BIRTH_CERTIFICATE_OLD:
          this.birthCert = doc;
          break;
        case types.PASSPORT:
          this.passport = doc as Document;
          break;
        case types.FATHERHOOD_CERT:
          this.cert = doc as CommonCert;
          break;
      }
    });
  }

  private mapFields(target, origin) {
    Object.keys(origin).forEach(field => {
      if (this.fields.includes(field)) {
        target[field] = origin[field];
      }
    });
  }

  public processChild(): Kid {
    const child = {};

    this.mapFields(child, this);

    return {
      ...child,
      documents: {
        elements: this.documents.elements
      }
    } as Kid;
  }
}
