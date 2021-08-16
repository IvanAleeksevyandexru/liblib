import { Component, EventEmitter, Input, isDevMode, OnInit, Output } from '@angular/core';
import { AuthService } from '@epgu/ui/services/auth';
import { LoadService } from '@epgu/ui/services/load';
import { CounterData } from '@epgu/ui/models/counter';
import { User } from '@epgu/ui/models/user';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Input() public userCounter: CounterData;
  @Input() public onlyIcon: boolean;
  @Input() public onlyText: boolean;
  @Input() public menuOpened: boolean;
  @Input() public useButton: boolean;

  public user: User;
  public avatarError = false;

  @Output() public userClick: EventEmitter<any> = new EventEmitter();
  @Output() public closeMenu: EventEmitter<any> = new EventEmitter();

  constructor(
    private authService: AuthService,
    public loadService: LoadService
  ) {
  }

  public ngOnInit(): void {
    this.user = this.loadService.user;
  }

  private stopEvent(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  public login(event?: Event): void {
    this.stopEvent(event);
    if (isDevMode()) {
      this.authService.login().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      window.location.href = '/node-api/login/?redirectPage=' +
        encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    }
  }

  public register(event: Event): void {
    this.stopEvent(event);
    window.location.href = this.loadService.config.esiaUrl + '/registration/';
  }

  public logout(): void {
    this.loadService.logout();
  }

  public userClicked(): void {
    this.userClick.emit();
  }

  public onCloseMenu(event: Event): void {
    this.stopEvent(event);
    this.closeMenu.emit();
  }

}
