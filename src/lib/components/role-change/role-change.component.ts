import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadService } from '../../services/load/load.service';
import { Role, User } from '../../models/user';
import { RedirectsService } from '../../services/redirects/redirects.service';
import { EsiaApiService } from '../../services/esia-api/esia-api.service';
import { ModalService } from '../../services/modal/modal.service';
import { LibTranslateService } from '../../services/translate/translate.service';
import { HelperService } from '../../services/helper/helper.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';

const COUNT_ROLES_PER_ADD_BUTTON = 3;
const PAGE_SIZE = 5;

@Component({
  selector: 'lib-role-change',
  templateUrl: './role-change.component.html',
  styleUrls: ['./role-change.component.scss']
})
export class RoleChangeComponent implements OnInit {

  public roles: Role[] = [];
  public filteredRoles: Role[] = [];
  public displayRoles: Role[] = [];
  public user: User;
  public query: string = this.activatedRoute.snapshot.queryParamMap.get('q') || '';
  public rUrl: string = this.activatedRoute.snapshot.queryParamMap.get('rUrl') || '';
  public type: string = this.activatedRoute.snapshot.queryParamMap.get('type') || '';
  public isCreatedBusiness: boolean;
  public isMoreRoles: boolean;
  public createUrl: string = this.loadService.config.esiaUrl + '/profile/user/emps';
  public pageSize = PAGE_SIZE;
  public activePage: number = parseInt(this.activatedRoute.snapshot.queryParamMap.get('page'), 10) || 1;
  public total: number;
  public urlPage: string;

