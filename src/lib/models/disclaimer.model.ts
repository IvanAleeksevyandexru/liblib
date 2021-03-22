export interface DisclaimerInterface {
  code?: string;
  endDate?: string;
  id: number;
  level: string;
  messages: Array<DisclaimerMessageInterface>;
  mnemonic: string;
  notificationEnabled: boolean;
  reason?: string;
  reasonId?: string | number;
  region: string;
  startDate?: string;
  isPriority?: boolean;
  isHidden?: boolean;
}

export interface DisclaimerMessageInterface {
  language: string;
  message: string;
}

export class Disclaimer {
  public id: number;
  public level: string;
  public message: string;
  public mnemonic: string;
  public notificationEnabled: boolean;
  public show?: boolean;
  public loading?: boolean;
  public readOnly?: boolean;
  public noticeText?: string;
  public noticeEmail?: string;
  public isPriority?: boolean;
  public isHidden?: boolean;

  constructor(data: DisclaimerInterface) {
    const getMessage = (messages: Array<DisclaimerMessageInterface>): string => {
      return messages.find((elem) => {
          return elem.language.toLowerCase() === 'ru';
        }
      ).message || '';
    };

    this.id = data.id;
    this.level = data.level.toLowerCase();
    this.mnemonic = data.mnemonic;
    this.notificationEnabled = data.notificationEnabled;
    this.message = getMessage(data.messages);
    this.isPriority = data.isPriority;
    this.isHidden = data.isHidden;
  }

}
