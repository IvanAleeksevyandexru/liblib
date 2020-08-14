import { Address } from './address';
import { Contact } from './contact';
import { Document } from './document';
import { Kid } from './kid';
import { Vehicle } from './vehicle';
import { User, PersonData, Person } from './user';
import { ConfirmType } from './confirm-type';
import { RegContextConfirmState } from './reg-context-confirm-state';

export enum EsiaUserEmbed {
  documents = 'documents.elements',
  addresses = 'addresses.elements',
  vehicles = 'vehicles.elements',
  kids = 'kids.elements'
}

export interface EsiaUser {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  birthPlace?: string;
  citizenship?: string;
  inn?: string;
  snils?: string;
  avatarUuid?: string;
  containsUpCfmCode?: boolean;
  rIdDoc?: number;
  trusted?: boolean;
  updatedOn?: number;
  verifying?: boolean;
  social?: number;
  chosenCfmTypes?: ConfirmType[];
  regCtxCfmSte?: RegContextConfirmState;
  regType?: 'OPR' | 'SYS' | 'SLF';
  status?: 'REGISTERED' | 'DELETED';
  addresses?: {
    elements: Address[];
    size: number;
  };
  contacts?: {
    elements: Contact[];
    size: number;
  };
  documents?: {
    elements: Document[];
    size: number;
  };
  kids?: {
    elements: Kid[];
    size: number;
  };
  vehicles?: {
    elements: Vehicle[];
    size: number;
  };
  // Кастомные поля
  level?: 1 | 2 | 3; // Уровень УЗ пользователя
  fullName?: string; // ФИО
}

export class EsiaUser {
  public firstName: string;
  public lastName: string;
  public middleName?: string;
  public gender?: 'M' | 'F';
  public birthDate?: string;
  public birthPlace?: string;
  public citizenship?: string;
  public inn?: string;
  public snils?: string;
  public avatarUuid?: string;
  public chosenCfmTypes?: ConfirmType[];
  public regCtxCfmSte?: RegContextConfirmState;
  public status?: 'REGISTERED' | 'DELETED';
  public trusted?: boolean;
  public updatedOn?: number;
  public social?: number;
  public containsUpCfmCode?: boolean;
  public rIdDoc?: number;
  public regType?: 'OPR' | 'SYS' | 'SLF';
  public verifying?: boolean;
  public addresses?: {
    elements: Address[];
    size: number;
  };
  public contacts?: {
    elements: Contact[];
    size: number;
  };
  public documents?: {
    elements: Document[];
    size: number;
  };
  public kids?: {
    elements: Kid[];
    size: number;
  };
  public vehicles?: {
    elements: Vehicle[];
    size: number;
  };
  // Кастомные поля
  public level?: 1 | 2 | 3; // Уровень УЗ пользователя
  public fullName?: string; // ФИО
  public avatar?: string; // Ссылка на изображение профиля

  constructor(user?: User) {
    if (user) {
      const personData = user.person as PersonData;

      if (personData && personData.person) {
        const person = user.person.person as Person;

        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.middleName = user.middleName;
        this.gender = user.gender;
        this.birthDate = user.birthDate;
        this.birthPlace = person.birthPlace;
        this.citizenship = person.citizenshipCode;
        this.inn = person.inn;
        this.snils = person.snils;
        this.avatarUuid = person.avatarUuid;
        this.chosenCfmTypes = person.chosenCfmTypes;
        this.regCtxCfmSte = person.regCtxCfmSte;
        this.trusted = person.trusted;
        this.updatedOn = Number(person.updatedOn);

        this.level = user.level;
        this.fullName = user.fullName;

        // очистка пустых полей
        Object.keys(this).forEach(key => !this[key] && delete this[key]);
      }
    }
  }
}
