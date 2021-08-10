export type SecurityOptionType =
  'dsLoginAllowed' |
  'answer' |
  'question' |
  'otp' |
  'otpChannel' |
  'password' |
  'challenge' |
  'signature';

export interface SecurityOptions {
  elements: SecurityOption[];
  stateFacts: [];
}

export interface SecurityOption {
  type: SecurityOptionType;
  value: string;
}

export interface SettingsOptions {
  channels: Channel[];
  events: EventChannel[];
  stateFacts: [];
}

export interface Channel {
  contact: string;
  type: string;
  value: boolean;
}

export interface EventChannel {
  type: string;
  value: string | boolean;
}

export interface State {
  state: boolean;
}
