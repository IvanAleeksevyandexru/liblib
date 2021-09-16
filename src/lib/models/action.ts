export interface Action {
  title: string;
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  handler?: () => void;
}
