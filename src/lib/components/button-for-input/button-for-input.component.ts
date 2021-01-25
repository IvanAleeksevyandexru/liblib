import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'lib-button-for-input',
  templateUrl: './button-for-input.component.html',
  styleUrls: ['./button-for-input.component.scss']
})
export class ButtonForInputComponent implements OnInit {
  @Input() public type: 'lookup' | 'arrow' = 'arrow';
  @Input() public isLoading?: boolean;
  @Input() public isError?: boolean;

  public ngOnInit() {
  }

}
