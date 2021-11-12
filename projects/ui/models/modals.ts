import { ModalButtonType } from './button';

export interface IConfirmActionModal {
  title: string;
  description: string;
  buttons: ModalButtonType[];
}
