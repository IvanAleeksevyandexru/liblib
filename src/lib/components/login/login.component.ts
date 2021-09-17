import {
  Component,
  EventEmitter,
  Input,
  isDevMode,
  OnInit,
  Output,
} from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { LoadService } from '../../services/load/load.service';
import { MenuService } from '../../services/menu/menu.service';
import { CounterData } from '../../models/counter';
import { User } from '../../models/user';
import { CommonController } from '../../common/common-controller';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends CommonController implements OnInit {

  @Input() public userCounter: CounterData;
  @Input() public onlyIcon: boolean;
  @Input() public onlyText: boolean;
  @Input() public useButton: boolean;
  @Input() public loginWithNode = true;
  @Output()
  public toggleMenu = new EventEmitter<void>();

  public user: User;

  public avatar$ = this.loadService.avatar.asObservable();
  public avatarError = false;

  public menuOpened$ = this.menuService.menuIsOpen$;

  constructor(
    private authService: AuthService,
    public loadService: LoadService,
    private menuService: MenuService,
  ) {
    super();
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
    if (this.loginWithNode) {
      if (isDevMode()) {
        this.authService.login().subscribe((resp) => {
          window.location = resp;
        });
      } else {
        window.location.href = '/node-api/login/?redirectPage=' +
          encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
      }
    } else {
      window.location.href = this.loadService.config.authProviderLoginUrl + btoa(window.location.href);
    }
  }

  public register(event: Event): void {
    this.stopEvent(event);
    window.location.href = this.loadService.config.esiaUrl + '/registration/';
  }

  public logout(): void {
    this.loadService.logout();
  }
}
