import { Component, EventEmitter, Input, isDevMode, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { LoadService } from '../../services/load/load.service';
import { CounterData } from '../../models/counter';
import { User } from '../../models/user';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Input() public userCounter: CounterData;

  public user: User;
  public avatarError = false;

  @Output()
  public userClick: EventEmitter<any> = new EventEmitter();

  constructor(
    private authService: AuthService,
    public loadService: LoadService
  ) { }

  public ngOnInit() {
    this.user = this.loadService.user;
  }

  public login() {
    if (isDevMode()) {
      this.authService.login().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      window.location.href = '/node-api/login/?redirectPage=' +
        encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    }
  }

  public logout() {
    if (isDevMode()) {
      this.authService.logout().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      window.location.href = this.loadService.config.betaUrl + 'auth-provider/logout';
    }
  }

  public userClicked() {
    this.userClick.emit(this.user);
  }

}
