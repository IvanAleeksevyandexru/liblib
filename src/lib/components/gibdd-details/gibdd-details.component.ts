import { Component, OnInit } from '@angular/core';
import { Modal } from '../../models/modal-container';
import { MessageDetails } from '../../models/feed';
import { IpshService } from '../../services/ipsh/ipsh.service';
import { GibddDetails } from '../../models/gibdd-fine.model';
import * as moment_ from 'moment';
import { AddressToCoords } from '../../models/location';
import { LocationService } from '../../services/location/location.service';
import { SliderImage } from '../../models/slider-image';
import { Bill } from '../../models/bill.model';
import { LoadService } from '../../services/load/load.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const moment = moment_;

@Component({
  selector: 'lib-gibdd-details',
  templateUrl: './gibdd-details.component.html',
  styleUrls: ['./gibdd-details.component.scss']
})

@Modal()

export class GibddDetailsComponent implements OnInit {
  public loading = true;
  public message: MessageDetails;
  public bill: Observable<Bill>;
  public details: GibddDetails;
  public center: number[];
  public photos: SliderImage[];
  public showError: boolean;
  public photosLoading: boolean;

  public destroy: () => {};

  constructor(private ipshService: IpshService,
              private locationService: LocationService,
              private loadService: LoadService) { }

  public ngOnInit() {
    this.ipshService.getGibddDetails(this.message.addParams.fknumber, this.message.addParams.fknumberHash)
      .subscribe((data: GibddDetails) => {
        if (!data) {
          this.showError = true;
          this.loading = false;
          return;
        }

        this.details = data;
        this.getCoordsByAddress();
        this.loading = false;
        this.formatDate();

        if (this.details.hasPhoto) {
          const requestParams = {
            uin: this.details.uin,
            md5: this.details.signature,
            reg: this.details.carNumber,
            div: this.details.deptCode
          };
          this.photosLoading = true;
          this.ipshService.getGibddPhotos(requestParams)
            .pipe(finalize(() => {
              this.photosLoading = false;
            }))
            .subscribe((photos: SliderImage[]) => {
              this.photos = photos;
            });
        }
      });
  }

  public formatDate(): string {
    const date = this.details.violationDate + ' ' + this.details.violationTime;
    return moment(date, 'DD.MM.YYYY HH:mm')
      .format('DD.MM.YYYY, dd. HH:mm')
      .replace(/.{12}(.{1})/, (match) => match.toUpperCase());
  }

  public getCoordsByAddress(): void {
    if (!this.details.offense) {
      return;
    }
    this.locationService.getCoordsByAddress([this.details.offense])
      .subscribe((data: AddressToCoords) => {
        if (data && data.coords && data.coords.length) {
          this.center = [data.coords[0].longitude, data.coords[0].latitude];
        }
      });
  }

  public goToPayment(billId: string): void {
    (window as any).location = `${this.loadService.config.betaUrl}payment/${billId}?details=1`;
    // Сделать этот редирект после открытия новой платежки
    // (window as any).location = `${this.loadService.config.paymentUrl}?billIds=${billId}`;
  }

  public onCancel(): void {
    this.destroy();
  }

}
