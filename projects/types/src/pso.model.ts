export interface PageResponseModel {
  authenticated: boolean;
  data: string;
  token: string;
}

export interface PsoInitializationData {
  url: string;
  data: string;
  token: string;
  userType?: string;
}
