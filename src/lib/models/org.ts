export interface Org {
  branchesCount?: number;
  created?: string;
  employees?: any[]; // TODO: убрать any
  etag?: string;
  fullName?: string;
  inn?: string;
  leg?: string;
  legCode?: string;
  ogrn?: string;
  oid?: string;
  shortName?: string;
  staffCount?: number;
  type?: string;
}
