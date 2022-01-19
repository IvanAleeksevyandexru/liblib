import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';
import { YaMetricService } from '@epgu/ui/services/ya-metric';

@Component({
  selector: 'lib-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  @Input() public width?: string;
  @Input() public logoHref = '/';
  @Input() private otherMainPage: string;

  public url: string;
  public viewType = this.loadService.config.viewType;

  constructor(private loadService: LoadService, private yaMetricService: YaMetricService) { }

  public ngOnInit() {
    this.url = this.otherMainPage || this.loadService.config.baseUrl;
  }

  public clickHandler(e, url: string): void {
    e.stopPropagation();
    e.preventDefault();
    this.yaMetricService.callReachGoal('header', { 'header': { 'Главная': '' } }, () => {
      window.location.href = url;
    });

  }

}

