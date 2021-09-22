import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';

@Component({
  selector: 'lib-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {

  @Input() public orgCode: string;
  @Input() public orgHref: string;
  @Input() public orgName: string;

  constructor(private loadService: LoadService) { }

  public ngOnInit() { }

  public get image(): string {
    if (this.orgCode === 'isMfc') {
      return 'https://gu-st.ru/content/mfc_icons/mfc_gosuslugi.svg';
    }

    const path = `${this.loadService.config.staticDomain}/lib-assets/img/structure-logo`;

    if (!this.orgCode) {
      return `${path}/img_RUSSIA.png`;
    }

    const name = this.orgCode.indexOf('img_') !== -1 ? this.orgCode : `img_${this.orgCode}`;
    const extension = this.orgCode.indexOf('.png') === -1 && this.orgCode.indexOf('.svg') === -1 ? '.png' : '';

    return `${path}/${name}${extension}`;
  }
}
