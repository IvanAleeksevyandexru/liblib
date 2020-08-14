import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-hidden-tooltip',
  templateUrl: './hidden-tooltip.component.html',
  styleUrls: ['./hidden-tooltip.component.scss']
})
export class HiddenTooltipComponent implements OnInit {
  @Input() public caption = ''; // Заголовок, клик по которому будет скрывать/раскрывать контент
  @Input() public hidden = true; // Состояние видимости контента
  @Input() public offset = true; // Отступы, по умолчанию активны

  constructor() { }

  public ngOnInit() {
  }

  /**
   * Метод переключает состояние видимости контента
   */
  public toggleHidden() {
    this.hidden = !this.hidden;
  }

}
