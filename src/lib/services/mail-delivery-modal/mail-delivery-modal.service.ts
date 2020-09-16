import { Injectable, NgModuleRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalService } from '../../services/modal/modal.service';
import { MailDeliveryModalComponent } from '../../components/mail-delivery-modal/mail-delivery-modal.component';
import { SubscriptionInfo } from '../../models/mail-delivery';
import { LoadService } from '../../services/load/load.service';
import { ConstantsService } from '../../services/constants.service';
import { MailDeliveryService } from '../../services/mail-delivery/mail-delivery.service';
import { CookieService } from '../../services/cookie/cookie.service';
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
  ) { }

  public showSubscriptionPopup(data) {
    const curSession = this.cookieService.get('acc_t');
    window.sessionStorage.setItem('ezpRemind', curSession);

    this.modalService.popupInject(MailDeliveryModalComponent, this.moduleRef, {
      departments: data.items,
      hint: data.hint
    });
  }

  public checkNeedShowPopup(): Observable<SubscriptionInfo> {
    const curSession = this.cookieService.get('acc_t');
    const sessionOfLastShow = window.sessionStorage.getItem('ezpRemind');
    if (curSession === sessionOfLastShow) {
      return of(null);
    }

    const enabledUser = this.loadService.user.authorized && this.loadService.user.userType === 'P';
    const enabledUrl = !['/settings/mail'].includes(location.pathname);

    if (!enabledUser || !enabledUrl || !this.loadService.config.showGepsEzpPopup) {
      return of(null);
    }

    return this.mailDeliveryService.getAvailableSubscription().pipe(
      switchMap((response) => {
        let subscribable = [];
        if (response && response.items) {
          let remindAvailable = true;
          if (response.remind) {
            const remindDate = moment(response.remind, 'DD.MM.YYYY HH:mm');
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
        return of({ items: subscribable, hint: response.hint });
      })
    );
  }
}
