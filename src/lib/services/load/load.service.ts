import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Avatar } from '../../models/avatar';
import { UserTypeParams } from '../../models/user-type-params';
import { Document } from '../../models/document';
import { Person, PersonData, User, Role } from '../../models/user';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class LoadService {

  private params: any = null;
  public avatar: BehaviorSubject<Avatar>;
  public loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public initializationStarted = false;

  constructor(
    private http: HttpClient,
    private constants: ConstantsService
  ) {
  }

  private prepareData(params: any): void {
    const data = params.data;
    const user = data.user as User;

    params.attrs.platform = 'EPGUV3_' +
      (params.attrs.deviceType === 'desk' ? 'DESK' : (params.attrs.deviceType === 'mob' ? 'MOB' : 'TAB'));

    if (data.user && data.user.person) {
      const personData = user.person as PersonData;
      const person = personData.person ? personData.person as Person : null;

      user.authorized = true;
      user.type = user.orgType || (user.userType === 'P' && user.personType === 'F' ? 'F' : user.userType);
      user.typeParams = new UserTypeParams(user.type);
      user.shortName = `${user.lastName} ${user.firstName[0]}.`;
      user.fullName = `${user.lastName} ${user.firstName}`;

      if (user.middleName) {
        user.shortName += ` ${user.middleName[0]}.`;
        user.fullName += ` ${user.middleName}`;
      }

      if (person) {
        this.avatar = new BehaviorSubject<Avatar>({
          url: person.avatarLink,
          gender: person.gender
        });

        if (user.orgType) {
          user.orgPosition = person.position;
        }
      }

      if (person.trusted) {
        user.level = 3;
      } else {
        const hasVerifiedDocument = personData.docs.some((document: Document) => document.vrfStu === this.constants.STATUS_VERIFIED);

        // если у пользователя есть СНИЛС и хотя бы один подтвержденный документ;
        if (user.snils && hasVerifiedDocument) {
          user.level = 2;
        } else {
          user.level = 1;
        }
      }
    } else {
      user.authorized = false;
      user.typeParams = new UserTypeParams('');
    }

    this.params = params;
  }

  public load(context: string): Promise<any> {
    this.setInitializationStarted();
    if (isDevMode()) {
      return new Promise((resolve, reject) => {
        this.http
          .get(`/node-api/${context}`, {withCredentials: true})
          .toPromise()
          .then((params: any) => {
            this.prepareData(params);
            this.loaded.next(true);
            resolve();
          }, () => {
            reject();
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.prepareData((window as any).serverData);
        this.loaded.next(true);
        resolve();
      });
    }

  }

  public setInitializationStarted() {
    this.initializationStarted = true;
  }

  public isInitializationStarted(): boolean {
    return this.initializationStarted;
  }

  public get config(): any {
    return this.params.config;
  }

  public get attributes(): any {
    return this.params.attrs;
  }

  public get user(): User {
    return this.params.data.user;
  }

  public getRoles(): Role[] {
    return [...this.user.person.roles];
  }

  public setAvatar(avatar: Avatar) {
    this.avatar.next(avatar);
  }
}
