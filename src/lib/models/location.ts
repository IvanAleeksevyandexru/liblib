export interface Region {
  code: string;
  codes?: Array<string>;
  detectedBy?: string;
  name: string;
  path: string;
  timeZone: string;
}

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface RegionSuggestion {
  code: string;
  codes?: Array<string>;
  name: string;
  path: string;
}

export interface CoordsWithAddress {
  latitude: number;
  longitude: number;
  address: string;
}

export interface AddressToCoords {
  coords: CoordsWithAddress[];
  error: string | null;
}

export interface RegionMfc {
  id: number;
  region: string;
  routeCode: string;
  equeueAllowed: boolean;
  expressDelivery: boolean;
  active: boolean;
}
