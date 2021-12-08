import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadService } from '@epgu/ui/services/load';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import {
  Bill,
  BillAttr,
  BillDiscounts,
  BillResponse,
  BillsErrors,
  BillsRequestParams,
  ErrorInfo,
  PayOption
} from '@epgu/ui/models/bill';
import {
  GibddDetails,
  GibddDetailsResponse,
  GibddPhotoRequestParams,
  GibddPhotoResponse
} from '@epgu/ui/models/gibdd-fine';
import { PaymentDetailsContent, PaymentDetailsResponse, PaymentErrors, StatusComment } from '@epgu/ui/models';
import { HealthService } from '@epgu/ui/services/health';
import { YaMetricService } from '@epgu/ui/services/ya-metric';
import { Vehicle } from '@epgu/ui/models/vehicle';
import { SliderImage } from '@epgu/ui/models/slider-image';
import { differenceInHours } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class IpshService {

  private bills = new BehaviorSubject<Bill[]>(null);
  public bills$ = this.bills.asObservable();

  private payOptions = new BehaviorSubject<PayOption[]>(null);
  public payOptions$ = this.payOptions.asObservable();

  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  private noAuthUserId = new BehaviorSubject<string>(null);
  public noAuthUserId$ = this.noAuthUserId.asObservable();

  constructor(
    private http: HttpClient,
    private loadService: LoadService,
    private healthService: HealthService,
    private yaMetricService: YaMetricService
  ) {
  }

  public static discountDateIsCorrect(date: string) {
    const dateReg = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    return dateReg.test(date);
  }

  public getBillsErrorByCode(code: number): BillsErrors {
    if ([1, 18].includes(code)) {
      return BillsErrors.BillsNotFound;
    }

    if ([3, 4, 15, 16, 20].includes(code)) {
      return BillsErrors.BillsPaymentImpossible;
    }

    if (code === 5) {
      return BillsErrors.BillsNoAccessRights;
    }

    if (code === 50) {
      return BillsErrors.BillsNoAccessRightsUL;
    }

    if (code === 13) {
      return BillsErrors.BillsCanceled;
    }

    if (code === 14) {
      return BillsErrors.BillsMultiplePaymentNotAvailable;
    }

    if (code === 17) {
      return BillsErrors.BillsServiceNotAvailable;
    }

    if (code === 19) {
      return BillsErrors.BillsUncorrectNumber;
    }

    if ([22, 23].includes(code)) {
      return BillsErrors.BillsPaid;
    }

    if (code === 25) {
      return BillsErrors.BillsDateEvaluated;
    }

    if (code === 40) {
      return BillsErrors.BillsInvalidArguments;
    }

    if (code === 1000) {
      return BillsErrors.BillsHasUnidentifiedBills;
    }

    if (code !== 0) {
      return BillsErrors.Default;
    }

    return null;
  }

  public getPaymentErrorByCode(code: number): string {
    if (code === 7) {
      return PaymentErrors.PaymentNotFound;
    }
    if ([10, 13].includes(code)) {
      return PaymentErrors.PaymentNotAvailable;
    }
    if (code !== 0) {
      return PaymentErrors.Default;
    }
    return null;
  }

  public getBills(params: BillsRequestParams, body: any = {}): Observable<BillResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(code => {
      httpParams = httpParams.append(code, params[code]);
    });
    if (!httpParams.has('ci')) {
      httpParams = httpParams.append('ci', 'false');
    }

    return this.http.post<BillResponse>(
      `${this.loadService.config.ipshApi}bills`,
      body,
      {
        withCredentials: true,
        params: httpParams,
      }
    ).pipe(switchMap(data => {
      if (data && data.response && data.response.hasUnidentifiedBills) {
        data.error.code = 1000;
      }
      if (data && data.response && data.response.bills) {
        data.response.bills.forEach(bill => {
          bill.attrs = this.transformAttrs(bill.addAttrs);
        });
      }
      return of(data);
    }));
  }

  public collectErrorData(response: BillResponse, billNumber?: string): ErrorInfo {
    if (!response || !response.error) {
      return null;
    }
    const errorType = this.getBillsErrorByCode(response && response.error && response.error.code);
    // let date: string;
    // let supplier: string;
    // if (errorType === BillsErrors.BillsDateEvaluated) {
    //   date = response.error.message.match(/\d\d\.\d\d\.\d\d\d\d/)[0];
    // }
    // if (errorType === BillsErrors.BillsHasUnidentifiedBills) {
    //   supplier = response && response.response.bills && response.response.bills[0] && response.response.bills[0].addAttrs &&
    //     (this.getAttr(response.response.bills[0].addAttrs, 'ReceiverPdfName') ||
    //       this.getAttr(response.response.bills[0].addAttrs, 'SupplierFullName'));
    //   if (!supplier) {
    //     errorType = BillsErrors.BillsInvalidArguments;
    //   }
    // }
    return {
      code: response.error.code,
      message: response.error.message,
      fkSmevVersion: response.error.fkSmevVersion,
      requestId: response.error.requestId,
      type: errorType,
      billNumber,
      // date,
      // supplier
    };
  }

  public transformAttrs(attrs: BillAttr[]) {
    const attrsObj = {};
    attrs.forEach(attr => {
      if (attr.value && attr.value !== 'null') {
        attrsObj[attr.name] = attr.value;
      }
    });
    return attrsObj;
  }

  public getGibddDetails(billNumber: string, hash: string): Observable<GibddDetails> {
    const url = `${this.loadService.config.ipshApi}informer/gibdd/details/${billNumber}`;
    const params = {
      md5: hash
    };

    this.healthService.measureStart('fineDetails');
    return this.http.get(url, {withCredentials: true, params}).pipe(
      tap((data: GibddDetailsResponse) => {
        const errorCode = data && data.error && data.error.code;
        if (errorCode === 0) {
          this.healthService.measureEnd('fineDetails', 0, {BrowserError: 'OK', utm_source: 'fineDetails_ok'});
        } else {
          this.healthService.measureEnd('fineDetails', 1, {BrowserError: errorCode, utm_source: 'fineDetails_no'});
        }
      }),
      map((data: GibddDetailsResponse) => data && data.content),
      catchError(error => {
        this.healthService.measureEnd('fineDetails', 1, {BrowserError: error.status, utm_source: 'fineDetails_no'});
        return throwError(error);
      })
    );
  }

  public getGibddPhotos(params: GibddPhotoRequestParams): Observable<SliderImage[]> {
    const url = `${this.loadService.config.gosuslugiUrl}/proxy/gibdd/photo`;
    const httpParams = new HttpParams({
      fromObject: {
        uin: params.uin,
        md5: params.md5,
        reg: params.reg
      }
    });
    this.healthService.measureStart('gibdd_photo');
    return this.http.get(url, {params: httpParams}).pipe(
      switchMap((data: GibddPhotoResponse) => {
        if (!data || !data.photos || !data.photos.length) {
          return throwError(data);
        }
        return of(data);
      }),
      map((data: GibddPhotoResponse) => {
        let photos = [];
        const errorCode = data && data.code || 'null';
        if (data && data.photos) {
          photos = data.photos.map((item, index) => {
            return {
              data: `data:image/jpeg;base64,${item.base64Value}`,
              title: `Фото ${index + 1}`
            };
          });
          this.healthService.measureEnd('gibdd_photo', 0, {
            BrowserError: 'OK',
            utm_source: 'gibdd_photo_ok',
            deptCode: params.div
          });
          this.yaMetricService.callReachGoal('gibdd_photo_ok');
        }
        return photos;
      }),
      catchError(error => {
        this.healthService.measureEnd('gibdd_photo', 1, {
          BrowserError: error.code || error.status,
          utm_source: 'gibdd_photo_no',
          deptCode: params.div
        });
        this.yaMetricService.callReachGoal('gibdd_photo_error');
        return throwError(error);
      })
    );
  }

  public getCarName(vehicle: Vehicle): string {
    let carName = '';
    if (vehicle && vehicle.name !== 'Авто') {
      carName = vehicle.name;
    } else if (vehicle && vehicle.numberPlate) {
      carName = vehicle.numberPlate;
    }
    return carName;
  }

  public paymentDetails(paymentId: string): Observable<PaymentDetailsContent> {
    const url = `${this.loadService.config.ipshApi}payment/details`;
    const params = new HttpParams({
      fromObject: {
        paymentId,
        vehicles: 'true',
        selectedByWhiteList: 'true'
      }
    });
    return this.http.get(url, {params, withCredentials: true}).pipe(
      catchError(error => {
        return throwError({type: PaymentErrors.Default});
      }),
      switchMap((data: PaymentDetailsResponse) => {
        if (data.response) {
          if (data.response.paymentItems && data.response.paymentItems.addAttrs) {
            data.response.paymentItems.attrs = this.transformAttrs(data.response.paymentItems.addAttrs.addAttrs);
          }
          return of(data.response);
        } else {
          const errorCode = data && data.error && data.error.code;
          const errorInfo = {
            code: errorCode,
            message: data && data.error && data.error.message,
            type: this.getPaymentErrorByCode(errorCode)
          };
          return throwError(errorInfo);
        }
      })
    );
  }

  public getPaymentStatusComment(params): Observable<StatusComment> {
    const {
      status, createTime, fKQuittanceStatus, fKQuittanceComment, ipPaymentAmount, category,
      statusUpdated, billNumber, multiplierSize
    } = params;
    let comment = '';
    let param = '';
    const timeInProcessFromCreate = createTime ? differenceInHours(new Date(), createTime) : 0;
    const timeInProcessFromUpdate = statusUpdated ? differenceInHours(new Date(), statusUpdated) : 0;
    const progressStatuses = ['NEW', 'PAY_SERVICE_CONFIRMATION', 'PAY_SERVICE_CONFIRMED', 'BANK_PAY_ORDER_CONFIRMATION', 'BANK_PAY_ORDER_CONFIRMED', 'SERVICE_PROVIDER_CONFIRMATION'];
    const doneStatuses = ['BANK_PAY_CONFIRMED', 'BANK_PAY_CONFIRMATION', 'SERVICE_PROVIDER_CONFIRMED', 'GISGMP_QUITTANCE_STATUS'];

    const statusIsActual = new BehaviorSubject<boolean>(null);
    let fkStatus: string = fKQuittanceStatus;
    let fkComment: string = fKQuittanceComment;
    if (category !== 'FSSP' && category !== 'FNS' && doneStatuses.includes(status) && ['2', '3'].includes(fkStatus)) {
      this.getBills({billNumber}).pipe(
        finalize(() => {
          statusIsActual.next(true);
        })
      ).subscribe(data => {
        const attrs = data.response && data.response.bills && data.response.bills[0] && data.response.bills[0].attrs || {};
        if (attrs.FKQuittanceComment) {
          fkComment = attrs.FKQuittanceComment;
        }
        if (attrs.FKQuittanceStatus) {
          fkStatus = attrs.FKQuittanceStatus;
        }
      });
    } else {
      statusIsActual.next(true);
    }

    return statusIsActual.pipe(
      filter(isActual => isActual),
      switchMap(isActual => {
        if (progressStatuses.includes(status)) {
          comment = timeInProcessFromCreate < 24 ? 'IN_PROGRESS_LESS_24' : 'IN_PROGRESS_MORE_24';

        } else if (category === 'FSSP' && 'BANK_PAY_CONFIRMED' === status) {
          comment = 'FSSP_NOT_FOUND_AMOUNT';
          if (ipPaymentAmount && +ipPaymentAmount > 0) {
            comment = 'FSSP_BEFORE_UNLOADING';
          } else if (ipPaymentAmount && +ipPaymentAmount === 0) {
            comment = 'FSSP_AFTER_UNLOADING';
          }

        } else if (category === 'FNS' && 'BANK_PAY_CONFIRMED' === status) {
          comment = timeInProcessFromUpdate <= 10 * 24 ? 'FNS_LESS_10_DAYS' : 'FNS_MORE_10_DAYS';

        } else if ('BANK_PAY_CONFIRMED' === status && (category === 'STATE_DUTY' || category === 'FINE') && fkStatus === '3') {
          comment = 'NO_INFO_IN_GIS_GMP';

        } else if (doneStatuses.includes(status) && fkStatus === '1') {
          comment = 'INFO_IN_GIS_GMP';

        } else if ('BANK_PAY_CONFIRMED' === status && fkComment && (fkComment.toLowerCase().indexOf('недоплата') > -1)) {
          const quittanceComment = fkComment[fkComment.length - 1] !== '.' ? fkComment + '.' : fkComment;
          comment = (category === 'STATE_DUTY' || multiplierSize) ? 'UNDERPAYMENT_STATE_DUTY' : 'UNDERPAYMENT';
          param = quittanceComment;

        } else if (['SERVICE_PROVIDER_CONFIRMED', 'BANK_PAY_CONFIRMATION'].includes(status)) {
          comment = timeInProcessFromUpdate < 48 ? 'PAYMENT_ACCEPTED_LESS_48' : 'PAYMENT_ACCEPTED_MORE_48';
        }
        return of({comment, param});
      })
    );
  }

  public sendPaymentQuittance(paymentId: number, email: string) {
    const url = `${this.loadService.config.ipshApi}payment/send/email/${paymentId}`;
    return this.http.get(url, {withCredentials: true, params: {email}});
  }

  public checkSumUin(uin: string): boolean {
    const mapSymbolValue = {
      // Cyrillic
      А: 1, Б: 2, В: 3, Г: 4, Д: 5, Е: 6, Ж: 7, З: 8, И: 9, К: 10, Л: 11, М: 12, Н: 13, О: 14, П: 15, Р: 16,
      С: 17, Т: 18, У: 19, Ф: 20, Х: 21, Ц: 22, Ч: 23, Ш: 24, Щ: 25, Э: 26, Ю: 27, Я: 28, Ъ: 33, Ы: 36, Ь: 42,
      // Latin
      A: 1, B: 3, E: 6, K: 10, M: 12, H: 13, O: 14, P: 16, C: 17, T: 18, Y: 19, X: 21, D: 29, F: 30,
      G: 31, I: 32, J: 33, L: 34, N: 35, Q: 36, R: 37, S: 38, U: 39, V: 40, W: 41, Z: 42
    };
    // digits
    for (let i = 0; i < 10; i++) {
      mapSymbolValue[i.toString()] = i;
    }

    /*
    * @param strings
    * @param leftShift 0 (для первой попытки) или 2 (для второй попытки)
    * @return
    */
    const run = (digits, leftShift: number): number => {
      let controlSum = 0;
      for (let i = 0; i < digits.length - 1; i++) {
        controlSum += (mapSymbolValue[digits[i]] % 10) * (((i + leftShift) % 10) + 1);
      }
      return controlSum % 11;
    };

    const strings = uin.split('');
    const checkSum = Number(strings[strings.length - 1]);
    let result = run(strings, 0);

    if (result < 10) {   // вычислена контрольная сумма
      return (result === checkSum);
    } else {   // повторное вычисление со сдвигом разрядов
      result = run(strings, 2);
      if (result === 10) {     // контрольная сумма 0
        result = 0;
      }
      return (result === checkSum);
    }
  }

  public changeBillVisibility(billNumber: string, hidden: 'Y' | 'N', reason?: string): Observable<BillResponse> {
    let httpParams = new HttpParams({
      fromObject: {billNumber, hidden}
    });
    if (reason) {
      httpParams = httpParams.append('reason', reason);
    }
    return this.http.post<BillResponse>(
      `${this.loadService.config.ipshApi}hidden/bills`,
      {},
      {
        withCredentials: true,
        params: httpParams,
      }
    );
  }

  public getAttr(attrs: BillAttr[], code: string): string {
    const attr = attrs && attrs.find(item => item.name === code);
    return attr && attr.value || '';
  }

  public getDiscountInfo(bill: Bill): BillDiscounts {
    const attrs = bill.addAttrs;
    const originalAmount = this.getAttr(attrs, 'OriginalAmount');
    const discountDate = this.getAttr(attrs, 'DiscountDate');
    const multiplierSize = this.getAttr(attrs, 'MultiplierSize');
    if (multiplierSize && originalAmount) {
      return 'ACTUAL_FOR_STATE_DUTY';
    } else if (discountDate && IpshService.discountDateIsCorrect(discountDate)) {
      return originalAmount ? 'ACTUAL_FOR_GIBDD' : 'EXPIRED_FOR_GIBDD';
    }
    return null;
  }

  public getGibddFinesDecree(uin: string) {
    const url = `${this.loadService.config.gepsApiUrl}messages/byUin?uin=${uin}`;
    return this.http.get(url, {withCredentials: true});
  }

  public getBillOrderData(uin: string) {
    const url = `${this.loadService.config.lkApiUrl}orders/orderData/${uin}`;
    return this.http.get(url, {withCredentials: true});
  }
}
