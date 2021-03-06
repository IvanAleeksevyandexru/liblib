import { DocumentType } from '@epgu/ui/models/document';

export interface VehiclesContainer {
  eTag: string;
  stateFacts: string[];
  elements: Vehicle[];
  size?: number;
  pageSize?: number;
  pageIndex?: number;
  totalSize?: number;
}

export interface Vehicle {
  duplicate?: boolean;
  eTag?: string;
  id?: number;
  stateFacts?: string[];
  name?: string;
  numberPlate?: string;
  regCertificate?: {
    series: string;
    number: string;
  };
  vehicleCategory?: string;
  vin?: string;
  chassisNumber?: string;
  engineNumber?: string;
  bodyNumber?: string;
  brand?: string;
  model?: string;
  productionYear?: number;
  // Кастомные поля
  type?: DocumentType;
}

export interface Brand {
  id: number;
  manual: 'Y' | 'N';
  popular: 'Y' | 'N';
  title: string;
  vskId: string;
  // Кастомные поля
  text: string;
}

export interface Model {
  id: number;
  category: VehicleCategory;
  markId: number;
  title: string;
  manufacture: string;
  rsaId: number;
  vskId: string;
  manual: string;
  // Кастомные поля
  text: string;
}

export interface VehicleCategory {
  id: number;
  category: string;
  title: string;
  subCategory: string;
  // Кастомные поля
  text: string;
}

export interface ImportResponse {
  result: {
    total: number;
    success: number;
    failed: number;
  };
  report: InvalidVehicle[];
}

export interface InvalidVehicle {
  gos_number: InvalidVehicleField;
  auto_name: InvalidVehicleField;
  sts: InvalidVehicleField;
}

export interface InvalidVehicleField {
  value: string;
  errors?: {
    error_message: string;
    error_code: number;
  }[];
}
