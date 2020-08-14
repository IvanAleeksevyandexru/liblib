import { CounterData } from './counter';

export interface Tab {
  id?: string;
  name: string;
  url?: string;
  break?: boolean;
  children?: Tab[];
  access?: Array<any>;
  hidden?: boolean;
  counter?: CounterData;
  mnemonic?: string;
}

export interface LightTab {
  id: string;
  name: string;
  hidden?: boolean;
  active?: boolean;
}
