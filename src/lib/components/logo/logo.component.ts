import { Component, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
  public url: string;

  constructor(private loadService: LoadService) { }

  public ngOnInit() {
    this.url = this.loadService.config.baseUrl;
  }

}
