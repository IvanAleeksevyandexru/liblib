import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-disclaimer-elk',
  templateUrl: './disclaimer-elk.component.html',
  styleUrls: ['./disclaimer-elk.component.scss']
})
export class DisclaimerElkComponent implements OnInit {

  @Input() public text: string;
  @Input() public title: string;
  @Input() public color = '#FEF0CC';
  @Input() public noBorder = false;
  @Input() public noShadow = false;
  @Input() public horizontalLine = false;
  @Input() public onlyTitle = false;

  constructor() { }

  public ngOnInit() {
  }

}
