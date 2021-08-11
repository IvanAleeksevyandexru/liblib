export interface SocialContainer {
  stateFacts?: string[];
  size: number;
  elements: Social[];
}

export interface Social {
  id?: number;
  stateFacts?: string[];
  channel?: SocialChannel;
  status?: ChannelStatus;
  userId?: string;
  code?: string;
  lifetime?: any;
}

export enum SocialChannel {
  VK = 'vk',
  OK = 'ok',
  VB = 'vb'
}

export enum ChannelStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected'
}
