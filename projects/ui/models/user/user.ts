import {
  Address,
  Biometric,
  ConfirmType,
  Org,
  RegContextConfirmState,
  Social,
} from '@epgu/ui/models';
import { Kid } from '@epgu/ui/models/kid';
import { Contact } from '@epgu/ui/models/contact';
import { Vehicle } from '@epgu/ui/models/vehicle';
import { Document } from '@epgu/ui/models/document';
import { UserTypeParams } from '@epgu/ui/models/user-type-params';

export interface PersonData {
  addresses?: Address[];
  biometrics?: Biometric[];
  attorneys?: any[]; // TODO убрать any
  employees?: any[]; // TODO убрать any
  contacts?: Contact[];
  categories?: CategoryUser[];
  docs?: Document[];
  groups?: Group[];
  error?: string;
  id?: string;
  kids?: Kid[];
  org?: Org;
  person?: Person;
  registration?: Registration;
  roles?: Role[];
  socials?: Social[];
  totalVehicles?: number;
  vehicles?: Vehicle[];
}

// поле person внутри person person !!!
export interface Person {
  chief?: boolean;
  assuranceLevel?: string;
  avatarLink?: string;
  avatarUuid?: string;
  biomStu?: boolean;
  birthDate?: string;
  birthPlace?: string;
  chosenCfmTypes?: ConfirmType[];
  citizenship?: string;
  citizenshipCode?: string;
  contacts?: {
    contacts?: Contact[];
    etag?: string;
    stateFacts?: string[];
  };
  etag?: string;
  firstName?: string;
  gender?: 'M' | 'F';
  id?: string;
  inn?: string;
  lastName?: string;
  middleName?: string;
  position?: string;
  regCtxCfmSte?: RegContextConfirmState;
  snils?: string;
  trusted?: boolean;
  updatedOn?: string;
  containsUpCfmCode?: boolean;
}

export interface Registration {
  cfmDate?: string;
  cfmTyp?: string;
  changeDate?: string;
  etag?: string;
  regDate?: string;
}

export interface Role {
  active?: boolean;
  branchName?: string;
  branchOid?: string;
  chief?: boolean;
  email?: string;
  fullName?: string;
  ogrn?: string;
  oid?: number;
  phone?: string;
  shortName?: string;
  type?: 'PRIVATE' | 'BUSINESS' | 'LEGAL' | 'AGENCY';
  current?: boolean;
  roleByType?: 'PRIVATE' | 'EMPLOYEE' | 'BUSINESSMAN' | 'SUPERVISOR';
}

interface Group {
  description?: string;
  grp_id?: string;
  itSystem?: string;
  name?: string;
  system?: boolean;
}

export interface User {
  empEpguRole?: string;
  activeBusinessRoleCount?: string;
  activeLegalRoleCount?: string;
  assuranceLevel?: string;
  authToken?: string;
  autorityId?: string;
  birthDate?: string;
  branchOid?: string;
  corporateContact?: string;
  corporateContactVerified?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  formattedLoginName?: string;
  formattedName?: string;
  gender?: 'M' | 'F';
  globalRole?: string;
  inn?: string;
  isAssuranceLevelCorrect?: boolean;
  kids?: Kid[];
  lastName?: string;
  liveAddress?: string;
  mapp?: boolean;
  mapp_business?: boolean;
  middleName?: string;
  mobile?: string;
  mobileVerified?: true;
  orgINN?: string;
  orgId?: string;
  orgInn?: string;
  orgKPP?: string | null;
  orgName?: string;
  orgOGRN?: string;
  orgOgrn?: string;
  orgOid?: string;
  orgPosition?: string | null;
  orgPowers?: string;
  orgShortName?: string;
  orgType?: 'L' | 'B';
  person?: PersonData;
  personCitizenship?: string;
  personEMail?: string;
  personEmail?: string;
  personINN?: string;
  personInn?: string;
  personMobilePhone?: string;
  personSNILS?: string;
  personSnils?: string;
  personType?: string;
  principalDocuments?: string;
  registrationAddress?: string;
  snils?: string;
  soc?: Social[];
  systemAuthority?: string;
  userId?: number;
  userName?: string;
  userType?: string;
  // Кастомные поля
  isKid?: boolean; // Флаг принадлежности УЗ к типу "Ребенок"
  authorized?: boolean; // Флаг наличия авторизации
  level?: 1 | 2 | 3; // Уровень УЗ пользователя
  fullName?: string; // Фамилия Имя Отчество
  shortName?: string; // Фамилия И. О.
  type?: string; // Тип пользователя - ЮЛ, ИП, ОГВ, физик
  typeParams?: UserTypeParams; // Параметры в зависимости от типа пользователя
  error?: boolean;
}

export interface CategoryUser {
  id: number;
  name: string;
}
