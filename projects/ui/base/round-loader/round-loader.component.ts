import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-round-loader',
  templateUrl: './round-loader.component.html',
  styleUrls: ['./round-loader.component.scss']
})
export class RoundLoaderComponent implements OnInit {

  @Input() public color: 'light' | 'blue' = 'light';

  constructor() { }

  public ngOnInit(): void {
  }

}
