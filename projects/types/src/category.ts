export interface Category {
  id: number;
  code: string;
  title: string;
  description?: string;
  icons?: {
    path: string;
    iconType: string;
  }[];
}
