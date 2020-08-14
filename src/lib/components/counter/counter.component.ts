import { Component, Input, OnInit } from '@angular/core';
import { CounterData } from '../../models/counter';

@Component({
  selector: 'lib-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit {
  @Input() public counter: CounterData;

  public ngOnInit() { }
}
