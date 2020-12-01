import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { LoadService } from '../load/load.service';
import { InfoCardView } from '../../models/info-card-view';
import { DatesHelperService } from '../dates-helper/dates-helper.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { YaMetricService } from '../ya-metric/ya-metric.service';
import * as moment_ from 'moment';

const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private url = (window as any).location.href;
  public config = this.loadService.config;
  public user: any = this.loadService.user;

  private DOCUMENT_TYPES = this.constants.DOCUMENT_TYPES;

  private delegatedRightsData;

  constructor(
    private constants: ConstantsService,
    public loadService: LoadService,
    private http: HttpClient,
  ) {
  }

  private static getSeriesNumberCert(object): string {
    const seriesCert = (object.birthCert && object.birthCert.series ? (object.birthCert.series + ' ') : '');
    const numberCert = object.birthCert ? object.birthCert.number : '';
    return seriesCert + numberCert;
  }

  private static isExpiredForeignPassport(foreignPassport): boolean {
    return foreignPassport && DatesHelperService.isExpiredDate(foreignPassport.expiryDate);
  }

  private static isExpiredSoonForeignPassport(foreignPassport): boolean {
    return foreignPassport
      && DatesHelperService.isExpiredDateAfter(foreignPassport.expiryDate, 3, 'months') &&
      !ProfileService.isExpiredForeignPassport(foreignPassport);
  }

  private static getForeignPassportNotification(foreignPassport): string {
    if (ProfileService.isExpiredForeignPassport(foreignPassport)) {
      return  'PROFILE.FOREIGN_PASSPORT.EXPIRED_WARNING_SHORT';
    } else if (ProfileService.isExpiredSoonForeignPassport(foreignPassport)) {
      return 'PROFILE.FOREIGN_PASSPORT.EXPIRED_3M_SHORT';
    } else {
      return '';
    }
  }

  private static getFidDocNotification(fidDoc): string {
    if (ProfileService.isExpiredForeignPassport(fidDoc)) {
      return  'PROFILE.FID_DOC.EXPIRED_WARNING_SHORT';
    } else if (ProfileService.isExpiredSoonForeignPassport(fidDoc)) {
      return 'PROFILE.FID_DOC.EXPIRED_3M_SHORT';
    } else {
      return '';
    }
  }

  public createCardObject(object: any): InfoCardView {
    switch (object.type) {
      case this.DOCUMENT_TYPES.MEDICAL_POLICY: {
        const result = {
          attrId: 'oms',
          canDetails: false,
          canEdit: !this.loadService.user.isKid,
          canDelete: !this.loadService.user.isKid,
          withVerificationIcon: false,
          serviceUrl: object.serviceUrl,
          empty: {
            title: 'Полис ОМС',
            subtitle: 'Необходим для записи на прием в поликлиники и больницы',
          },
          full: {
            title: 'Полис ОМС'
          },
          fields: [
            {
              title: '',
              value: object.number || ''
            }
          ]
        };
        if (object.expiryDate) {
          result.fields.push({title: 'Действителен до', value: object.expiryDate});
        }
        return result;
      }
      case this.DOCUMENT_TYPES.PASSPORT: {
        const result: InfoCardView = {
          attrId: 'ident',
          canDetails: true,
          canEdit: false,
          canRepeat: true,
          vrfStu: object.vrfStu,
          type: object.type,
          serviceUrl: '10052/1',
          empty: {
            title: 'Добавьте паспорт',
            subtitle: 'он необходим для получения большинства услуг на портале'
          },
          full: {
            title: 'Паспорт РФ',
            orderTitle: 'Заказать новый паспорт'
          },
          detailsPath: '/profile/passport',
          fields: [
            {
              title: '',
              value: object.number ? (object.series || '') + ' ' + (object.number || '') : ''
            },
            {
              title: 'Выдан:',
              value: object.number ?
                `${object.issuedBy} (код подразделения ${object.issueId && object.issueId.substr(0, 3)}-${object.issueId && object.issueId.substr(3, 3)})` : ''
            },
            {
              title: 'Дата выдачи:',
              showEmpty: true,
              value: object.number ? object.issueDate : ''
            }
          ]
        };

        const birthDate = moment(object.birthDate, 'DD.MM.YYYY');
        const age = moment().diff(birthDate.clone(), 'days');
        const twentyDiff = birthDate.clone()
          .add(20, 'y')
          .diff(birthDate, 'days');
        const fortyFiveDiff = birthDate.clone()
          .add(45, 'y')
          .diff(birthDate, 'days');
        const compareDiff = moment()
          .diff(moment().subtract(3, 'months'), 'days');

        if (age < twentyDiff) {
          if (twentyDiff - age < compareDiff - 1) {
            result.notification = 'PROFILE.PASSPORT.CHANGE_20_WARNING';
            result.warning = true;
            result.expired = true;
          } else if (twentyDiff - age < compareDiff) {
            result.notification = 'PROFILE.PASSPORT.CHANGE_20';
          }
        }

        if (age < fortyFiveDiff) {
          if (fortyFiveDiff - age < compareDiff - 1) {
            result.notification = 'PROFILE.PASSPORT.CHANGE_45_WARNING';
            result.warning = true;
            result.expired = true;
          } else if (fortyFiveDiff - age < compareDiff) {
            result.notification = 'PROFILE.PASSPORT.CHANGE_45';
          }
        }

        return result;
      }
      case this.DOCUMENT_TYPES.RSDNC_PERMIT:
      case this.DOCUMENT_TYPES.RFG_CERT:
      case this.DOCUMENT_TYPES.CERT_REG_IMM:
      case this.DOCUMENT_TYPES.FID_DOC: {
        let docTitle = '';
        switch (object.type) {
          case this.DOCUMENT_TYPES.FID_DOC:
            docTitle = 'Иностранный паспорт:';
            break;
          case this.DOCUMENT_TYPES.RSDNC_PERMIT:
            docTitle = 'Вид на жительство:';
            break;
          case this.DOCUMENT_TYPES.RFG_CERT:
            docTitle = 'Удостоверение беженца Российской Федерации:';
            break;
          case this.DOCUMENT_TYPES.CERT_REG_IMM:
            docTitle = 'Свидетельство о регистрации ходатайства о признании иммигранта беженцем:';
            break;
        }

        return {
          attrId: 'ident',
          type: object.type,
          canDetails: true,
          canEdit: true,
          detailsPath: '/profile/personal/id-doc',
          warning: ProfileService.isExpiredForeignPassport(object),
          notification: ProfileService.getFidDocNotification(object),
          expired: ProfileService.isExpiredForeignPassport(object),
          empty: {
            title: 'Добавьте основной документ',
            subtitle: 'он необходим для получения большинства услуг на портале'
          },
          full: {
            title: 'Удостоверение личности'
          },
          fields: [
            {
              title: docTitle,
              value: object.series ? object.series + ' ' + object.number : '' + object.number,
            },
            {
              title: 'Дата выдачи',
              showEmpty: true,
              value: object.issueDate,
            },
            {
              title: 'Код подразделения',
              value: object.issueId
            },
            {
              title: 'Кем выдан',
              value: object.issuedBy
            },
            {
              title: 'Действителен до',
              value: object.expiryDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.DRIVING_LICENCE: {
        const result: InfoCardView = {
          canDetails: false,
          canEdit: true,
          canDelete: true,
          detailsPath: '/profile/transport/driver-license',
          serviceUrl: '10056/2',
          empty: {
            title: 'Водительские права',
            subtitle: 'Добавьте данные для быстрого поиска новых штрафов и упрощения заполнения форм',
          },
          full: {
            title: 'Водительские права',
            orderTitle: 'Заказать новые права'
          },
          fields: [
            {
              title: '',
              showEmpty: true,
              value: `<b>${object.series ? object.series.toUpperCase() : ''} ${object.number}</b>`
            },
            {
              title: 'Действительны до',
              showEmpty: true,
              value: object.expiryDate
            }
          ],
          metric: {
            order: {
              name: 'оrderServicesRfDrivingLicense',
              params: {
                from: 'rfDrivingLicense',
                statusRfDrivingLicense: YaMetricService.getDocumentStatus(object),
                timeStatusRfDrivingLicense: YaMetricService.getDocumentTimeStatus(object.expiryDate)
              }
            }
          }
        };

        // Подсчёт разницы между сегодняшним днём и 3 месяцами до истечения ВУ
        result.expired = result.warning = DatesHelperService.isExpiredDate(object.expiryDate);
        result.notification = result.expired ? 'DRIVER_LICENSE.EXPIRED' :
          DatesHelperService.isExpiredDateAfter(object.expiryDate, 3, 'month') ? 'DRIVER_LICENSE.EXPIRY_SOON' : '';

        if (object.vrfValStu) {
          result.statusMessage = `DRIVER_LICENSE.${object.vrfValStu}`;
        }

        return result;
      }
      case this.DOCUMENT_TYPES.BIRTH_CERTIFICATE_KID_RF:
        return {
          canDetails: true,
          canEdit: false,
          canDelete: false,
          detailsPath: `/profile/family/child/${object.kidId}/birthday`,
          empty: {
            title: 'Свидетельство о рождении ребенка',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой'
          },
          full: {
            title: 'Свидетельство о рождении ребенка',
          },
          fields: [
            {
              title: 'Серия и номер',
              showEmpty: true,
              noLabel: true,
              value: `${object.docInfo.series} ${object.docInfo.number}`,
            },
            {
              title: 'ФИО',
              showEmpty: true,
              value: `${object.childInfo.lastName} ${object.childInfo.firstName} ${object.childInfo.middleName || ''}`
            },
            {
              title: 'Дата выдачи',
              showEmpty: true,
              value: object.docInfo.date
            }
          ]
        };
      case this.DOCUMENT_TYPES.KID_ACT_RECORD:
        return {
          canDetails: true,
          canEdit: false,
          canDelete: false,
          detailsPath: `/profile/family/child/${object.kidId}/act`,
          empty: {
            title: 'Актовая запись о рождении ребенка',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой'
          },
          full: {
            title: 'Актовая запись о рождении ребенка'
          },
          fields: [
            {
              title: 'Номер',
              showEmpty: true,
              noLabel: true,
              value: object.actRecord.number,
            },
            {
              title: 'ФИО',
              showEmpty: true,
              value: `${object.childInfo.lastName} ${object.childInfo.firstName} ${object.childInfo.middleName || ''}`
            },
            {
              title: 'Дата выдачи',
              showEmpty: true,
              value: object.actRecord.date
            }
          ]
        };
      case this.DOCUMENT_TYPES.BIRTH_CERTIFICATE_RF:
      case this.DOCUMENT_TYPES.BIRTH_CERTIFICATE_OLD:
      case this.DOCUMENT_TYPES.BIRTH_CERTIFICATE_FID:
      case this.DOCUMENT_TYPES.BIRTH_CERTIFICATE:
        return {
          attrId: 'birth',
          canDetails: object.canDetails,
          canEdit: object.canEdit,
          canDelete: object.canDelete,
          detailsPath: this.loadService.user.isKid ? '' : `/profile/personal/birthday/${object.id ? object.id : ''}`,
          ...(object.vrfValStu === 'VERIFICATION_FAILED' ?
              {
                notification: 'Не найдено в базе данных ЗАГС. Проверьте корректность данных документа',
                warning: true
              } : {}
          ),
          ...(object.vrfValStu === 'VERIFYING' ?
              {
                notification: 'Идет проверка по базе данных ЗАГС...',
              } : {}
          ),
          empty: {
            title: 'Свидетельство о рождении',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой'
          },
          full: {
            title: 'Свидетельство о рождении'
          },
          fields: [
            {
              title: 'Серия и номер',
              showEmpty: true,
              noLabel: true,
              value: (object.series || '') + ' ' + object.number,
            },
            {
              title: 'Дата выдачи',
              showEmpty: true,
              value: object.issueDate
            },
            {
              title: 'Действителен до',
              value: object.expiryDate
            },
            {
              title: 'Место государственной регистрации',
              hidden: object.hiddenIssuedBy,
              value: object.issuedBy
            }
          ]
        };
      case this.DOCUMENT_TYPES.MILITARY_ID:
        return {
          attrId: 'military',
          canDetails: false,
          canDelete: true,
          canEdit: true,
          empty: {
            title: 'Военный билет',
            subtitle: 'Добавьте документ, чтобы упростить процесс заполнения заявлений на услуги'
          },
          full: {
            title: 'Военный билет'
          },
          fields: [
            {
              title: '',
              showEmpty: true,
              value: object.series + ' ' + object.number,
            },
            {
              title: 'Дата выдачи',
              value: object.issueDate
            }
          ]
        };
      case this.DOCUMENT_TYPES.FOREIGN_PASSPORT:
        return {
          attrId: 'frpass',
          canDetails: !object.idDoc,
          canEdit: object.idDoc,
          canDelete: !object.idDoc && !ProfileService.isExpiredSoonForeignPassport(object),
          vrfStu: object.vrfStu,
          detailsPath: '/profile/personal/foreign-passport',
          serviceUrl: '10005',
          type: object.type,
          warning: ProfileService.isExpiredForeignPassport(object),
          notification: ProfileService.getForeignPassportNotification(object),
          expired: ProfileService.isExpiredForeignPassport(object),
          empty: {
            title: 'Заграничный паспорт',
            subtitle: 'Добавьте документ, чтобы он всегда был под рукой'
          },
          full: {
            title: object.idDoc ? 'Удостоверение личности' : 'Заграничный паспорт',
            orderTitle: 'Заказать новый паспорт'
          },
          fields: [
            {
              title: object.idDoc ? 'Заграничный паспорт:' : 'Серия и номер',
              showEmpty: false,
              noLabel: !object.idDoc,
              value: object.series + ' ' + object.number
            },
            {
              title: 'Выдан:',
              showEmpty: false,
              value: object.issuedBy
            },
            {
              title: 'Действителен до:',
              showEmpty: true,
              value: object.expiryDate
            },
          ]
        };
      case this.DOCUMENT_TYPES.SNILS:
        return {
          attrId: 'snils',
          canDetails: false,
          canEdit: object.vrfStu === undefined || object.vrfStu === 'NOT_VERIFIED',
          canDelete: object.vrfStu === undefined,
          canRepeat: false,
          empty: {
            title: 'Добавьте СНИЛС',
            subtitle: object.subtitle ? object.subtitle : 'он необходим для некоторых услуг и может использоваться для авторизации'
          },
          full: {
            title: 'СНИЛС'
          },
          fields: [
            {
              title: '',
              // showEmpty: true,
              value: object.number
            }
          ]
        };
      case this.DOCUMENT_TYPES.KID_SNILS:
        return {
          attrId: 'snils',
          canDetails: false,
          canDelete: false,
          canEdit: object.vrfValStu === 'VERIFICATION_FAILED',
          canRepeat: object.vrfValStu === 'VERIFICATION_FAILED',
          ...(object.vrfValStu === 'VERIFICATION_FAILED' ?
              {
                notification: 'Не найден в базе данных ПФР. Проверьте корректность данных документа',
                warning: true
              } : {}
          ),
          ...(object.vrfValStu === 'VERIFYING' ?
              {
                notification: object.number ?
                  'Выполняется проверка номера СНИЛС ребенка в ПФР...' :
                  'Идет поиск СНИЛС ребенка в ПФР...',
              } : {}
          ),
          empty: {
            title: 'Добавьте СНИЛС',
            subtitle: object.subtitle ? object.subtitle : 'он необходим для некоторых услуг и может использоваться для авторизации'
          },
          full: {
            title: 'СНИЛС'
          },
          fields: [
            {
              title: '',
              value: object.number
            }
          ]
        };
      case this.DOCUMENT_TYPES.INN:
        return {
          attrId: 'inn',
          canDetails: false,
          canEdit: object.vrfStu === undefined,
          canDelete: object.vrfStu === undefined,
          empty: {
            title: 'Добавьте ИНН',
            subtitle: object.subtitle ? object.subtitle : 'чтобы получить полный доступ к услугам по налогам и финансам'
          },
          full: {
            title: 'ИНН'
          },
          fields: [
            {
              title: '',
              showEmpty: false,
              noLabel: true,
              value: object.number ? object.number : object.vrfStu === 'VERIFIED' ? 'Не указан' : ''
            }
          ]
        };
      case this.DOCUMENT_TYPES.VEHICLE:
        return {
          canDetails: false,
          canEdit: true,
          canDelete: true,
          detailsPath: `/profile/transport/vehicle/${object.id || ''}`,
          empty: {
            title: 'Новое транспортное средство',
            subtitle: 'Добавьте транспортное средство для получения информации о новых штрафах'
          },
          full: {
            title: object.name,
          },
          fields: [
            {
              title: '',
              showEmpty: true,
              noLabel: true,
              value: object.numberPlate
            },
            {
              title: 'СТС',
              showEmpty: true,
              value: object.regCertificate && `${object.regCertificate.series} ${object.regCertificate.number}`
            }
          ]
        };
      case this.DOCUMENT_TYPES.CHILD:
        return {
          canDetails: true,
          canEdit: true,
          empty: {
            title: 'Информация о ребенке',
            subtitle: 'Добавьте в профиль информацию о ребенке, чтобы подавать заявления на услуги от его имени и получать счета за кружки и садики'
          },
          full: {
            title: object.firstName + ' ' + object.lastName
          },
          gender: object.gender,
          detailsPath: `/profile/family/child/${object.id || ''}/docs`,
          statusMessage: object.statusMessage,
          fields: [
            {
              title: 'Дата рождения',
              showEmpty: true,
              value: object.birthDate
            },
            {
              title: 'Свидетельство о рождении',
              showEmpty: true,
              value: ProfileService.getSeriesNumberCert(object)
            }
          ]
        };
      case this.DOCUMENT_TYPES.ORGANIZATION_INFO: {
        const orgInfo = Object.assign({}, object);
        delete orgInfo.type;
        return {
          canDetails: true,
          canEdit: true,
          mobileDetailsHeightClass: 'organization-view-height',
          full: {
            title: 'Основная информация'
          },
          fields: Object.values(orgInfo)
        };
      }
      case this.DOCUMENT_TYPES.BRANCH_INFO: {
        const branchInfo = Object.assign({}, object);
        delete branchInfo.type;
        return {
          canDetails: true,
          canEdit: true,
          mobileDetailsHeightClass: 'branch-view-height',
          full: {
            title: 'Информация о филиале'
          },
          fields: Object.values(branchInfo)
        };
      }
      case this.DOCUMENT_TYPES.NAME_CHANGE_CERT: {
        return {
          canDetails: true,
          canEdit: false,
          canDelete: true,
          withVerificationIcon: false,
          detailsPath: `/profile/cert/${object.id ? object.id : ''}`,
          detailsLinkTitle: `Редактировать`,
          detailsQueryParam: {type: 'NAME_CHANGE_CERT'},
          empty: {
            title: 'Свидетельство о перемене имени',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой',
          },
          full: {
            title: 'Свидетельство о перемене имени'
          },
          fields: [
            {
              title: '',
              value: `${object.series} №${object.number}` || ''
            },
            {
              title: 'Дата выдачи ',
              value: object.issueDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.MARRIED_CERT: {
        return {
          canDetails: true,
          canEdit: false,
          canDelete: true,
          withVerificationIcon: false,
          detailsPath: `/profile/cert/${object.id ? object.id : ''}`,
          detailsLinkTitle: `Редактировать`,
          detailsQueryParam: {type: 'MARRIED_CERT'},
          empty: {
            title: 'Свидетельство о браке',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой',
          },
          full: {
            title: 'Свидетельство о браке'
          },
          fields: [
            {
              title: '',
              value: `${object.series} №${object.number}` || ''
            },
            {
              title: 'Дата выдачи ',
              value: object.issueDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.DIVORCE_CERT: {
        return {
          canDetails: true,
          canEdit: false,
          canDelete: true,
          withVerificationIcon: false,
          detailsPath: `/profile/cert/${object.id ? object.id : ''}`,
          detailsQueryParam: {type: 'DIVORCE_CERT'},
          detailsLinkTitle: `Редактировать`,
          empty: {
            title: 'Свидетельство о разводе',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой'
          },
          full: {
            title: 'Свидетельство о разводе'
          },
          fields: [
            {
              title: '',
              value: `${object.series} №${object.number}` || ''
            },
            {
              title: 'Дата выдачи ',
              value: object.issueDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.FATHERHOOD_CERT: {
        return {
          canDetails: this.loadService.user.isKid,
          canEdit: !this.loadService.user.isKid,
          canDelete: !this.loadService.user.isKid,
          withVerificationIcon: false,
          detailsQueryParam: {type: 'FATHERHOOD_CERT'},
          empty: {
            title: 'Свидетельство об отцовстве',
            subtitle: 'Добавьте документ, чтобы он всегда был у вас под рукой'
          },
          full: {
            title: 'Свидетельство об отцовстве'
          },
          fields: [
            {
              title: '',
              value: `${object.series} №${object.number}` || ''
            },
            {
              title: 'Дата выдачи ',
              value: object.issueDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.MEDICAL_BIRTH_CERTIFICATE: {
        return {
          canEdit: false,
          canDetails: true,
          detailsPath: `/profile/medical-birth-cert/${object.id}`,
          full: {
            title: 'Медсвидетельство о рождении ребенка'
          },
          fields: [
            {
              title: '',
              value: `${object.docInfo.series} ${object.docInfo.number}`
            },
            {
              title: 'Пол',
              value: object.nbInfo.gender === 'F' ? 'Девочка' : 'Мальчик'
            },
            {
              title: 'Дата и время рождения',
              value: object.nbInfo.birthDate
            }
          ]
        };
      }
      case this.DOCUMENT_TYPES.SELF_EMPLOYED: {
        return {
          canDetails: false,
          canEdit: !object.vrfValStu,
          canDelete: false,
          detailsPath: '/profile/business/self-employed',
          canRepeat: object.vrfValStu !== 'VERIFYING' && object.updateDate !== moment().add(1, 'day').format('DD.MM.YYYY'),
          statusMessage: object.vrfValStu && `BUSINESS.STATUS.${object.vrfValStu}`,
          empty: {
            title: 'Самозанятый',
            subtitle: 'Если вы являетесь самозанятым, добавьте информацию в личный кабинет, чтобы у вас появилась возможность подавать заявления'
          },
          full: {
            title: 'Самозанятый'
          },
          fields: [
            {
              title: 'Деятельность:',
              value: object.categories
            },
            {
              title: 'ИНН: ',
              value: object.inn
            },
            {
              title: 'Обновлено: ',
              value: object.updateDate
            }
          ]
        };
      }
      default:
        return {
          empty: {}, full: {}, fields: [], canDetails: false, canEdit: false
        };
    }
  }

  public getDelegatedRights(ignoreConfig?: boolean) {
    if (!this.user.orgType || !this.user.authorityId || (!this.config.delegationEnabled && !ignoreConfig)) {
      return of({});
    }
    if (this.delegatedRightsData) {
      return of(this.delegatedRightsData);
    }
    return this.http.get(`${this.config.lkApiUrl}users/data/authority/${this.user.authorityId}`, {withCredentials: true}).pipe(
      switchMap(data => {
        this.delegatedRightsData = data;
        return of(this.delegatedRightsData);
      })
    );
  }
}
