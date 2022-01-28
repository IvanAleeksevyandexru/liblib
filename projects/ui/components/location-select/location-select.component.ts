import { Component, Input, OnInit } from '@angular/core';
import { GosbarService } from '@epgu/ui/services/gosbar';
import { SharedService } from '@epgu/ui/services/shared';
import { LocationService } from '@epgu/ui/services/location';
import { YaMetricService } from '@epgu/ui/services/ya-metric';

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
    private locationService: LocationService,
    private yaMetricService: YaMetricService
  ) { }

  public ngOnInit(): void {
    if (this.locationService.userSelectedRegionName) {
      this.regionName = this.locationService.userSelectedRegionName;
    }
    this.sharedService.on('regionData').subscribe(regionData => {
      if (regionData && regionData.code !== '00000000000') {
        this.regionName = regionData.name;
      }
    });
  }

  public handleClick() {
    this.gosbarService.popupLocation();
    this.yaMetricService.callReachGoal('header', { 'header' : ['Город'] } );    
  }
}
