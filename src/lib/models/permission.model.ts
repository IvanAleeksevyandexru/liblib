export interface PermissionsContainer {
  stateFacts?: string[];
  elements: Permission[];
  size: number;
  pageSize: number;
  pageIndex: number;
  totalSize: number;
}

export interface Permission {
  stateFacts?: string[];
  id: number;
  personId: number;
  orgId: number;
  permissionId: number;
  sysname: string;
  name: string;
  description: string;
  orgShortName: string;
  ogrn: string;
  orgAddress: string;
  responsibleObject: string;
  expire?: number;
  expiredOn?: number;
  issuedOn?: number;
  status: 'A' | 'W' | 'D';
  createdOn: number;
  updatedOn: number;
  scopes: PermissionScopes;
  purposes: {
    stateFacts: string[];
    size: number;
    elements: {
      stateFacts: string[];
      sysname: string;
      name: string;
    }[];
  };
  actions: {
    stateFacts: string[];
    size: number;
    elements: {
      stateFacts: string[];
      sysname: string;
      name: string;
    }[];
  };
  // Кастомные поля
  firstActive?: true;
}

export interface PermissionScopes {
  stateFacts: string[];
  size: number;
  elements: PermissionScope[];
}

export interface PermissionScope {
  stateFacts: string[];
  sysname: string;
  name: string;
  required?: boolean;
  description: string;
  // Кастомные поля
  checked?: boolean;
}

export class PermissionScopes {
  public elements: PermissionScope[];

  constructor(data: PermissionScope[]) {
    data.map((scope: PermissionScope) => scope.checked = true);
    this.elements = data.sort((a: PermissionScope, b: PermissionScope) => {
      return a.required === b.required ? 0 : a.required ? -1 : 1;
    });
  }
}

export interface OfferSettings {
  showAnyForms: boolean;
  showPolicy: boolean;
  showOffer: boolean;
}
