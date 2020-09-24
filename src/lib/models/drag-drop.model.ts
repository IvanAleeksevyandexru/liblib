import { ElementRef } from '@angular/core';

export enum DragDropType {
  MOUSE = 'MOUSE', // драг мышью
  TOUCH = 'TOUCH', // драг тачем,
  BOTH = 'BOTH' // и тем и другим
}

export enum DragDropDirection {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

export enum DragDropOffsetType {
  POSITION = 'POSITION', // оффсет задается свойством left/top
  TRANSFORM = 'TRANSFORM', // оффесет задается свойством transform translateX/Y
  SCROLL = 'SCROLL'
}

export interface DragDropBinding {

  type: DragDropType;
  direction: DragDropDirection;
  offsetType: DragDropOffsetType;
  // внимание! предполагается что parent фида - это вьюпорт, он же видимая область к нему привязывается mousedown/touchstart
  feedElement: ElementRef;
  limit?: boolean; // ограничение перетаскивания дальше длины ленты
  containerDimension?: number; // ширина вьюпорта и фрейма (если не указана в itemSize)
  itemDimension?: number; // ширина фрейма
  itemsDistance?: number; // расстояние между итемами в ленте (для ситуации когда отступ не включен в ширину)
  // выравнивание активного фрейма (элемента ленты), выравнивание происходит по фреймам - элементам ленты равным вьюпорту
  centeringNeeded: boolean;
  centeringThreshold?: number; // минимальный процент целой пройденной ширины/высоты элемента для завершающей/откатывающей анимации
  centeringDuration?: number; // длительность анимации выравнивания после того как палец/мышь отпущены
  cleanUp?: boolean; // удаление инлайн стилей драга по окончании драга/центровки
  dragStart?: (state: DragState) => void; // лиснер начала перетаскивания
  dragProgress?: (state: DragState) => void; // события движения мыши/тача между dragStart и dragRelease
  dragRelease?: (state: DragState) => void; // окончание удерживания мыши/тача
  dragEnd?: (state: DragState) => void; // завершения анимации установления активного элемента
}

export class DragState {

  // заполняются изначально
  public request: DragDropBinding;
  public initialOffset: number; // начальное смещение ленты относительно контейнера в px
  public dragStartPosition: number; // точка начала перемещения
  public mouseInitiated: boolean = undefined; // инициировано мышью или тачем
  public containerDimension: number; // ширина или высота контейнера
  public itemDimension: number; // ширина или высота фрейма
  public feedDimension: number; // ширина или высота ленты
  public frameDimension: number; // "рамка" контейнера вокруг фрейма если контейнер шире
  public initiallySelected: number;
  // заполняются по смещению
  public shifted = false; // факт изменения позиции (приема хотя бы одного move сообщения)
  public offset: number; // текущее смещение ленты
  public shift: number; // текущее изменение смещения относительно начального
  public relativeShift: number; // shift / containerDimension, сколько целых элементов пролистнуто
  public dragForward: boolean = undefined; // sign(shift), направление смещения
  public visible: Array<number> = []; // индексы видимых во вьюпорте
  public active: Array<number> = []; // индексы активных элементов в ленте (тех которые видны полностью)
  public selected: number; // индекс "центрального" элемента
  // заполняются по окончанию
  public released = false; // кнопка/палец отпущены
  public done = false; // анимация после релиза завершена
  public animatedForward: boolean = undefined; // анимация была к следующему в ленте (лента "докрутилась") или к предыдущему ("откатилась")
}
