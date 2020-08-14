import { VrfStu, VrfValStu } from './verifying-status';

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
}
