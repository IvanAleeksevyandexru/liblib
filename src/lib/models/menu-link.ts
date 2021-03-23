export interface MenuLink {
  url: string;
  title: string;
  listeners?: boolean;
  mnemonic?: string;
  handler?: (MenuLink) => void;
}

export interface UserRole {
  name: string;
  secondName?: string;
  url: string;
  code: string;
  isActive?: boolean;
  click?: () => void;
}
