import { Component, Input, OnInit } from '@angular/core';
import { Throbber } from '@epgu/ui/models';

@Component({
  selector: 'lib-throbber',
  templateUrl: './throbber.component.html',
  styleUrls: ['./throbber.component.scss']
})
export class ThrobberComponent extends Throbber implements OnInit {
  constructor() {
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
