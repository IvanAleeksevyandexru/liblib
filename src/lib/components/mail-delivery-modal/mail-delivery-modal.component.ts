import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MailDeliveryService } from '../../services/mail-delivery/mail-delivery.service';
import { DeliverySubscribeStatus, SubscriptionHint, SubscriptionItem } from '../../models/mail-delivery';
import { ConstantsService } from '../../services/constants.service';
import { LoadService } from '../../services/load/load.service';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'lib-mail-delivery-modal',
  templateUrl: './mail-delivery-modal.component.html',
  styleUrls: ['./mail-delivery-modal.component.scss']
})
export class MailDeliveryModalComponent implements OnInit {

  public departments: SubscriptionItem[];
  public selectedDepartments: DeliverySubscribeStatus[] = [];

  public hint: SubscriptionHint;

  public addresses: string[] = [];

  public showError: boolean;
  public loading: boolean;
  public showCheckboxes = true;
  public isRussianPost = this.mailDeliveryService.isRussianPost;

  public destroy: () => void;

  constructor(
    public mailDeliveryService: MailDeliveryService,
    private loadService: LoadService,
    private constants: ConstantsService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.getAddresses();
  }

  private getAddresses(): void {
    const pr = this.departments.find(item => this.isRussianPost(item.code));
    if (pr) {
      const addresses = this.loadService.user.person.addresses || [];
      const plvAddress = addresses.find((item) => item.type === 'PLV');
      const prgAddress = addresses.find((item) => item.type === 'PRG');
      if (plvAddress) {
        this.addresses.push(HelperService.formatMailDelivery(plvAddress));
      }
      if (prgAddress) {
        this.addresses.push(HelperService.formatMailDelivery(prgAddress));
      }
      if (!this.addresses.length) {
        this.showCheckboxes = false;
      }
    }
  }

  public checkboxChange(deptCode): void {
    const deptIndex = this.selectedDepartments.indexOf(deptCode);
    if (deptIndex > -1) {
      this.selectedDepartments.splice(deptIndex, 1);
    } else {
      this.selectedDepartments.push(deptCode);
    }
  }

  public enableSubscriptionState() {
    if (!this.showCheckboxes) {
      this.goToSubscriptionPage();
      return;
    }
    if (this.selectedDepartments.length) {
      this.showError = false;
      this.loading = true;
      this.mailDeliveryService.updateMultiSubscriptionState(this.selectedDepartments, 'SUBSCRIBED')
        .subscribe(() => {
          this.onClose();
        }, () => {
          this.showError = true;
          this.loading = false;
        });
    }
  }

  public refuseSubscription(status: DeliverySubscribeStatus) {
    this.showError = false;
    this.loading = true;
    const departmentCodes = this.departments.map(item => item.code);
    this.mailDeliveryService.updateMultiSubscriptionState(departmentCodes, status)
      .pipe(finalize(() => {
        this.onClose();
      }))
      .subscribe();
  }

  public goToSubscriptionPage() {
    this.onClose();
    this.router.navigate(['/settings/mail']);
  }

  public onClose(): void {
    this.destroy();
  }

}
