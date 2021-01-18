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
  @Input() public onlyIcon: boolean;
  @Input() public useButton: boolean;

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
    console.log(this.user);
  }

  public login(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (isDevMode()) {
      this.authService.login().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      window.location.href = '/node-api/login/?redirectPage=' +
        encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    }
  }

  public register(event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    window.location.href = this.loadService.config.esiaUrl + '/registration/';
  }

  public logout() {
    this.loadService.logout();
  }

  public userClicked() {
    this.userClick.emit(this.user);
  }

}
