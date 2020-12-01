import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-footer-copyright',
  templateUrl: './footer-copyright.component.html',
  styleUrls: ['./footer-copyright.component.scss']
})
export class FooterCopyrightComponent implements OnInit {

  @Input() public classes?: string;

  public currentYear: number;

  constructor() {
  }

  public ngOnInit() {
    this.getCurrentYear();
  }

  private getCurrentYear() {
    this.currentYear = new Date().getFullYear();
  }
}
