import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GosbarService } from '../../services/gosbar/gosbar.service';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'lib-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss']
})
export class LocationSelectComponent implements OnInit {

  @Input() public skinTheme?: string;

  public regionName: string;

  constructor(
    private gosbarService: GosbarService,
    private sharedService: SharedService,
    private translateService: TranslateService
  ) { }

  public ngOnInit(): void {
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
