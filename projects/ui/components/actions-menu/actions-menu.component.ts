import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Action } from '@epgu/ui/models';

@Component({
  selector: 'lib-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss']
})
export class ActionsMenuComponent implements OnInit {

  @Input() public actions: Action[] = []; // Входной массив с элементами меню
  @Input() public countOutside = 2; // Количество элементов вне меню на десктопе
  @Input() public showMenu = false; // Состояние меню
  @Input() public disabled = false; // Активность меню
  @Input() public closable = false; // Возможность закрыть на крестик + отступы под формат с закрытием

  @HostListener('document:click', ['$event']) public onClick(event) {
    const target = event.target;

    if (!target.classList.contains('actions-menu') && !target.classList.contains('actions-menu-button')) {
      this.showMenu = false;
    }
  }

  constructor() { }

  public ngOnInit() { }

}
