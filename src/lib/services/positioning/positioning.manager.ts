import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConstantsService } from '../constants/constants.service';
import { PositioningRequest, HorizontalAlign, VerticalAlign } from '../../models/positioning';

export { PositioningRequest } from '../../models/positioning'; // реэкспорт для удобства

@Injectable({
  providedIn: 'root'
})
export class PositioningManager {

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private renderer: Renderer2;
  private requests: Array<PositioningRequest> = [];
  private subscriptions: Map<PositioningRequest, Array<Subscription>> = new Map();
  private subscriptionsActivity: Map<PositioningRequest, Array<Subject<boolean>>> = new Map();
  private globalScrollSubscription: Subscription = null;
  private globalScrollActivity: Subject<boolean> = null;

  public updateAbsoluteCoordinates(request: PositioningRequest) {
    const masterRect: ClientRect = request.master.nativeElement.getBoundingClientRect();
    const slaveRect: ClientRect = request.slave.nativeElement.getBoundingClientRect();
    const parentWidth = request.slave.nativeElement.parentElement.offsetWidth + 'px';
    this.renderer.setStyle(request.slave.nativeElement, 'width', request.width || parentWidth);
    this.renderer.setStyle(request.slave.nativeElement, 'minWidth', request.minWidth || parentWidth);
    if (request.alignX && request.alignX.startsWith('RIGHT')) {
      // необходимо сконвертировать right экранных координат (слева) в right css-а (справа документа за вычетом скроллбара)
      this.renderer.setStyle(request.slave.nativeElement, 'right',
      (document.body.clientWidth - (request.alignX.endsWith('LEFT') ? masterRect.left : masterRect.right)) + (request.offsetX || 0) + 'px');
      this.renderer.setStyle(request.slave.nativeElement, 'left', 'unset');
    } else {
      // используем установку left/right чтобы позиция была корректной независимо от успел ли отрендериться контент
      this.renderer.setStyle(request.slave.nativeElement, 'left',
        (request.alignX && request.alignX.endsWith('RIGHT') ? masterRect.right : masterRect.left) + (request.offsetX || 0) + 'px');
      this.renderer.setStyle(request.slave.nativeElement, 'right', 'unset');
    }
    if (request.alignY && request.alignY.startsWith('BOTTOM')) {
      // аналогично
      this.renderer.setStyle(request.slave.nativeElement, 'bottom',
        (window.innerHeight - (request.alignY.endsWith('TOP') ? masterRect.top : masterRect.bottom)) + (request.offsetY || 0) + 'px');
      this.renderer.setStyle(request.slave.nativeElement, 'top', 'unset');
    } else {
      this.renderer.setStyle(request.slave.nativeElement, 'top',
        (request.alignY && request.alignY.endsWith('TOP') ? masterRect.top : masterRect.bottom) + (request.offsetY || 0) + 'px');
      this.renderer.setStyle(request.slave.nativeElement, 'bottom', 'unset');
    }
  }

  // создание связи между master и slave. с этого момента slave на экране будет привязан к master
  public attach(request: PositioningRequest): void {
    if (!request || !request.master || !request.slave) {
      return;
    }
    const slave = request.slave;
    const master = request.master;
    this.renderer.setStyle(slave.nativeElement, 'position', 'fixed');
    const limitingContainers = [];
    ConstantsService.LIMITING_CONTAINERS_SELECTORS.forEach((limitingSelector: string) => {
      let limitingContainer = master.nativeElement.closest(limitingSelector);
      while (limitingContainer != null) {
        limitingContainers.push(limitingContainer);
        limitingContainer = limitingContainer.parentElement && limitingContainer.parentElement.closest(limitingSelector);
      }
    });
    // при присоединении slave к master мы начинаем следить за скроллом нашего контейнера и всего документа,
    // т.к. элементы уже не связаны (в плане позиционирования) цссом и координаты надо обновлять программно
    // иначе slave при скролле потеряется и будет висеть посреди экрана оторванный от мастера
    const listeners = [];
    const listenersActivity = [];
    limitingContainers.forEach((container: any, index: number) => {
      listenersActivity[index] = new Subject<boolean>();
      listeners[index] = fromEvent(container, 'scroll')
        .pipe(takeUntil(listenersActivity[index].asObservable()))
        .subscribe((e: TouchEvent) => {
          this.destroyOrUpdate(request);
        });
    });
    this.subscriptions.set(request, listeners);
    this.subscriptionsActivity.set(request, listenersActivity);
    this.requests.push(request);
    if (this.requests.length && !this.globalScrollActivity) {
      this.globalScrollActivity = new Subject<boolean>();
      this.globalScrollSubscription = fromEvent(window, 'scroll')
        .pipe(takeUntil(this.globalScrollActivity.asObservable()))
        .subscribe((e: TouchEvent) => {
          this.requests.forEach((positioningRequest) => this.destroyOrUpdate(positioningRequest));
      });
    }
    this.updateAbsoluteCoordinates(request);
  }

  // рассоединение master и slave, все созданные лиснеры скролла уничтожаются включая по необходимости глобальный
  public detach(request: PositioningRequest): void {
    if (!request || !request.master || !request.slave || !this.requests.includes(request)) {
      return;
    }
    this.requests = this.requests.filter((otherRequest) => otherRequest !== request);
    this.renderer.setStyle(request.slave.nativeElement, 'position', 'absolute');
    const subscriptionsActivity = this.subscriptionsActivity.get(request);
    this.subscriptionsActivity.delete(request);
    const subscriptions = this.subscriptions.get(request);
    this.subscriptions.delete(request);
    if (subscriptionsActivity && subscriptions) {
      subscriptionsActivity.forEach((subscriptionActivity: Subject<boolean>) => subscriptionActivity.next(true));
      subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }
    if (!this.requests.length && this.globalScrollActivity && this.globalScrollSubscription) {
      this.globalScrollActivity.next(true);
      this.globalScrollSubscription.unsubscribe();
      this.globalScrollActivity = this.globalScrollSubscription = null;
    }
    this.renderer.setStyle(request.slave.nativeElement, 'left', null);
    this.renderer.setStyle(request.slave.nativeElement, 'right', null);
    this.renderer.setStyle(request.slave.nativeElement, 'top', null);
    this.renderer.setStyle(request.slave.nativeElement, 'bottom', null);
  }

  // связь может быть создана с обновлением координат элемента по скроллу, либо с уничтожением. во втором случае лиснеры также уничтожатся
  public destroyOrUpdate(request: PositioningRequest): void {
    if (request.destroyOnScroll) {
      this.detach(request);
      if (request.destroyCallback) {
        try {
          request.destroyCallback();
        } catch (e) { /* ignore */ }
      }
    } else {
      this.updateAbsoluteCoordinates(request);
    }
  }
}
