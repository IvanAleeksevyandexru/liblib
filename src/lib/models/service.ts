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

export interface Service { // TODO: Провалидировать интерфейс
  error?: boolean;
  responseType: string;
  version: number;
  ssn: number;
  isInformat: false;
  places: any[];
  stateOrg: StateOrg[];
  docs: {
    scenarios: any[],
    inDocs: any[]
  };
  passport: {
    id: string;
    epguId: string;
    title: string;
    updated: string
    currentServiceTargetExtId: string;
    epguPassport: false;
    passportType: string;
    shortTitle: string;
    concentratorHabSimplePassports: {
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
      icons: {
        path: string,
        iconType: string
      }[];
    };
    services: {
      id: {
        eid: string,
        lid: string
      };
      epguId: string;
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
    }[];
  };
  consulting: {
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
  };
  description: {
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
  };
  habsForPassport: {
    habEpguCode: string;
    habContent: string;
    habShortTitle: string;
    habTitle: string;
    icons: {
      path: string;
      iconType: string;
    }[];
  }[];
  additionalAttributes: {
    name: string;
    value: string;
  }[];
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
