import { Component, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-social-links',
  templateUrl: './social-links.component.html',
  styleUrls: ['./social-links.component.scss']
})
export class SocialLinksComponent implements OnInit {

  public config = this.loadService.config;

  constructor(
    public loadService: LoadService
  ) { }

  public ngOnInit(): void {
  }

}
