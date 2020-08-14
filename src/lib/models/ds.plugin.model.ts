export interface DsCheckPluginData {
  version: string;
}
export interface DsChallengeData {
  challenge: string;
}

export interface DsSignResult {
  certificate: string;
  id: string;
  sign: string;
}

export interface EdsItem {
  index?: number;
  commonName: string;
  issuer: string;
  subjectSurname: string;
  subjectName: string;
  validFrom: string;
  validTo: string;
}
