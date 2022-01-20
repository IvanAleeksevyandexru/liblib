import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Action } from '@epgu/ui/models';
import { SharedService } from '@epgu/ui/services/shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss']
})
export class ActionsMenuComponent implements OnInit, OnDestroy {

  @Input() public actions: Action[] = []; // Входной массив с элементами меню
  @Input() public countOutside = 2; // Количество элементов вне меню на десктопе
  @Input() public showMenu = false; // Состояние меню
  @Input() public disabled = false; // Активность меню
  @Input() public closable = false; // Возможность закрыть на крестик + отступы под формат с закрытием
  // с absolute располагается в правом верхнем углу
  @Input() public position: 'relative' | 'absolute' | 'absolute-16' | 'absolute-24' = 'absolute';
  @Input() public menuWidth = '240px';
  private uniqueId = Math.random();
  private sub: Subscription;

  constructor(
    private sharedService: SharedService,
  ) { }

  public ngOnInit(): void {
    this.sub = this.sharedService.on('action-menu-opened').subscribe((id: number) => {
      if (id !== this.uniqueId) {
        this.showMenu = false;
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public open(): void {
    if (!this.disabled) {
      this.showMenu = true;
      this.sharedService.send('action-menu-opened', this.uniqueId);
    }
  }

  public close(): void {
    this.showMenu = false;
  }
}
