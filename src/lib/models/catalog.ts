export interface PopularFederal {
  id: number;
  code: string;
  title: string;
  description: string;
  icons: Icon[];
  children: Children[];
  passports: PassportChildren[];
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
  admLevel: number;
  catalogTitle: string;
  descr: string;
  epguId: string;
  epguPassport: boolean;
  id: string;
  isHab: boolean;
  pId: number;
  passportType: string;
  shortTitle: string;
  stateStructure: string;
  stateStructureId: string;
  title: string;
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

export interface Departments {
  categoryCode: string;
  categoryName: string;
  categorytId: number;
  icons: Icon[];
  passports: DepartmentPassport[];
}

export interface DepartmentPassport {
  categorytId: number;
  passportId: number;
  passportTitle: string;
  shortName: string;
  url: string;
}

export interface FaqCategories {
  faqCategories: {
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
  url: string;
  title: string;
  code: string;
  active?: boolean;
  mainActive?: boolean;
  sideActive?: boolean;
  viewType?: string;
}
