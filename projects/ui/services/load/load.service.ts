import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Avatar } from '@epgu/ui/models';
import { UserTypeParams } from '@epgu/ui/models/user-type-params';
import { Document } from '@epgu/ui/models/document';
import { Person, PersonData, Role, User } from '@epgu/ui/models/user';
import { HelperService } from '@epgu/ui/services/helper';
import { AuthService } from '@epgu/ui/services/auth';
import { SmuEventsService } from '@epgu/ui/services/smu-events';
import { ConstantsService } from '@epgu/ui/services/constants';

const EMPTY_CONFIG_STUB = {data: {user: {}}, attrs: {}, config: {}, hidePageConfig: {}};

@Injectable({
  providedIn: 'root'
})
export class LoadService {

  private params: any = HelperService.deepCopy(EMPTY_CONFIG_STUB);
  public avatar: BehaviorSubject<Avatar>;
  public loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public initializationStarted = false;
  private userTypeNA: BehaviorSubject<string> = new BehaviorSubject<string>('P');
  public userTypeNA$ = this.userTypeNA.asObservable();
  public isEmbedded = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private smuEventsService: SmuEventsService,
    private authService: AuthService,
    private helperService: HelperService,
    private constants: ConstantsService,
  ) {
  }

  private prepareData(params: any, packageVersion: string): void {
    const data = params.data;
    const user = data.user as User;

    params.attrs.platform = 'EPGUV3_' +
      (params.attrs.deviceType === 'desk' ? 'DESK' : (params.attrs.deviceType === 'mob' ? 'MOB' : 'TAB'));

    this.helperService.deviceTypeParam = params.attrs.deviceType;

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

        // ???????? ?? ???????????????????????? ???????? ?????????? ?? ???????? ???? ???????? ???????????????????????????? ????????????????;
        if (user.snils && hasVerifiedDocument) {
          user.level = 2;
        } else {
          user.level = 1;
        }
      }

      user.isKid = user.type === 'K' || user.personType === 'KD' || user.assuranceLevel === 'AL13';

    } else {
      user.authorized = false;
      user.typeParams = new UserTypeParams('');
    }

    if (this.params.config.packageVersion && !packageVersion) {
      packageVersion = this.params.config.packageVersion;
    }

    this.params = params;
    this.params.config.packageVersion = packageVersion;
    this.setUserTypeNA();
    if (this.params.config.isEmbedded) {
      this.setIsEmbedded(true);
    }
  }

  public load(context: string, ignoreConfigMissing = false, ignoreDevMode = false, packageVersion = ''): Promise<any> {
    this.setInitializationStarted();
    if (isDevMode() && !ignoreDevMode) {
      return new Promise((resolve, reject) => {
        this.http
          .get(`/node-api/${context}`, {withCredentials: true})
          .toPromise()
          .then((params: any) => {
            this.prepareData(params, packageVersion);
            this.loaded.next(true);
            resolve(true);
          }, () => {
            if (ignoreConfigMissing) {
              this.prepareData(EMPTY_CONFIG_STUB, packageVersion);
              this.loaded.next(true);
              resolve(true);
            } else {
              reject();
            }
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.prepareData((window as any).serverData, packageVersion);
          this.loaded.next(true);
          resolve(true);
        } catch (e) {
          if (ignoreConfigMissing) {
            this.prepareData(EMPTY_CONFIG_STUB, packageVersion);
            this.loaded.next(true);
            resolve(true);
          } else {
            reject();
          }
        }
      });
    }

  }

  public setUserTypeNA(newType?: string): void {
    if (!this.user.authorized) {
      const appContext = this.attributes.appContext;
      if (newType) {
        this.userTypeNA.next(newType);
      } else if (appContext === 'PORTAL') {
        const route = location.pathname;
        const type = route === '/legal-entity' ? 'L' : route === '/entrepreneur' ? 'B' : 'P';
        this.userTypeNA.next(type);
      } else if (appContext === 'PARTNERS') {
        this.userTypeNA.next('I');
      } else {
        this.userTypeNA.next('P');
      }
    }
  }

  public setInitializationStarted() {
    this.initializationStarted = true;
  }

  public isInitializationStarted(): boolean {
    return this.initializationStarted;
  }

  public setProperty(propertyName: string, propertyValue: any) {
    this.params.config[propertyName] = propertyValue;
  }

  public get config(): any {
    return this.params.config;
  }

  public get hidePageConfig(): any {
    return this.params.hidePageConfig;
  }

  public get attributes(): any {
    return this.params.attrs;
  }

  public get user(): User {
    return this.params.data.user;
  }

  public getRoles(): Role[] {
    return this.user.person ? [...this.user.person.roles] : [];
  }

  public setAvatar(avatar: Avatar) {
    this.avatar.next(avatar);
  }

  public setUserTypeParams(newType: string) {
    this.user.typeParams = new UserTypeParams(newType);
  }

  public setIsEmbedded(val: boolean): void {
    document.body.classList.add('web-view-mode');
    this.smuEventsService.init();
    this.isEmbedded.next(val);
  }

  public logout(): void {
    if (isDevMode()) {
      this.authService.logout().subscribe((resp) => {
        window.location = resp;
      });
    } else {
      window.location.href = this.config.betaUrl + 'auth/logout?_=' + Math.random();
    }
  }

}
