import { Component, OnInit } from '@angular/core';
import { Modal } from '../../models/modal-container';
import { MessageDetails } from '../../models/feed';
import { GibddService } from '../../services/gibdd/gibdd.service';
import { Gibdd, GibddDetails, GibddPhotoData } from '../../models/gibdd';
import * as moment_ from 'moment';
import { AddressToCoords } from '../../models/location';
import { LocationService } from '../../services/location/location.service';
import { SliderImage } from '../../models/slider-image';

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
  public details: GibddDetails;
  public center: number[];
  public photos: SliderImage[];

  public destroy: () => {};

  constructor(private gibdd: GibddService,
              private locationService: LocationService) { }

  public ngOnInit() {
    this.gibdd.getGibddDetails(this.message.addParams.fknumber, this.message.addParams.fknumberHash)
      .subscribe((data: Gibdd) => {
        if (data.error.code !== 0) {
          return;
        }

        this.details = data.content;
        this.getCoordsByAddress();
        this.loading = false;
        this.formatDate();

        if (this.details.hasPhoto) {
          this.gibdd.getPhoto(this.details).subscribe((resp: GibddPhotoData) => {
            const photos: SliderImage[] = [];
            resp.photos.forEach((item) => {
              photos.push({data: 'data:image/png;base64,' + item.base64Value});
            });
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

  public onCancel(): void {
    this.destroy();
  }

}
