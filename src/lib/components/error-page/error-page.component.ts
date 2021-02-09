import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  @Input() public title: string;
  @Input() public templateType?: string;
  @Input() public subTitle: string;
  @Input() public cls?: string;
  @Input() public refUrl: string;
  @Input() public errorType: 'http' | 'address' | 'server' | 'developing' | 'order' | 'account';
  @Input() public imgPosition: 'left' | 'right';

  public location = window.location.href;
  public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;

  constructor(public loadService: LoadService) { }

  public ngOnInit() { }

}
