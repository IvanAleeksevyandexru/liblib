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
}

export interface GibddError {
  code?: number;
  message?: string;
}

export interface Gibdd {
  error?: GibddError;
  content?: GibddDetails;
}

export interface GibddPhoto {
  base64Value?: string;
  type?: number;
}

export interface GibddPhotoData {
  requestTime?: string;
  hostname?: string;
  code?: string;
  reqToken?: string;
  comment?: string;
  photos?: GibddPhoto[];
  version?: string;
}
