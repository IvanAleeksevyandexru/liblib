import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-integration-base',
  templateUrl: './integration-base.component.html',
  styleUrls: ['./integration-base.component.scss']
})
export class IntegrationBaseComponent implements OnInit {

  @Input() public icon: string;
  @Input() public title: string;
  @Input() public name: string;

  constructor() {
  }

  public ngOnInit() {
  }

}
