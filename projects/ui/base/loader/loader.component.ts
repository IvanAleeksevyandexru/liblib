import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  @Input() public color: 'white' | 'black' | '' = ''; // если не указан - синий
  @Input() public size: 'big' | 'small' | '' = ''; // размер: большой, маленький; если не указан - обычный

  constructor() { }

  public ngOnInit() {
  }

}
