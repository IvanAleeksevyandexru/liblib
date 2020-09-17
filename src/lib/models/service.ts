export interface StateOrg {
  id: string;
  ico: string;
  title: string;
  shortTitle?: string;
}

export class Department {
  public id: string;
  public code: string;
  public title: string;
  public href: string;
  public shortTitle: string;

  constructor(stateOrg: StateOrg, host: string) {
    this.id = stateOrg.id;
    this.code = stateOrg.ico;
    this.title = stateOrg.title;
    this.shortTitle = stateOrg.shortTitle;
    this.href = `${host}/structure/${this.id}`;
  }
}

export interface Passport extends CatalogMainStructure {
  colorCode: string;
  mnemonicDescription: string;
}

export interface Service extends CatalogMainStructure { // TODO: Провалидировать интерфейс
  habsForPassport: {
    habEpguCode: string;
    habContent: string;
    habShortTitle: string;
    habTitle: string;
    icons: Icons[];
  }[];
}

interface CatalogMainStructure {
  additionalAttributes: AdditionalAttributes[]
  consulting: PassportConsulting;
  description: PassportDescription;
  docs: PassportDocs;
  error?: boolean;
  isInformat: boolean;
  passport: InsidePassport;
  places: any[];
  responseType: string;
  ssn: number;
  stateOrg: StateOrg[];
  version: number;
}

interface PassportConsulting {
  procedureTitle: string;
  expertComment: any;
  legalActs: {
    success: true;
    items: any[];
  };
  admReglament: {
    items: any[];
  },
  qualityIndicators: {
    items: any[];
  };
  admProcedure: {
    items: any[];
  };
  participants: any[];
}

interface AdditionalAttributes {
  name: string;
  value: string;
}

interface PassportDescription {
  gisDoTargetExtId: string;
  gisDoStateStructureExtId: string;
  gisdo: boolean;
  isFunction: false;
  isInteragency: false;
  fullName: string;
  officialName: string;
  eserviceOnline: true;
  procedureTitle: string;
  recipientCodes: string[];
  timeTerm: any;
  recipients: any[];
  online: true;
  admLevel: string;
  results: any;
  hrTitle: string;
  ordering: {
    url: string
    formStatus: string;
    outCommForms: any[];
    inCommForms: any[];
  };
  reasonsInfo: {
    rejectReasons: {
      grounds: any[];
    }
  };
  paymentInfo: {
    free: string;
    description: string;
    payments: {
      title: string;
      type: string;
      value: string;
    }[];
  }
}

interface PassportDocs {
  scenarios: any[],
  inDocs: any[],
  docGroups?: any[]
}

export interface InsidePassport {
  id: string;
  epguId: string;
  title: string;
  updated: string
  currentServiceTargetExtId: string;
  epguPassport: false;
  passportType: string;
  shortTitle: string;
  concentratorHabSimplePassports: InsidePassportConcentratorHabSimplePassports;
  services: InsideServices[];
}

interface InsidePassportConcentratorHabSimplePassports {
  responseType: string;
  description: string;
  shortTitle: string;
  title: string;
  habPassport: {
    stateStructureTitle: string;
    admLevelId: number;
    stateStructureId: string;
    passports: {
      id: string;
      epguId: string;
      isHab: false;
      catalogTitle: string;
      pId: number;
      passportType: string;
      shortTitle: string;
      title: string;
      descr: string;
      epguPassport: false;
      stateStructure: string;
      admLevel: number,
      stateStructureId: string;
    }[];
  }[];
  icons: Icons[];
}

export interface InsideServices {
  id: {
    eid: string,
    lid: string
  };
  epguId: string;
  externalUrl: string;
  fullTitle: string;
  infoFormPortalVersion: string;
  title: string;
  eserviceOnline: true;
  url: string;
  selectedByLid: true;
  online: true;
  serviceRecipients: string;
  selected: true;
  portalVersion: string;
  hasEqueue: false;
  mnemonicDescription: string;
}

interface Icons {
  path: string,
  iconType: string
}

export interface IServiceDetails {
  SHOW_FEEDS?: boolean;
  EPGU_CODE?: string;
  ADM_LEVEL?: string;
  PASSPORT_EXT_ID?: string;
  ADM_LEVEL_CODE?: string;
  new_fs?: boolean;
  SERVICE_RECIPIENT?: string;
  stateStructureNameFeed?: boolean;
  PASS_CODE?: string;
  ALLOWED_CACHE?: boolean;
  COMMON_SERVICE_ID?: number;
  PASSPORT_NAME?: string;
  INFO_FORM_PORTAL_VER?: string;
  supportsDS?: string;
  hideLinkOnServiceFeed?: boolean;
}
interface IGetPassportRequest {
  id: string;
  ignorePlatform?: boolean;
}

export class GetPassportRequest implements IGetPassportRequest {
  public id: string;
  public ignorePlatform: boolean;

  constructor(id: string, ignorePlatform?: boolean) {
    this.id = id;
    this.ignorePlatform = ignorePlatform || false;
  }
}


interface IGetServiceRequest {
  sid: string;
  eid: string;
  ignorePlatform: boolean;
  oldStyle: boolean;
  isManual: boolean;
}

export class GetServiceRequest implements IGetServiceRequest {
  public sid: string;
  public eid: string;
  public ignorePlatform: boolean;
  public oldStyle: boolean;
  public isManual: boolean;

  constructor(sid: string, eid?: string, ignorePlatform?: boolean, oldStyle?: boolean, isManual?: boolean) {
    this.sid = sid;
    this.eid = eid || '';
    this.ignorePlatform = ignorePlatform || false;
    this.oldStyle = oldStyle || false;
    this.isManual = isManual || false;
  }
}
