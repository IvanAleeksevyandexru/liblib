import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-button-for-input',
  templateUrl: './button-for-input.component.html',
  styleUrls: ['./button-for-input.component.scss']
})
export class ButtonForInputComponent implements OnInit {
  @Input() public type: 'text' | 'lookup' | 'send' = 'send';
  @Input() public isLoading?: boolean;
  @Input() public isError?: boolean;
  @Input() public isActive?: boolean;
  @Input() public text?: string;

  public ngOnInit() {
  }

}
