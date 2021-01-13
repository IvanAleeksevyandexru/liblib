import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
  @Input() public width?: string;
  @Input() public logoHref = '/';

  public url: string;
  public viewType = this.loadService.config.viewType;

  constructor(private loadService: LoadService) { }

  public ngOnInit() {
    this.url = this.loadService.config.baseUrl;
  }

}
