import { ElementRef } from '@angular/core';

export enum VerticalAlign {
  TOP_TO_BOTTOM = 'TOP_TO_BOTTOM', // верх Б по низу А
  BOTTOM_TO_TOP = 'BOTTOM_TO_TOP', // низ Б по верху А
  TOP_TO_TOP = 'TOP_TO_TOP', // верх Б по верху А
  BOTTOM_TO_BOTTOM = 'BOTTOM_TO_BOTTOM' // низ Б по низу А
}

export enum HorizontalAlign {
  LEFT_TO_RIGHT = 'LEFT_TO_RIGHT', // левый край Б по правому краю А
  RIGHT_TO_LEFT = 'RIGHT_TO_LEFT', // правый край Б по левому краю А
  LEFT_TO_LEFT = 'LEFT_TO_LEFT', // левый край по левому краю
  RIGHT_TO_RIGHT = 'RIGHT_TO_RIGHT' // правый край по правому краю
}

export interface PositioningRequest {

  master: ElementRef;
  slave: ElementRef;
  alignX?: HorizontalAlign;
  alignY?: VerticalAlign;
  offsetX?: number;
  offsetY?: number;
  width?: string;
  minWidth?: string;
  destroyOnScroll?: boolean;
  destroyCallback?: () => void;

}
