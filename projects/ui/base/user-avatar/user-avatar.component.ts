import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { User, Role } from '@epgu/ui/models/user';
import { Avatar } from '@epgu/ui/models';
import { UserHelperService } from '@epgu/ui/services/user-helper';

@Component({
  selector: 'lib-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent implements OnInit {
  @Input() public avatar: Avatar;
  @Input() public height = 64;
  @Input() public hideEdit = false;
  @Input() public user: User;
  @Input() public role?: Role;
  @Input() public noAvatarColorLikeGoogle = false;
  @Output() public edit = new EventEmitter<void>();

  public noAvatarColor = '';
  private noAvatarColors = {
    business: '#FF8A00',
    person: '#9B3BE5',
  };

  public avatarError = false;

  // TODO: Возможно поведение при ИП будет отличаться, сейчас как у руководителя
  public get isIPRole(): boolean {
    return this.role?.type === 'BUSINESS' || this.user.type === 'B';
  }
  public get isLegalRole(): boolean {
    return this.role?.type === 'LEGAL' || this.user.type === 'L';
  }

  public get isPrivatePerson(): boolean {
    return this.user.type !== 'B' && this.user.type !== 'L';
  }

  /** Определяем роль физического лица и ИП, если он сотрудник. */
  public get isEmployee(): boolean {
    if (!this.role) {
      return false;
    }
    return this.role.type === 'BUSINESS' && this.role.chief !== true;
  }

  /** Определяем роль физического лица или руководитель Предприятия. */
  public get isPrivateOrBusinessChief(): boolean {
    if (!this.role) {
      return this.isPrivatePerson;
    }
    return (
      this.role.type === 'PRIVATE' ||
      (this.role.type === 'BUSINESS' && this.role.chief === true)
    );
  }

  /** Первые буквы фамилии и имени. */
  public get userFirstLetters(): string {
    const regex = /[a-zA-Zа-яА-ЯёЁ]/;
    let lastNameLetter = 'Ф';
    let firstNameLetter = 'И';
    if (regex.test(this.user.lastName)) {
      lastNameLetter = this.user.lastName.match(regex).toString().toUpperCase();
    }
    if (regex.test(this.user.firstName)) {
      firstNameLetter = this.user.firstName
        .match(regex)
        .toString()
        .toUpperCase();
    }
    return lastNameLetter + firstNameLetter;
  }

  constructor(
    public userHelper: UserHelperService
  ) {
  }

  public ngOnInit(): void {
    this.noAvatarColor = this.getNoAvatarColor();
  }

  /**
   * Вернуть цвет для заливки аватара.
   */
  public getNoAvatarColor(): string {
    if (this.noAvatarColorLikeGoogle) {
      return this.getColorLikeGoogle(this.user.fullName);
    }

    if (this.isPrivateOrBusinessChief) {
      return this.noAvatarColors.person;
    }
    return this.noAvatarColors.business;
  }

  /** Возвращает цвет для заливки фона в зависимости от имени, если нет аватара. */
  private getColorLikeGoogle(userName: string): string {
    let hash = 0;
    let color = '#';

    if (!userName) {
      return color + '333333';
    }

    const strLength = userName.length;

    for (let i = 0; i < strLength; i++) {
      // tslint:disable-next-line: no-bitwise
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (let i = 0; i < 3; i++) {
      // tslint:disable-next-line: no-bitwise
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color;
  }
}
