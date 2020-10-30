export interface MenuLink {
  url: string;
  title: string;
  listeners?: boolean;
  mnemonic?: string;
  handler?: (MenuLink) => void;
}
