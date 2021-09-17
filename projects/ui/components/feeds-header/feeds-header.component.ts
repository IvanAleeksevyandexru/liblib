import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { YaMetricService } from '@epgu/ui/services/ya-metric';

@Component({
  selector: 'lib-feeds-header',
  templateUrl: './feeds-header.component.html',
  styleUrls: ['./feeds-header.component.scss']
})
export class FeedsHeaderComponent implements OnInit {

  @Input() public title: string;
  @Input() public showSettings = true;
  @Input() public page: string;

  public staticDomainAssetsPath = this.loadService.config.staticDomainAssetsPath;

  constructor(
    private loadService: LoadService,
    public yaMetricService: YaMetricService,
  ) {
  }

  public ngOnInit() {
  }

  public onSettingsClick(): void {
    this.yaMetricService.callReachGoal('overviewEvents', {
      from: 'overviewAllEvents',
      settings: true,
      all: 'action',
      screen: this.loadService.attributes.deviceType
    });
  }
}
