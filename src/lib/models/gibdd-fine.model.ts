import { SliderImage } from './slider-image';

export interface GibddDetailsResponse {
  error: {
    code: number;
    message: string;
  };
  content: GibddDetails;
}

export interface GibddDetails {
  status?: number;
  uin?: string;
  carNumber?: string;
  carModel?: string;
  offense?: string;
  violationDate?: string;
  violationTime?: string;
  docNum?: string;
  docDate?: string;
  deptCode?: string;
  offenseDivision?: string;
  offenseDivisionName?: string;
  signature?: string;
  stsNumber?: string;
  hasPhoto?: boolean;
  appeal?: number;
  deliveryDate?: any;
}

export interface ExtendedGibddDetails extends GibddDetails {
  mapCenter?: number[];
  images?: SliderImage[];
  violationFullDate?: string;
  regCertificate?: string;
  perhapsOverdue?: string;
  act?: string;
  offenseDivisionCode?: string;
}

export interface GibddPhotoRequestParams {
  uin: string;
  md5: string;
  reg: string;
  div?: string;
}

export interface GibddPhotoResponse {
  code?: string;
  comment?: string;
  photos: {
    base64Value: string;
    type: number;
  }[];
  hostname?: string;
  reqToken?: string;
  requestTime?: string;
  version?: string;
}
