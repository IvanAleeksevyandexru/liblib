import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'lib-expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss']
})
export class ExpansionPanelComponent implements OnInit {

  @Input() public opened = false;
  @Input() public title: string;
  @Input() public type: 'accordion' | 'gray-accordion' | 'for-footer' | 'light' = 'accordion';
  @Input() public customClass: string;
  @Output() public toggle = new EventEmitter<any>();
  constructor() { }

  public ngOnInit() {
  }

  public onClick(event: Event) {
    event.preventDefault();
    this.opened = !this.opened;
    this.toggle.emit(this.opened);
  }

}
