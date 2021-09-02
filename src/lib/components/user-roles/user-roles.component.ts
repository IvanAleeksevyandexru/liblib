import { Component, HostListener, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../services/menu/menu.service';
import { LoadService } from '../../services/load/load.service';

@Component({
  selector: 'lib-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent implements OnInit {

  public user = this.loadService.user;
  public userRoles = this.menuService.getUserRoles(this.user);
  public roleChangeAvailable = true;
  public showRolesList: boolean;
  public activeRoleCode: string;

  @HostListener('document:keydown', ['$event'])
  public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showRolesList = false;
    }
  }

  @HostListener('document:click', ['$event'])
  public onClickOut(event) {
    if (!event.target.classList.contains('user-role-inner')) {
      this.showRolesList = false;
    }
  }

  constructor(
    public loadService: LoadService,
    public translate: TranslateService,
    private menuService: MenuService
  ) { }

  public ngOnInit(): void {
    this.loadService.userTypeNA$.subscribe(type => {
      this.activeRoleCode = type;
    });
    this.roleChangeAvailable = HelperService.langIsRus(this.translate.currentLang);
  }

  public openRolesList(): void {
    this.showRolesList = !this.showRolesList;
  }

  public getRoleName(code: string): string {
    return this.userRoles.find(role => role.code === code).secondName;
  }

  public updateRole(code: string): void {
    this.activeRoleCode = code;
  }

}
