import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { Throbber } from '../../models/throbber';

@Component({
  selector: 'lib-throbber',
  templateUrl: './throbber.component.html',
  styleUrls: ['./throbber.component.scss']
})
export class ThrobberComponent extends Throbber implements OnInit  {
  constructor(
    private loadService: LoadService
  ) {
    super();
  }

  @Input() public header = '';
  @Input() public subHeader = '';
  @Input() public inlineHeader = '';
  @Input() public defaultHeaders = false;
  // возможные размеры: 'throbber-big', 'throbber-medium', 'throbber-small'
  @Input() public size = 'throbber-big';
  @Input() public contextClass = '';

  public animationEnabled = true;

  public ngOnInit() {
    this.animationEnabled = true;
    this.setDefaultHeaders();

  }

  public setDefaultHeaders(): void {
    // если на входе defaultHeaders === true, берем заголовки для троббера из конфига
    if (this.defaultHeaders) {
      this.header = this.defaultHeader;
      this.subHeader = this.defaultSubHeader;
    }
  }
}
