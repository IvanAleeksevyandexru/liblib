export interface SmuEvent {
  eventType: string;
  eventParams: SmuParam[];
}

export interface SmuParam {
  key: string;
  value: string | boolean;
}

export interface SmuParamsAsObj {
  [name: string]: string | boolean;
}

export class SmuEventRequest implements SmuEvent {
  public eventType: string;
  public eventParams: SmuParam[];

  constructor(type: string, params?: SmuParamsAsObj) {
    this.eventType = type;
    let eventParams = [];
    if (params) {
      Object.keys(params).forEach((key) => {
        eventParams.push({key: key, value: params[key]})
      });
    }
    this.eventParams = eventParams;
  }
}
