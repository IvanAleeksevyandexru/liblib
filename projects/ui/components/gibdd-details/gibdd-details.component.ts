import { Component, OnInit } from '@angular/core';
import { AddressToCoords, MessageDetails, Modal } from '@epgu/ui/models';
import { IpshService } from '@epgu/ui/services/ipsh';
import { GibddDetails } from '@epgu/ui/models/gibdd-fine';
import { LocationService } from '@epgu/ui/services/location';
import { SliderImage } from '@epgu/ui/models/slider-image';
import { Bill } from '@epgu/ui/models/bill';
import { LoadService } from '@epgu/ui/services/load';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { format, parse } from 'date-fns';

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
              private loadService: LoadService) {
  }

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
    return format(parse(date, 'dd.MM.yyyy HH:mm', new Date()), 'dd.MM.yyyy, EEEEEE. HH:mm')
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
    (window as any).location = `${this.loadService.config.paymentUrl}?billIds=${billId}`;
  }

  public onCancel(): void {
    this.destroy();
  }

}
