export interface SuggestionsResponse {
  normalized: NormalizedData;
  suggestions: Suggestions;
}


export interface NormalizedData {
  address: NormalizedAddress;
  dadataQc: string;
  dadataQcComplete: string;
  dadataQcHouse: string;
  error: { code: number, message: string };
  fiasLevel: string;
  geo_lat: string;
  geo_lon: string;
  okato: string;
  oktmo: string;
  postalBox: string;
  postalCode: string;
  regionKladrId: string;
  tax_office: string;
  unparsedParts: string;
}

export interface Suggestions {
  addresses: Array<Addresses>;
  error: { code: number, message: string };
}


export interface Addresses {
  address: string;
  code: string;
  level: number;
}

export interface NormalizedAddress {
  elements: Array<NormalizedAddressElement>;
  fiasCode: string;
  fullAddress: string;
  numericFiasCode: number;
  postIndex: string;
}

export interface NormalizedAddressElement {
  data: string;
  elmCode: string;
  fiasCode: string;
  kladrCode: string;
  level: number;
  levelType: string;
  numericFiasCode: string;
  oktmoCode: string;
  shortType: string;
  type: string;
}

export interface FormState {
  visible: boolean;
  isInvalid: boolean;
  errorMessage?: any;
  code?: string;
  unparsed?: boolean;
}

export interface DadataResult {
  fullAddress: string;
  addressStr: string;
  lat: string;
  lng: string;
  fiasCode: string;
  hasErrors: boolean;
  region: string;
  city: string;
  district: string;
  town: string;
  inCityDist: string;
  street: string;
  additionalArea: string;
  additionalStreet: string;
  house: string;
  houseCheckbox: boolean;
  houseCheckboxClosed: boolean;
  building1: string;
  building2: string;
  apartment: string;
  apartmentCheckbox: boolean;
  apartmentCheckboxClosed: boolean;
  index: string;
  type?: 'PLV' | 'PRG' | 'OPS' | 'OLG';
}

export class FormConfig {
  private defaultState = {
    visible: true,
    isInvalid: false,
  };

  public region: FormState;
  public city: FormState;
  public district: FormState;
  public town: FormState;
  public inCityDist: FormState;
  public street: FormState;
  public additionalArea: FormState;
  public additionalStreet: FormState;
  public house: FormState;
  public building1: FormState;
  public building2: FormState;
  public apartment: FormState;
  public index: FormState;


  constructor(isOrg: boolean) {
    this.region = Object.assign({...this.defaultState, code: 'DADATA.NEED_REGION'});
    this.city = Object.assign({...this.defaultState, code: 'DADATA.NEED_CITY'});
    this.district = Object.assign({...this.defaultState, code: 'DADATA.NEED_DISTRICT'});
    this.town = Object.assign({...this.defaultState, code: 'DADATA.NEED_TOWN'});
    this.inCityDist = Object.assign({...this.defaultState, code: 'DADATA.NEED_IN_CITY_DIST'});
    this.street = Object.assign({...this.defaultState, code: 'DADATA.NEED_STREET'});
    this.additionalArea = Object.assign({...this.defaultState, code: 'DADATA.NEED_ADDITIONAL_AREA'});
    this.additionalStreet = Object.assign({
      ...this.defaultState, code: 'DADATA.NEED_ADDITIONAL_STREET'
    });
    this.house = Object.assign({
      ...this.defaultState, code: 'DADATA.NEED_HOUSE', unparsed: true
    });
    this.building1 = Object.assign({...this.defaultState, code: 'DADATA.NEED_BUILDING1'});
    this.building2 = Object.assign({...this.defaultState, code: 'DADATA.NEED_BUILDING2'});
    this.apartment = Object.assign({
      ...this.defaultState, code: isOrg ? 'DADATA.NEED_APARTMENT_OTHER_CASE' : 'DADATA.NEED_APARTMENT', unparsed: true
    });
    this.index = Object.assign({...this.defaultState, code: 'DADATA.NEED_INDEX'});
  }
}
