import { IFooter } from '@epgu/ui/models';

export interface IMainData {
  catalog: ICatalog[];
  search: ISearch;
  payments: IPayment[];
  ls: ILs[]; // артефакт
  footer: IFooter;
  life: ILife[];
}

export interface ICatalog{
  ico: string;
  title: string;
  code: string;
  active?: boolean;
}

export interface ISearch {
  placeholder: string;
  example: string[];
  offers: IOffer[];
}

export interface IOffer {
  ico: string;
  title: string;
  url: string;
}

export interface IPayment {
  ico: string;
  title: string;
  url: string;
  subtitle: string;
}

export interface ILs {
  ico: string;
  title: string;
  url: string;
}

export interface INewsOverride {
  ico: string;
  code: string;
}

export interface ILife {
  code: string;
  created: string; // format 2021-09-21
  icon: string;
  pubDate: string; // format 2021-07-28
  type: 'news' | 'life';
  updated: string; // format 2021-09-21
  title: string;
}
