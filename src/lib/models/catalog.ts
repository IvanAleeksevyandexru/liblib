
export interface PopularFederal {
  code: string;
  description: string;
  icons?: CatalogServiceIcon[];
  elements?: CatalogServiceElement[];
  categories?: CatalogServiceCategory[];
  name: string;
  orderNumber?: number;
  parentCode?: string;
}

export interface CatalogServiceCategory {
  code: string;
  parentCode: string;
  name: string;
  orderNumber?: number;
  icons: CatalogServiceIcon[];
  elements: CatalogServiceElement[];
  otherPopularMore?: any;
}

export interface CatalogServiceElement {
  code: number;
  description?: string;
  icons?: CatalogServiceIcon[];
  name: string;
  type: string;
  url: string;
}

export interface CatalogServiceIcon {
  url: string;
  type: string;
}

export interface Icon {
  path: string;
  iconType: string;
}

export interface Children {
  id: number;
  code: string;
  title: string;
  parentId: number;
  passports: PassportChildren[];
  icons?: Icon[];
  otherPopularMore?: any;
}

export interface PassportChildren {
  pId: number;
  id: string;
  epguId: string;
  title: string;
  shortTitle: string;
  catalogTitle: string;
  descr: string;
  stateStructureId: string;
  stateStructure: string;
  icons: Icon[];
  epguPassport: boolean;
  passportType: string;
  isHab: boolean;
}

export interface RegionalPopular {
  type: string;
  code: string;
  name: string;
  orderNumber: number;
  url: string;
}

export interface Faqs {
  news: {
    items: NewsItem[]
  };
  faqCategories: {
    items: FaqCategoriesItem[]
  };
  faq: {
    items: FaqItem[]
  };
  ls: {
    items: LsItem[]
  };
}

export interface LsItem {
  orderNumber: number;
  code: string;
  children: LsChildren[];
}

export interface LsChildren {
  code: string;
  children: any[];
  link: string;
  title: string;
}

export interface FaqItem {
  longAnswer: string;
  shortQuestion: string;
  code: string;
  orderNumber: number;
  question: string;
  answer: string;
  viewPso: boolean;
  link: string;
  fav: boolean;
  shortAnswer: string;
  active?: boolean;
}

export interface FaqCategoriesItem {
  code: string;
  orderNumber: number;
  link: string;
  title: string;
}

export interface NewsItem {
  iconTitle: string;
  orderNumber: boolean;
  code: string;
  shortText: string;
  link: string;
  icon: string;
  viewsCount: boolean;
  title: string;
  epguUrlTitle: string;
  pubDate: string;
  iconAlt: string;
}

export interface DepartmentsData {
  letter?: string;
  more?: any;
  data: Departments[];
}

export interface Departments {
  code: string;
  name: string;
  more?: any;
  orderNumber: number;
  icons?: CatalogServiceIcon[];
  objects: CatalogServiceDepartment[];
}

export interface CatalogServiceDepartment {
  type: string;
  code: string;
  name: string;
  orderNumber: number;
  url: string;
}

export interface FaqCategories {
  faqCategories?: {
    items: FaqCategoriesItem[];
  }
}

export interface FaqCategoriesCMS {
  children: FaqCategoriesCMSChildren[];
  code: string;
  faqs: FaqCategoriesCMSFaq[];
  id: number;
  orderNumber: number;
  parentId: number;
  title: string;
  faqsMore?: any;
}

export interface FaqCategoriesCMSChildren {
  code: string;
  faqs: FaqCategoriesCMSFaq[];
  id: number
  orderNumber: number;
  parentId: number;
  title: string;
}

export interface FaqCategoriesCMSFaq {
  answer: string;
  categoryCode: string;
  categoryId: number;
  code: string;
  id: number;
  orderNumber: number;
  personType: string[];
  question: string;
  shortAnswer: string;
  shortQuestion?: string;
  active?: boolean;
}

export interface CatalogData{
  ico: string;
  title: string;
  code: string;
  active?: boolean;
  mainActive?: boolean;
  sideActive?: boolean;
  viewType?: string;
}
