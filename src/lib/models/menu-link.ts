export type IconType = 'bell' | 'doc' | 'edit' | 'wallet' | 'hand-break' | 'digital-assistant' | 'aim' | 'clerk' | 'power'
  | 'enter' | 'folders' | 'letter' | 'clock';

export interface MenuLink {
  url?: string;
  title: string;
  listeners?: boolean;
  mnemonic?: string;
  handler?: (MenuLink) => void;
  icon?: IconType;
  trusted?: boolean;
}

export interface UserRole {
  name: string;
  secondName?: string;
  url: string;
  code: string;
  isActive?: boolean;
  click?: () => void;
}
