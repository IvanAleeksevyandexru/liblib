import { Component, Input } from '@angular/core';


@Component({
  selector: 'lib-light-header',
  templateUrl: './light-header.component.html',
  styleUrls: ['./light-header.component.scss']
})
export class LightHeaderComponent {

  @Input() public title: string;
  @Input() public otherMainPage: string;

  constructor() { }

}
