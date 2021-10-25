export interface MainPageContentInterface {
  banners: Array<BannerInterface>;
  faq: Array<FaqInterface>;
  footer: FooterInterface;
  ls: Array<LifeSituationInterface>;
  news: NewsInterface;
  popular: Array<PopularInterface>;
  popularAuth: Array<PopularInterface>;
  regionCases: RegionCasesInterface;
  searchConfig: SearchConfigInterface;
}

export interface BannerInterface {
  banners: Array<BannerItemInterface>;
  bgImage: string;
  group: string;
}

export interface BannerItemInterface {
  bgImage: string;
  closable: boolean;
  closed?: boolean;
  content: string;
  mnemonic: string;
  orderNumber: number;
}

export class Banner implements BannerItemInterface {

  constructor(plain: any) {
    this.bgImage = plain.bgImage;
    this.closable = plain.closable;
    if (plain.closed) {
      this.closed = !!plain.closed;
    }
    this.content = plain.content;
    this.mnemonic = plain.mnemonic;
    this.orderNumber = plain.orderNumber;
  }

  public bgImage: string;
  public closable: boolean;
  public closed?: boolean;
  public content: string;
  public mnemonic: string;
  public orderNumber: number;
}

export class BannerGroup implements BannerInterface {

  constructor(plain: any) {
    this.bgImage = plain.bgImage;
    this.group = plain.group;
    this.banners = plain.banners ? plain.banners.map((value: any) => value instanceof Banner ? value : new Banner(value)) : [];
  }

  public bgImage: string;
  public group: string;
  public banners: Array<Banner>;
}

export interface FaqInterface {
  faqs: Array<FaqItemInterface>;
  id: number;
  linkName: string;
  linkUrl: string;
  title: string;
}

export interface FaqItemInterface {
  answer: string;
  categoryCode: string;
  categoryId: number;
  code: string;
  id: number;
  metaDescription: string;
  metaKeyWords: string;
  metaTitle: string;
  orderNumber: number;
  personType: Array<string>;
  question: string;
  shortAnswer: string;
}

export interface FooterInterface {
  content: string;
}

export interface MainFooter {
  socialLinks?: boolean;
  blocks?: MainFooterBlock[];
}

export interface MainFooterBlock {
  title: string;
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
  links?: MainFooterBlockLink[];
}

export interface MainFooterBlockLink {
  title: string;
  url: string;
  newTab?: boolean;
  needReload?: boolean;
}

export interface LifeSituationInterface {
  description: string;
  icon: string;
  name: string;
  shortTitle: string;
  title: string;
  metaDescription?: string;
  metaKeyWords?: string;
  metaTitle?: string;
}

export interface NewsInterface {
  data: Array<NewsItemInterface>;
  total: number;
}

export interface NewsItemInterface {
  code: string;
  epguUrlTitle: string;
  icons: Array<NewsIconsInterface>;
  metaDescription: string;
  metaKeyWords: string;
  metaTitle: string;
  okato: string;
  personType: Array<string>;
  pubDate: number;
  repostCount: number;
  shortText: string;
  text: string;
  title: string;
}

export interface NewsIconsInterface {
  altTitle: string;
  type: string;
  url: string;
  urlTitle: string;
}

export interface PopularInterface {
  admLevel: number;
  catalogTitle: string;
  descr: string;
  epguId: string;
  epguPassport: boolean;
  epguUrlTitle: string;
  icons: Array<PopularIconInterface>;
  id: string;
  isHab: boolean;
  pId: number;
  passportType: string;
  shortTitle: string;
  title: string;
}

export interface PopularIconInterface {
  iconType: string;
  path: string;
}

export interface RegionCasesInterface {
  cases: Array<string>;
  okato: string;
}

export interface SearchConfigInterface {
  example: string;
  placeholder: string;
}

export interface Catalog{
  ico: string;
  title: string;
}
