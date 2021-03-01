import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Catalog } from '../../models/main-page.model';
import { Subscription } from 'rxjs';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-menu-catalog',
  templateUrl: './menu-catalog.component.html',
  styleUrls: ['./menu-catalog.component.scss']
})
export class MenuCatalogComponent implements OnInit, OnDestroy {

  @Input() public catalog: Catalog[];
  @Output() public menuCatalogOpened = new EventEmitter<boolean>();

  public showMenu = false;
  public subscription: Subscription;
  public readonly scrollConfig = {
    wheelPropagation: true
  };

  constructor(
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {

  }

  public disableScroll(isMenuOpen: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    if (isMenuOpen) {
      html.classList.add('disable-scroll');
    } else {
      html.classList.remove('disable-scroll');
    }
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public onMenuClick() {
    this.showMenu = !this.showMenu;
    this.disableScroll(this.showMenu);
    this.menuCatalogOpened.emit(this.showMenu);
  }
}
