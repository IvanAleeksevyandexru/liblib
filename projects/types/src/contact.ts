import { VrfStu, VrfValStu } from '@epgu/types';

export type ContactType = 'EML' | 'MBT' | 'PHN' | 'OPH' | 'OEM' | 'OFX' | 'CEM' | 'CPH';

export interface Contact {
  eTag?: number;
  id?: number;
  stateFacts?: string[];
  type: ContactType;
  value: string;
  vrfStu: VrfStu;
  isCfmCodeExpired?: boolean;
  verifyingValue?: string;
  vrfValStu?: VrfValStu;
  vrfDays?: any;
  vrfDate?: any;
  errMsg?: any;
  repeatTime?: any;
  repeatCount?: any;
}

export interface CorpContact {
  id: number;
  oph: string;
  simActiv: 'Y' | 'NO_ANSWER' | 'REFUSE' | 'DEACTIV';
  orgName: string;
  hidden: boolean;
}
