import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-icon-action',
  templateUrl: './icon-action.component.html',
  styleUrls: ['./icon-action.component.scss']
})
export class IconActionComponent implements OnInit {

  @Input() public icon: string;
  @Input() public hoverIcon: string;
  @Input() public text: string;
  @Input() public mobAsHoverState = false;
  @Output() public clickAction = new EventEmitter();

  constructor() { }

  public ngOnInit(): void {
  }

  public onActionClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.clickAction.emit(event);
  }
}
