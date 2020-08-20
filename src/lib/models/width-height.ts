// ширина в общем "цссном" виде с произвольными единицами измерения px, %, em
export interface Width {
  base?: string;
  min?: string;
  max?: string;
}

export interface Height {
  base?: string;
  min?: string;
  max?: string;
}

// программная ширина строго в пикселях
export interface PixelWidth {
  base?: number;
  min?: number;
  max?: number;
}

export interface PixelHeight {
  base?: number;
  min?: number;
  max?: number;
}
