import { Injectable, Optional } from '@angular/core';
import { Renderer2, RendererFactory2 } from '@angular/core';
import { isDevMode } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { BannerGroup } from '@epgu/ui/models';
import { Document } from '@epgu/ui/models/document';
import { DatesHelperService } from '@epgu/ui/services/dates-helper';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YaMetricService {

  private isLoaded: boolean;
  private isErrorLoadYaMetricScript = new BehaviorSubject<boolean>(null);
  private isErrorLoadYaMetricScript$ = this.isErrorLoadYaMetricScript.asObservable();
  private subs: { error?: Subscription, success?: () => void} = {};

  public counter = 'unknown';
  public deviceType = 'desk';
  public ym: any;
  private renderer: Renderer2;

  public static getDocumentStatus(document: Document): 'checks' | 'failedVerif' | 'validated' {
    if (document.number) {
      if (document.vrfValStu === 'VERIFYING') {
        return 'checks';
      } else if (document.vrfStu === 'VERIFIED') {
        return 'validated';
      } else {
        return 'failedVerif';
      }
    } else {
      return null;
    }
  }

  public static getDocumentTimeStatus(date: string, amount: number = 3, units: string = 'month'): 'soonExpire' | 'expired' | 'relevant' {
    if (date) {
      if (DatesHelperService.isExpiredDate(date)) {
        return 'expired';
      } else if (DatesHelperService.isExpiredDateAfter(date, amount, units)) {
        return 'soonExpire';
      } else {
        return 'relevant';
      }
    } else {
      return null;
    }
  }

  constructor(
    private rendererFactory: RendererFactory2,
    @Optional() private loadService: LoadService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    if (this.loadService && this.loadService.config) {
      this.counter = this.loadService.config.yaCounter;
      this.deviceType = this.loadService.attributes.deviceType;
    }
  }

  public loadMetric(): void {
    ((m, e, t, r, i, k, a) => {
      // tslint:disable-next-line:only-arrow-functions
      const addScript = function() {
        (m[i].a = m[i].a || []).push(arguments);
      };
      m[i] = m[i] || addScript;
      m[i].l = +new Date();
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
      k.onerror = () => {
        this.isErrorLoadYaMetricScript.next(true);
      };
    })
    (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    // @ts-ignore
    ym(this.counter, 'init', {
      defer: true,
      id: this.counter,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      trackHash: true,
      triggerEvent: true
    });
  }

  public callReachGoal(name, params = null, callback?): Promise<void> {
    const doCallback = () => {
      if (typeof callback === 'function') {
        callback();
      }
    };
    return this.onInit().then(() => {
      if (this.ym) {
        if (params) {
          if (callback && typeof callback === 'function') {
            return this.ym(this.counter, 'reachGoal', name, params, callback);
          } else {
            return this.ym(this.counter, 'reachGoal', name, params);
          }
        } else {
          doCallback();
          return this.ym(this.counter, 'reachGoal', name);
        }
      }
      doCallback();
    }, () => {
      doCallback();
    });
  }

  /**
   * посылает яндекс метрику с событием для элементов с директивой libYaMetric / libYaMetricSendAndPass
   * параметр name в мапе обязательный, добавление платформы автоматическое, если не отменено параметром skipType
   */
  public callReachGoalParamsAsMap(params: { [key: string]: any } = {}): Promise<void> {
    const name = params.name;
    if (!name) {
      throw Error('yandex metric event name is required!');
    }
    const paramsCopy = Object.assign({}, params);
    if (!paramsCopy.skipType) {
      paramsCopy.type = this.deviceType;
    }
    delete paramsCopy.name;
    delete paramsCopy.skipType;
    return this.callReachGoal(name, paramsCopy);
  }

  public initBannerYaMetric(banners: BannerGroup[]): void {
    if (banners && banners.length && banners[0].banners.length) {
      this.callReachGoal('new_lk_banners', {
        banners: 'show',
        banner: banners[0].banners[0].mnemonic,
        type: this.loadService.attributes.deviceType
      });
    }
  }

  public initBannerPlaceYaMetric(banners: BannerGroup[]): void {
    if (banners && banners.length && banners[0].banners.length) {
      this.callReachGoal('new_lk_banners', {
        banner_place: banners[0].group,
        type: this.loadService.attributes.deviceType
      });
    }
  }

  public arrowClickYaMetric(): void {
    this.callReachGoal('new_lk_banners', {
      arrowAction: true,
      type: this.loadService.attributes.deviceType
    });
  }

  public bannerClickYaMetric(bannerMnemonic: string, isGeps: boolean): void {
    if (!isGeps) {
      this.callReachGoal('new_lk_banners', {
        banners: 'action',
        banner: bannerMnemonic,
        type: this.loadService.attributes.deviceType
      });
    } else {
      this.callReachGoal('new_lk_banners_geps', {
        banners: 'action',
        banner: bannerMnemonic,
        area: 'field',
        type: this.loadService.attributes.deviceType
      });
    }
  }

  public onInit(): Promise<any> {
    if (this.isLoaded) {
      return Promise.resolve();
    } else if (this.isErrorLoadYaMetricScript.getValue()) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      this.subs.error = this.isErrorLoadYaMetricScript$.pipe(
        filter((res) => !!res)
      ).subscribe(() => {
        reject();
        this.unsub();
      })
      this.subs.success = this.renderer.listen('document', `yacounter${this.counter}inited`, (event: any) => {
        this.isLoaded = true;
        this.unsub();
        if (!isDevMode()) {
          // @ts-ignore
          this.ym = ym;
        } else {
          console.log('ya metric disabled - environment.name === "local"');
        }
        resolve(true);
      });
    });
  }

  private unsub(): void {
    if (typeof this.subs?.success === 'function') {
      this.subs?.success();
    }
    this.subs?.error?.unsubscribe();
  }

  public yaMetricCallToAction(staType: string): void {
    this.callReachGoal('detailOrder', {
      action: 'sta',
      staType,
      type: this.loadService.attributes.deviceType
    });
  }

  public yaMetricOrderDetails(action: string, serviceName: string, status?: number) {
    const params: { [key: string]: string | number } = {
      action,
      serviceName,
      type: this.loadService.attributes.deviceType
    };
    if (status) {
      params.status = status;
    }
    this.callReachGoal('detailOrder', params);
  }

  public init(): void {
    this.loadMetric();
    this.onInit();
  }

  public yaMetricInformerMain(typeAction: string, debt: object | null = null): void {
    const params = {
      overviewInformer: {
        typeAction,
        screen: this.loadService.attributes.deviceType
      }
    };
    params.overviewInformer = Object.assign(params.overviewInformer, debt);

    this.callReachGoal('overviewInformer', params);
  }

  public kndMainPortal(type: 'Show' | 'Action', additions: Array<object>): void {
    let params = {};
    if (type === 'Show') {
      params = {
        informerKNDShow: {
          ...additions
        }
      };
    } else {
      params = {
        informerKNDAction: {
          ...additions
        }
      };
    }

    this.callReachGoal(`informerKND${type}`, params);
  }

}