  private appContext = this.loadService.attributes.appContext;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private esiaApi: EsiaApiService,
    private loadService: LoadService,
    private helperService: HelperService,
    private redirectsService: RedirectsService,
    private modalService: ModalService,
    public libTranslate: LibTranslateService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      const page = 'page';
      this.urlPage = params[page];
    });
  }

  public ngOnInit() {
    this.user = this.loadService.user;

    this.getRoles();
  }

  public getRoles(): void {
    this.esiaApi.getRequest('prns/prn_oid/roles', 1).subscribe(response => {
      this.roles = response.elements;

      // Добавляем к имеющимся ролям еще роль физика, чтобы в списке была, как один из пунктов
      // с типом PRIVATE
      const isPrivatePerson = this.loadService.user.userType === 'P';
      const privatePerson: Role = {
        shortName: this.user.formattedName,
        type: 'PRIVATE',
        current: isPrivatePerson,
      };

      if (!isPrivatePerson) {
        this.roles.forEach(role => role.current = (role.oid === Number(this.loadService.user.orgOid)));
      }

      this.roles.unshift(privatePerson);

      this.filterRoles(this.query, this.activePage, this.type);

      if (this.roles.length >= COUNT_ROLES_PER_ADD_BUTTON) {
        this.isMoreRoles = true;
      }

      // добавляем роль по типу, чтобы можно было привязать корректно транслейт
      for (const role of this.roles) {
        role.roleByType = 'EMPLOYEE';

        if (role.type === 'PRIVATE') {
          role.roleByType = 'PRIVATE';
        }
        if (role.chief === true) {
          role.roleByType = 'SUPERVISOR';
        }
        if (role.type === 'BUSINESS' && role.chief === true) {
          this.isCreatedBusiness = true;
          role.roleByType = 'BUSINESSMAN';
        }
      }
    });
  }

  /**
   * Обработчик переключения роли по клику
   *
   * @param role Роль пользователя
   * @param event Событие клика
   */
  public switchRole(role: Role, event?: Event): void {
    if (role.current) {
      return;
    }
    const prevRole = this.roles.find((someRole) => someRole.current);

    let params = {_: Math.random().toString()};
    if (role.oid) {
      params = Object.assign(params, {orgId: role.oid.toString()});
    }
    this.http.get(`${this.loadService.config.lkApiUrl}users/switch`, {
      withCredentials: true,
      params
    }).subscribe(response => {
      if (this.rUrl && this.appContext === 'LK') {
        window.location.href = this.loadService.config.betaUrl + this.rUrl;
      } else {
        if (prevRole.type === 'PRIVATE' && role.type !== 'PRIVATE' && this.appContext !== 'PARTNERS') {
          this.redirectsService.redirectToOrganizationView();
        } else {
          window.location.href = '/';
        }
      }
    });

    if (event) {
      event.preventDefault();
    }
  }

  /**
   * Показываем аватар при наличии ссылки на него и, если пользватель физическое лицо,
   * либо руководитель предприятия
   *
   * @param role Роль пользователя
   */
  public isShowAvatar(role: Role): boolean {
    return !!this.user.person.person.avatarLink && this.privateOrBusiness(role);
  }

  /**
   * Определяем роль физического лица или руководитель Предприятия
   *
   * @param role Роль пользователя
   */
  public privateOrBusiness(role: Role): boolean {
    return role.type === 'PRIVATE' || (role.type === 'BUSINESS' && role.chief === true);
  }

  /**
   * Определяем роль физического лица d ИП, если он сотрудник
   *
   * @param role Роль пользователя
   */
  public empRole(role: Role): boolean {
    return role.type === 'BUSINESS' && role.chief !== true;
  }

  /**
   * Изменение номера страницы(обновляем и в роутинге для корректной перезагрузки страницы)
   *
   * @param pageNum Номер страницы
   */
  public pageChanged(pageNum): void {
    const startPosition = (pageNum - 1) * this.pageSize;
    this.activePage = pageNum;
    this.displayRoles = this.filteredRoles.slice(startPosition, startPosition + this.pageSize);

    if (this.roles.length > PAGE_SIZE) {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page: pageNum,
          q: this.query,
        }
      };

      if (this.urlPage !== pageNum.toString()) {
        this.router.navigate(['/roles'], navigationExtras);
      }
    }

    this.total = this.filteredRoles.length;
  }

  /**
   * Событие после ввода в поле Поиска
   *
   * @param newQuery Событие нажатия в поле
   */
  public updateQuery(newQuery: string): void {
    this.query = newQuery || '';
    this.filterRoles(this.query, 1, this.type);
  }

  /**
   * Фильтруем по Короткому имени(shortName), полному имени(fullName) или ОГРН
   *
   * @param query строка запроса
   * @param activePage номер страницы
   * @param type тип роли
   */
  private filterRoles(query: string, activePage, type: string): void {
    this.filteredRoles = this.roles.filter(item => {
        if (query && (item.shortName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          item.fullName && item.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          (item.ogrn ? (item.ogrn.indexOf(query) !== -1) : false))) {
          return true;
        } else {
          // agency и legal не разделяем, а person должен быть private
          type = type === 'person' ? 'private' : type;
          let personType = item.type.toLowerCase();
          personType = personType === 'agency' ? 'legal' : personType;
          type = type === 'agency' ? 'legal' : type;
          return personType?.indexOf(type) > -1;
        }
      }
    );

    if (this.filteredRoles.length === 1 && type && activePage === 1) {
      this.switchRole(this.filteredRoles[0]);
    }

    this.pageChanged(activePage);
  }

  public createBusinessAndAgency(business: boolean = true) {
    if (this.helperService.deviceTypeParam === 'mob') {
      this.libTranslate.get('ROLE_CHANGE.MODAL')
        .subscribe((data) => {
          this.modalService.popupInject(ConfirmActionComponent, null, {
            title: data.TITLE,
            description: business ? data.DESCRIPTION_BUSINESS : data.DESCRIPTION_AGENCY,
            buttons: [{
              title: data.BUTTON_TITLE,
              color: '',
              handler: () => {
                window.location.href = data.BUTTON_HANDLER_URL;
              }
            }]
          });
        }
      );
    } else {
      window.location.href = this.createUrl;
    }
  }
}
