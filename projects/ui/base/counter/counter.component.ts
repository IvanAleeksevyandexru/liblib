import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CounterData } from '@epgu/ui/models/counter';

@Component({
  selector: 'lib-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit, OnChanges {

  @Input() public counter: CounterData | number;

  public count: number;

  public ngOnInit() {
    this.updateNumber();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.updateNumber();
  }

  public updateNumber() {
    if (this.counter) {
      if ((this.counter as CounterData).unread) {
        this.count = (this.counter as CounterData).unread;
      } else {
        this.count = this.counter as number;
      }
    } else {
      this.count = 0;
    }
  }
}
