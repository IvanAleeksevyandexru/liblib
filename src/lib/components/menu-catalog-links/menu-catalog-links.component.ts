import { Component, Input, OnInit } from '@angular/core';
import { Catalog } from '../../models/main-page.model';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-menu-catalog-links',
  templateUrl: './menu-catalog-links.component.html',
  styleUrls: ['./menu-catalog-links.component.scss']
})
export class MenuCatalogLinksComponent implements OnInit {

  @Input() public catalog: Catalog[];
  @Input() public mobile: boolean;


  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
  }

}
