export interface Action {
  title: string;
  href?: string;
  handler?: () => void;
}
