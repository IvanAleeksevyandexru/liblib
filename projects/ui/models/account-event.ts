export type AccountEventType =
  'ANY' |
  'LOGIN' |
  'LOGIN_SSO' |
  'SELECT_ORG' |
  'LOGOUT' |
  'ACCOUNT_RECOVERY' |
  'PASSWORD_CHANGE' |
  'OTP_ENABLE' |
  'OTP_DISABLE' |
  'SECRET_QUESTION_CHANGE' |
  'SECRET_QUESTION_REMOVE' |
  'DS_LOGIN_AVAILABILITY_CHANGE' |
  'MOBILE_CONFIRM' |
  'EMAIL_CONFIRM';

export interface AccountEvents {
  elements: AccountEvent[];
  size: number;
  stateFacts: string[];
}

export interface AccountEvent {
  clientIp: string;
  entity: string;
  entityName: string;
  stateFacts?: string[];
  system: string;
  terminal: string;
  time: string;
  type: AccountEventType;
}
