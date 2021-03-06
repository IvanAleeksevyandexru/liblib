import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { LocationService } from '@epgu/ui/services/location';

@Component({
  selector: 'lib-region-cases',
  templateUrl: './region-cases.component.html',
  styleUrls: ['./region-cases.component.scss']
})
export class RegionCasesComponent implements OnInit {

  @Input() caseItem: number;

  public regionCase: any;

  constructor(
    public loadService: LoadService,
    public locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.getCurrentRegionCase();
  }

  public getCurrentRegionCase() {

    //   Различные падежи описываются аттрибутом caseItem:
    //   1 - именит. падеж
    //   2 - родит. падеж
    //   3 - дат. падеж
    //   4 - винит. падеж
    //   5 - творит. падеж
    //   6 - предлож. падеж

    let manualRegions = this.loadService.config.manualRegions;
    const regionCodes = this.locationService.userSelectedRegionCodes;
    if (manualRegions) {
      manualRegions = JSON.parse(manualRegions);
      for(let key in manualRegions) {
        if(regionCodes[regionCodes.length - 1] === manualRegions[key].okato) {
          this.regionCase = manualRegions[key].cases[this.caseItem];
        }
      }
    }
  }

}
