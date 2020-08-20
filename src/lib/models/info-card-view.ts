export interface InfoCardView {
  attrId?: string;
  canDetails: boolean;
  canEdit: boolean;
  canDelete?: boolean;
  canRepeat?: boolean;
  mobileDetailsHeightClass?: string;
  withVerificationIcon?: boolean;
  detailsPath?: string;
  detailsLinkTitle?: string;
  vrfStu?: string;
  type?: string;
  detailsQueryParam?: { [key: string]: string };
  notification?: string;
  statusMessage?: string;
  warning?: boolean;
  expired?: boolean;
  serviceUrl?: string;
  idDoc?: boolean;
  empty?: {
    title?: string;
    subtitle?: string;
  };
  full: {
    title?: string;
    orderTitle?: string;
  };
  gender?: string;
  fields: {
    title: string;
    showEmpty?: boolean;
    noLabel?: boolean;
    value: string;
    bold?: boolean;
    hidden?: boolean;
  }[];
  metric?: {
    [key: string]: {
      name: string,
      params: any
    }
  };
}
