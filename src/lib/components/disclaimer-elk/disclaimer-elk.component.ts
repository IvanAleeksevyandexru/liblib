import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-disclaimer-elk',
  templateUrl: './disclaimer-elk.component.html',
  styleUrls: ['./disclaimer-elk.component.scss']
})
export class DisclaimerElkComponent implements OnInit {

  @Input() public text: string;
  @Input() public title: string;
  @Input() public color?: string;
  @Input() public style: 'simple' | '' = '';
  @Input() public noBorder = false;
  @Input() public horizontalLine = false;

  constructor() { }

  public ngOnInit() {
  }

}
