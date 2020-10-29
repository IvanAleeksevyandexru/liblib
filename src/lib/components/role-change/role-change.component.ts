import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { HelperService } from '../../services/helper/helper.service';
import { LoadService } from '../../services/load/load.service';
import { TabsService } from '../../services/tabs/tabs.service';
import { User, Role } from '../../models/user';
import { TranslateService } from '@ngx-translate/core';
import { RedirectsService } from '../../services/redirects/redirects.service';
import { EsiaApiLibService } from '../../services/esia-api/esia-api-lib.service';

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
    private esiaApi: EsiaApiLibService,
    private loadService: LoadService,
    private redirectsService: RedirectsService,
    public translate: TranslateService
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
      const privatePerson: Role = {
        shortName: this.user.formattedName,
        type: 'PRIVATE',
        current: true
      };
      this.roles.unshift(privatePerson);

      this.filterRoles(this.query, this.activePage);

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
  public switchRole(role: Role, event: Event): void {
    if (role.current) {
      return;
    }
    const prevRole = this.roles.find((someRole) => someRole.current);
    this.http.get(`${this.loadService.config.lkApiUrl}users/switch`, {
      withCredentials: true,
      params: {
        orgId: role.oid,
        _: Math.random().toString()
      }
    }).subscribe(response => {
      if (prevRole.type === 'PRIVATE' && role.type !== 'PRIVATE' && this.appContext !== 'PARTNERS') {
        this.redirectsService.redirectToOrganizationView();
      } else {
        window.location.href = '/';
      }
    });

    event.preventDefault();
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
    this.filterRoles(this.query, 1);
  }

  /**
   * Фильтруем по Короткому имени(shortName), полному имени(fullName) или ОГРН
   *
   * @param query строка запроса
   * @param activePage номер страницы
   */
  private filterRoles(query: string, activePage): void {
    this.filteredRoles = this.roles.filter(item => {
        return item.shortName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          item.fullName && item.fullName.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          (item.ogrn ? (item.ogrn.indexOf(query) !== -1) : false);
      }
    );

    this.pageChanged(activePage);
  }
}
