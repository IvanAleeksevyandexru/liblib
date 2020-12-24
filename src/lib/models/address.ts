export interface Address {
  eTag?: string;
  id?: number;
  stateFacts?: string[];
  vrfDdt?: string;
  type: 'PLV' | 'PRG' | 'OPS' | 'OLG';
  addressStr?: string;
  city?: string;
  countryId?: string;
  fiasCode?: string;
  region?: string;
  area?: string;
  district?: string;
  settlement?: string;
  street?: string;
  house?: string;
  building?: string;
  frame?: string;
  flat?: string;
  zipCode?: string;
  additionArea?: string;
  additionAreaStreet?: string;
}

export interface ConfirmAddress {
  postErr?: string;
  address?: Address;
  generatedOn?: number;
  trackingNumber?: number;
  // Кастомные поля
  resendFrom?: string;
  resendAllowed?: boolean;
}

export interface CountryDict {
  name: string;
  size: number;
  stateFacts: string[];
  values: Country[];
}

export interface Country {
  char2Code: string;
  char3Code: string;
  extId: string;
  msgKey: string;
  name: string;
  postDelivered: boolean;
}
