import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';

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

  constructor(private loadService: LoadService) { }

  public ngOnInit() {
    this.url = this.otherMainPage || this.loadService.config.baseUrl;
  }

}

