import { Injectable } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';

@Injectable({
  providedIn: 'root'
})
export class UserHelperService {

  private user = this.loadService.user || {};

  constructor(
    private loadService: LoadService,
  ) { }

  public get isFL(): boolean {
    return this.user.userType === 'P' && this.user.personType !== 'F';
  }

  public get isIG(): boolean {
    return this.user.userType === 'P' && this.user.personType === 'F';
  }

  public get isIP(): boolean {
    return this.user.orgType === 'B';
  }

  public get isUL(): boolean {
    return this.user.orgType === 'L' && this.user.person.org.type === 'LEGAL';
  }

  public get isOGV(): boolean {
    return this.user.orgType === 'L' && this.user.person.org.type === 'AGENCY';
  }

  public get isPerson(): boolean { // ФЛ или ИГ
    return this.user.userType === 'P';
  }

  public get isEntity(): boolean { // ЮЛ или ОГВ
    return this.user.userType === 'O' && this.user.orgType === 'L';
  }

  /**
   * Руководитель
   */
  public get isChief(): boolean {
    return this.user.empEpguRole === 'chief';
  }

  /**
   * Администратор
   * Может все, за исключением подачи заявлений на получение услуг от лица организации.
   */
  public get isAdmin(): boolean {
    return this.user.empEpguRole === 'admin';
  }

  /**
   * Создатель черновиков
   * Может создавать черновики заявлений на получение услуг, но не может подавать их от лица организации.
   */
  public get isDraftAccess(): boolean {
    return this.user.empEpguRole === 'draftAccess';
  }

  /**
   * Сотрудник организации
   * Может просматривать общую информацию на портале и писать обращения в службу поддержки.
   */
  public get isEmployee(): boolean {
    return this.user.empEpguRole === 'noRight';
  }

}
