import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-hidden-tooltip',
  templateUrl: './hidden-tooltip.component.html',
  styleUrls: ['./hidden-tooltip.component.scss']
})
export class HiddenTooltipComponent implements OnInit {
  @Input() public caption = ''; // Заголовок, клик по которому будет скрывать/раскрывать контент
  @Input() public large = false; // false — 12px/16px | true — 14px/20px(mobile) 16px/24px(tablet,desktop)
  @Input() public hidden = true; // Состояние видимости контента
  @Input() public offset = true; // Отступы, по умолчанию активны
  @Input() public arrowHidden = false; // скрыть стрелку состояния видимости
  @Input() public beautiful = false; // использовать подложку
  @Input() public closable = false; // возможность закрыть на крестик
  @Input() public questionMode = false; // значок хинта вместо caption, если true - caption не будет показан
  @Input() public offsetTopContent = 'mt-16'; // отступ открытого контента от заголовка

  constructor() { }

  public ngOnInit(): void {
  }

  /**
   * Метод переключает состояние видимости контента
   */
  public toggleHidden() {
    this.hidden = !this.hidden;
  }

}
