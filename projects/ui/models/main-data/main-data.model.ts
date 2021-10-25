// ToDo: Идет задвоение моделей: main-page и main-data
// В задетом месте стала использовать боее полную модель main-page
// Обнаружила при правке футера

import { IFooter } from '@epgu/ui/models';

export interface IMainData {
  catalog: ICatalog[];
  search: ISearch;
  payments: IPayment[];
  ls: ILs[];
  footer: IFooter;
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
