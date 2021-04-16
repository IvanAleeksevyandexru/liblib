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
  regionKladr: string;
  regionFias: string;
  regionType: string;
  regionShortType: string;
  city: string;
  cityKladr: string;
  cityFias: string;
  cityType: string;
  cityShortType: string;
  district: string;
  districtKladr: string;
  districtFias: string;
  districtType: string;
  districtShortType: string;
  town: string;
  townKladr: string;
  townFias: string;
  townType: string;
  townShortType: string;
  inCityDist: string;
  inCityDistKladr: string;
  inCityDistFias: string;
  inCityDistType: string;
  inCityDistShortType: string;
  street: string;
  streetKladr: string;
  streetFias: string;
  streetType: string;
  streetShortType: string;
  additionalArea: string;
  additionalAreaKladr: string;
  additionalAreaFias: string;
  additionalAreaType: string;
  additionalAreaShortType: string;
  additionalStreet: string;
  additionalStreetKladr: string;
  additionalStreetFias: string;
  additionalStreetType: string;
  additionalStreetShortType: string;
  house: string;
  houseKladr: string;
  houseFias: string;
  houseType: string;
  houseShortType: string;
  houseCheckbox: boolean;
  houseCheckboxClosed: boolean;
  building1: string;
  building1Kladr: string;
  building1Fias: string;
  building1Type: string;
  building1ShortType: string;
  building2: string;
  building2Kladr: string;
  building2Fias: string;
  building2Type: string;
  building2ShortType: string;
  apartment: string;
  apartmentKladr: string;
  apartmentFias: string;
  apartmentType: string;
  apartmentShortType: string;
  apartmentCheckbox: boolean;
  apartmentCheckboxClosed: boolean;
  index: string;
  type?: 'PLV' | 'PRG' | 'OPS' | 'OLG' | 'PTA';
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
