import { Injectable, NgModuleRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalService } from '@epgu/ui/services/modal';
import { MailDeliveryModalComponent } from '@epgu/ui/components/mail-delivery-modal';
import { SubscriptionInfo } from '@epgu/ui/models/mail-delivery';
import { LoadService } from '@epgu/ui/services/load';
import { ConstantsService } from '@epgu/ui/services/constants';
import { MailDeliveryService } from '@epgu/ui/services/mail-delivery';
import { CookieService } from '@epgu/ui/services/cookie';
import * as moment_ from 'moment';

const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class MailDeliveryModalService {

  constructor(
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
    private loadService: LoadService,
    private constants: ConstantsService,
    private mailDeliveryService: MailDeliveryService,
    private cookieService: CookieService
  ) {
  }

  public showSubscriptionPopup(data) {
    const curSession = this.cookieService.get('acc_t');
    this.cookieService.set('ezpRemind', curSession);

    this.modalService.popupInject(MailDeliveryModalComponent, this.moduleRef, {
      departments: data.items,
      hint: data.hint
    });
  }

  public checkNeedShowPopup(isModal = false): Observable<SubscriptionInfo> {
    const curSession = this.cookieService.get('acc_t');
    const sessionOfLastShow = this.cookieService.get('ezpRemind');
    if (curSession === sessionOfLastShow) {
      return of(null);
    }

    const enabledUser = this.loadService.user.authorized && this.loadService.user.userType === 'P';
    const enabledUrl = !['/settings/mail'].includes(location.pathname);

    if (!enabledUser || !enabledUrl || !this.loadService.config.showGepsEzpPopup) {
      return of(null);
    }

    return this.mailDeliveryService.getAvailableSubscription(isModal).pipe(
      switchMap((response) => {
        let subscribable = [];
        if (response && response.items) {
          let remindAvailable = true;
          if (response.remind) {
            const remindDate = moment(response.remind);
            remindAvailable = moment().isAfter(remindDate);
          }

          subscribable = response.items.filter(item => {
            if (['NOT_SUBSCRIBED', 'REMIND_LATER'].includes(item.status)) {
              if (this.mailDeliveryService.isRussianPost(item.code) && !response.hint.available) {
                return false;
              }
              if (item.status === 'NOT_SUBSCRIBED') {
                return true;
              } else {
                return remindAvailable;
              }
            }
            return false;
          });
        }
        return of({items: subscribable, hint: response.hint});
      })
    );
  }
}
