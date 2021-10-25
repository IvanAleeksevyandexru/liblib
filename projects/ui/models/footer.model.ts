export interface IFooter {
  socialLinks: boolean;
  blocks: IBlock[];
}

export interface IBlock {
  title: string;
  hideMobile?: boolean;
  hideTablet?: boolean;
  hideDesktop?: boolean;
  links: {
    title: string;
    url: string;
    target?: '_blank' | '_self';
  }[];
  apps?: string[];
}
