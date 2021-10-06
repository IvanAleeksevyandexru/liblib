import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GosbarService } from '@epgu/ui/services/gosbar';
import { SharedService } from '@epgu/ui/services/shared';
import { LocationService } from '@epgu/ui/services/location';

@Component({
  selector: 'lib-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {

  @Input() public skinTheme?: 'red' | 'black' | 'blue';

  public regionName: string;

  constructor(
    private gosbarService: GosbarService,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private locationService: LocationService,
  ) { }

  public ngOnInit(): void {
    if (this.locationService.userSelectedRegionName) {
      this.regionName = this.locationService.userSelectedRegionName;
    }
    this.sharedService.on('regionData').subscribe(regionData => {
      if (regionData && regionData.code !== '00000000000') {
        this.regionName = regionData.name;
      } else {
        this.translateService.get('LOCATION.FAIL').subscribe((res: string) => {
          this.regionName = res;
        });
      }
    });
  }

  public handleClick() {
    this.gosbarService.popupLocation();
  }
}
