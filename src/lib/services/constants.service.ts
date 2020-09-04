import { Injectable } from '@angular/core';
import { ContactType } from '../models/contact';
import { SecurityOptionType } from '../models/security';
import { Tabs } from '../models/tabs';
import { NotificationPeriodItem } from '../models/notifications';
import { DocumentType } from '../models/document';
import { HorizontalAlign, VerticalAlign } from '../models/positioning';
import { VrfStu, VrfValStu } from '../models/verifying-status';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class ConstantsService {

  // время с последнего нажатия клавиши до запуска поиска
  public static readonly DEFAULT_QUERY_DEBOUNCE = 700;
  // селекторы парентовых элементов за скроллом которых надо следить чтобы обновлять программные координаты выпадашек
  public static readonly LIMITING_CONTAINERS_SELECTORS = ['.tracable-container', '.ps'];
  public static readonly TAIL_FROM_EDGE = 44; // расстояние от края до язычка
  public static readonly TAIL_FROM_EDGE_ALIGN_LEFT = 16;
  public static readonly TAIL_FROM_ICON = 5; // расстояние от знака вопроса до язычка
  // смещения и выравнивания для позиционирования различных ориентаций бабблов с язычком
  public static readonly BUBBLE_OVERLAP_POSITIONING = {
    TOP: {
      alignX: HorizontalAlign.LEFT_TO_LEFT, alignY: VerticalAlign.BOTTOM_TO_TOP,
      offsetX: -ConstantsService.TAIL_FROM_EDGE, offsetY: ConstantsService.TAIL_FROM_ICON
    },
    BOTTOM: {
      alignX: HorizontalAlign.LEFT_TO_LEFT, alignY: VerticalAlign.TOP_TO_BOTTOM,
      offsetX: -ConstantsService.TAIL_FROM_EDGE, offsetY: ConstantsService.TAIL_FROM_ICON
    },
    LEFT: {
      alignX: HorizontalAlign.RIGHT_TO_LEFT, alignY: VerticalAlign.TOP_TO_TOP,
      offsetX: ConstantsService.TAIL_FROM_ICON, offsetY: -ConstantsService.TAIL_FROM_EDGE
    },
    RIGHT: {
      alignX: HorizontalAlign.LEFT_TO_RIGHT, alignY: VerticalAlign.TOP_TO_TOP,
      offsetX: ConstantsService.TAIL_FROM_ICON, offsetY: -ConstantsService.TAIL_FROM_EDGE
    },
    TOP_LEFT: {
      alignX: HorizontalAlign.RIGHT_TO_RIGHT, alignY: VerticalAlign.BOTTOM_TO_TOP,
      offsetX: -ConstantsService.TAIL_FROM_EDGE_ALIGN_LEFT, offsetY: ConstantsService.TAIL_FROM_ICON
    },
    BOTTOM_LEFT: {
      alignX: HorizontalAlign.RIGHT_TO_RIGHT, alignY: VerticalAlign.TOP_TO_BOTTOM,
      offsetX: -ConstantsService.TAIL_FROM_EDGE_ALIGN_LEFT, offsetY: ConstantsService.TAIL_FROM_ICON
    }
  };
  // дефолтный локейшн ассетов (для приложений у которых отсутствует LoadService чтобы прочитать конфиг)
  public static readonly ASSETS_DEFAULT_PATH = 'lib-assets/';
  public static readonly TRANSLATIONS_PATH = 'i18n/';
  // темплейт подсветки найденной строки в контролах с поиском
  public static readonly DEFAULT_HIGHLIGHT_TEMPLATE = '<span class="highlighted">${query}</span>';
  // формат текстовой модели календарей для textModelValue === true
  public static readonly CALENDAR_TEXT_MODEL_FORMAT = 'DD.MM.YYYY';
  // процент блока, достаточный чтобы совершить анимацию вперед при перелистывании драгдропом
  public static readonly DEFAULT_DRAGDROP_CENTERING_THRESHOLD = 0.5;
  // продолжительность анимации выравнивания блока
  public static readonly DEFAULT_DRAGDROP_ANIMATION_DURATION = 500;
  // дефолтное количество итемов для подгрузки для incrementalLoading
  public static readonly DEFAULT_ITEMS_INCREMENTAL_PAGE_SIZE = 10;

  public readonly FIXED_MENU_HEIGHT = 80; // высота закрепленного меню
  public readonly TYPE_CONTACT_EMAIL: ContactType = 'EML';
  public readonly TYPE_CONTACT_MBT: ContactType = 'MBT';
  public readonly TYPE_SEC_QUESTION: SecurityOptionType = 'question';
  public readonly TYPE_SEC_ANSWER: SecurityOptionType = 'answer';
  public readonly TYPE_DS_LOGIN_ALLOWED: SecurityOptionType = 'dsLoginAllowed';
  public readonly TYPE_OTP: SecurityOptionType = 'otp';
  public readonly TYPE_NOTIFICATION_EMAIL: string = 'Notification.Channel.EMAIL';
  public readonly STATUS_VERIFYING: VrfValStu = 'VERIFYING';
  public readonly STATUS_VERIFIED: VrfStu = 'VERIFIED';
  public readonly STATUS_NOT_VERIFIED: VrfStu = 'NOT_VERIFIED';
  public readonly SETTINGS_PAGE_URL = '/settings/account';
  public readonly TABS_METRIC_NAME = 'feedsOrder';
  public readonly IMPORT_UPLOAD_LIMIT = 1 * (1024 * 1024); // Лимит загрузки при импорте ТС - 1 мегабайт
  public readonly LK_TABS_KID = new Tabs([
    {
      id: 'profile',
      name: 'TABS.PROFILE.TITLE_KID',
      url: '/profile',
      mnemonic: 'documentsData'
    }
  ]);
  public readonly LK_TABS = new Tabs([
      {
      id: 'overview',
      name: 'TABS.OVERVIEW.TITLE',
      url: '/overview',
      metric: {name: this.TABS_METRIC_NAME, action: 'overview'}
    }, {
      id: 'statements',
      name: 'TABS.ORDERS.TITLE',
      url: '/orders',
      metric: {name: this.TABS_METRIC_NAME, action: 'myOrders'}
    }, {
      id: 'profile',
      name: 'TABS.PROFILE.TITLE',
      url: '/profile',
      metric: {name: this.TABS_METRIC_NAME, action: 'documentsData'}
    }, {
      id: 'messages',
      name: 'TABS.MESSAGES.TITLE',
      url: '/messages',
      metric: {name: this.TABS_METRIC_NAME, action: 'messages'}
    }, {
      id: 'permissions',
      name: 'TABS.PERMISSIONS.TITLE',
      url: '/permissions',
      metric: {name: this.TABS_METRIC_NAME, action: 'permissions'}
    }
  ]);
  public readonly LK_PARTNERS_TABS = new Tabs([
    {
      id: 'partners',
      name: 'TABS.ORDERS.TITLE',
      url: '/lk/orders/all',
      mnemonic: 'partnersOrders'
    }, {
      id: 'subscriptions',
      name: 'TABS.SUBSCRIPTIONS.TITLE',
      url: '/lk/subscriptions',
      mnemonic: 'partnersSubscriptions'
    }, {
      id: 'history',
      name: 'TABS.HISTORY.TITLE',
      url: '/lk/history',
      mnemonic: 'partnersHistory'
    }
  ]);
  public readonly LK_SETTINGS_SIDE_TABS = new Tabs ([
    {
      id: 'account',
      name: 'SETTINGS.TABS.ACCOUNT',
      url: '/settings/account'
    },
    {
      id: 'biometry',
      name: 'SETTINGS.TABS.BIOMETRY',
      url: '/settings/biometry',
      access: ['AL20']
    },
    {
      id: 'notifications',
      name: 'SETTINGS.TABS.NOTIFICATIONS',
      url: '/settings/notifications'
    },
    {
      id: 'social',
      name: 'SETTINGS.TABS.SOCIAL',
      url: '/settings/social'
    },
    {
      id: 'login',
      name: 'SETTINGS.TABS.LOGIN',
      url: '/settings/login'
    },
    {
      id: 'cards',
      name: 'SETTINGS.TABS.CARDS',
      url: '/settings/cards'
    },
    {
      id: 'mail',
      name: 'SETTINGS.TABS.MAIL',
      url: '/settings/mail',
      access: ['AL20']
    },
    {
      id: 'esignature',
      name: 'SETTINGS.TABS.SIGNATURE',
      url: '/settings/signature',
      access: ['AL15', 'AL20']
    },
    {
      id: 'events',
      name: 'SETTINGS.TABS.EVENTS',
      url: '/settings/events'
    },
    {
      id: 'requests',
      name: 'SETTINGS.TABS.REQUESTS',
      url: '/settings/requests',
      access: ['AL20']
    },
    {
      id: 'applications',
      name: 'SETTINGS.TABS.APPLICATIONS',
      url: '/settings/applications'
    },
    {
      id: 'blacklist',
      name: 'SETTINGS.TABS.BLACK_LIST',
      url: '/settings/blacklist'
    },
    {
      id: 'portals',
      name: 'SETTINGS.TABS.PORTALS',
      url: '/settings/portals'
    },
    {
      id: 'system-permissions',
      name: 'SETTINGS.TABS.PERMISSIONS',
      url: '/settings/system-permissions'
    }
  ]);

  public readonly LK_MESSAGES_SIDE_TABS = new Tabs([
    {
      id: 'inbox',
      name: 'MESSAGES.TABS.INBOX',
      url: '/messages/inbox'
    },
    {
      id: 'outbox',
      name: 'MESSAGES.TABS.OUTBOX',
      url: '/messages/outbox'
    },
    {
      id: 'archive',
      name: 'MESSAGES.TABS.ARCHIVED',
      url: '/messages/archive'
    },
    {
      id: 'blocked',
      name: 'MESSAGES.TABS.BLOCKED',
      url: '/settings/blacklist',
      break: 'after'
    },
    {
      id: 'settings',
      name: 'MESSAGES.TABS.SETTINGS',
      url: '/settings/notifications'
    }
  ]);

  public readonly LK_PROFILE_SIDE_TABS = new Tabs([
    {
      id: 'personal',
      name: 'PROFILE.TABS.PERSONAL',
      url: '/profile/personal'
    },
    {
      id: 'family',
      name: 'PROFILE.TABS.FAMILY',
      url: '/profile/family',
      access: ['AL20']
    },
    {
      id: 'transport',
      name: 'PROFILE.TABS.VEHICLES',
      url: '/profile/transport',
      access: ['AL15', 'AL20']
    },
    {
      id: 'property',
      name: 'PROFILE.TABS.PROPERTY',
      url: '/profile/property',
      access: ['AL20']
    },
    {
      id: 'work',
      name: 'PROFILE.TABS.PENSION',
      url: '/profile/pension',
      access: ['AL20']
    },
    {
      id: 'taxes',
      name: 'PROFILE.TABS.TAXES',
      url: '/profile/taxes',
      access: ['AL20']
    },
    {
      id: 'statements',
      name: 'PROFILE.TABS.STATEMENTS',
      url: '/profile/statements',
      access: ['AL20']
    },
    {
      id: 'settings',
      name: 'PROFILE.TABS.SETTINGS',
      url: '/profile/settings'
    }
  ]);

  public readonly ORDERS_ASIDE = new Tabs([
    {
      id: 'orders',
      name: 'ORDERS.ASIDE.ORDERS',
      url: '/orders/all',
      metric: {name: this.TABS_METRIC_NAME, action: 'feedsOrder'}
    },
    {
      id: 'drafts',
      name: 'ORDERS.ASIDE.DRAFTS',
      url: '/orders/drafts',
      metric: {name: this.TABS_METRIC_NAME, action: 'feedsDraft'}
    },
    {
      id: 'archive',
      name: 'ORDERS.ASIDE.ARCHIVE',
      url: '/orders/archive',
      metric: {name: this.TABS_METRIC_NAME, action: 'feedsArchive'}
    },
    {
      id: 'settings',
      name: 'ORDERS.ASIDE.SETTINGS',
      break: 'after',
      url: '/settings/notifications',
      metric: {name: this.TABS_METRIC_NAME, action: 'settings', from: 'feedsOrder'}
    }
  ]);
  public readonly ORDERS_CATEGORIES = [
    {
      text: 'Все',
      type: 'ORDER,EQUEUE,APPEAL,CLAIM,COMPLEX_ORDER',
      id: 1,
      mnemonic: 'allEvents'
    },
    {
      text: 'Заявления',
      type: 'ORDER,COMPLEX_ORDER',
      id: 2,
      mnemonic: 'order'
    },
    {
      text: 'Записи на прием',
      type: 'EQUEUE',
      id: 3,
      mnemonic: 'equeue'
    },
    {
      text: 'Сообщения',
      type: 'APPEAL',
      id: 4,
      mnemonic: 'appeal'
    },
    {
      text: 'Обжалования',
      type: 'CLAIM',
      id: 5,
      mnemonic: 'claim'
    }
  ];
  public readonly FEEDS_CATEGORIES = [
    {
      text: 'Все',
      type:
        'ORDER,EQUEUE,PAYMENT,GEPS,BIOMETRICS,ACCOUNT,PROFILE,ESIGNATURE,APPEAL,CLAIM,ELECTION_INFO,COMPLEX_ORDER,FEEDBACK,ORGANIZATION',
      id: 1,
      mnemonic: 'allEvents'
    },
    {
      text: 'Заявления',
      type: 'ORDER,COMPLEX_ORDER',
      id: 2,
      mnemonic: 'order'
    },
    {
      text: 'Записи на приём',
      type: 'EQUEUE',
      id: 3,
      mnemonic: 'equeue'
    },
    {
      text: 'Платежи',
      type: 'PAYMENT',
      id: 4,
      mnemonic: 'payment'
    },
    {
      text: 'Госпочта',
      type: 'GEPS',
      id: 5,
      mnemonic: 'geps'
    },
    {
      text: 'Системные',
      type: 'BIOMETRICS,ACCOUNT,ACCOUNT_CHILD,PROFILE,ELECTION_INFO,ORGANIZATION,ESIGNATURE',
      id: 6,
      mnemonic: 'systemEvents'
    },
    {
      text: 'Сообщения',
      type: 'APPEAL',
      id: 7,
      mnemonic: 'appealEvents'
    },
    {
      text: 'Обжалования',
      type: 'CLAIM',
      id: 8,
      mnemonic: 'claim'
    },
    {
      text: 'Обращения в техподдержку',
      type: 'FEEDBACK',
      id: 9,
      mnemonic: 'feedbackEvents'
    }
  ];
  public readonly NOTIFICATION_PERIOD_TIMEZONE: NotificationPeriodItem[] = [
    {
      id: -15,
      text: '(UTC-12) Линия перемены дат'
    },
    {
      id: -14,
      text: '(UTC-11) Американское Самоа'
    },
    {
      id: -13,
      text: '(UTC-10) Гавайи'
    },
    {
      id: -12,
      text: '(UTC-9) Аляска'
    },
    {
      id: -11,
      text: '(UTC-8) Тихоокеанское время (США)'
    },
    {
      id: -10,
      text: '(UTC-7) Горное время (США)'
    },
    {
      id: -9,
      text: '(UTC-6) Ц. Америка, ц. время (США)'
    },
    {
      id: -8,
      text: '(UTC-5) Восточное время (США и Канада)'
    },
    {
      id: -7,
      text: '(UTC-4) Атлантическое время (Канада)'
    },
    {
      id: -6,
      text: '(UTC-3) Бразилия, Буэнос-Айрес, Гренландия'
    },
    {
      id: -5,
      text: '(UTC-2) Среднеатлантическое время'
    },
    {
      id: -4,
      text: '(UTC-1) Азорские о-ва, о-ва Зеленого Мыса'
    },
    {
      id: -3,
      text: '(UTC+0) Дублин, Лиссабон, Лондон, Эдинбург'
    },
    {
      id: -2,
      text: '(UTC+1) Берлин, Мадрид, Париж, Вена, Рим'
    },
    {
      id: -1,
      text: '(UTC+2) Калининград, Киев, Рига'
    },
    {
      id: 0,
      text: '(UTC+3) Москва, Санкт-Петербург'
    },
    {
      id: 1,
      text: '(UTC+4) Волгоград, Самара, Ижевск, страны Закавказья'
    },
    {
      id: 2,
      text: '(UTC+5) Екатеринбург, Западный Казахстан'
    },
    {
      id: 3,
      text: '(UTC+6) Омск'
    },
    {
      id: 4,
      text: '(UTC+7) Красноярск, Новосибирск, Томск'
    },
    {
      id: 5,
      text: '(UTC+8) Иркутск, Улан-Удэ, Гонконг, Пекин'
    },
    {
      id: 6,
      text: '(UTC+9) Якутск, Чита, Осака, Токио, Сеул'
    },
    {
      id: 7,
      text: '(UTC+10) Владивосток, Хабаровск, Уссурийск'
    },
    {
      id: 8,
      text: '(UTC+11) Магадан, Южно-Сахалинск'
    },
    {
      id: 9,
      text: '(UTC+12) Камчатское время, Анадырь, Окленд'
    },
    {
      id: 10,
      text: '(UTC+13) Самоа, Тонга'
    },
    {
      id: 11,
      text: '(UTC+14) Острова Лайн'
    }
  ];
  public readonly NOTIFICATION_PERIOD_HOURS_FROM: NotificationPeriodItem[] = [
    {
      id: 0,
      text: '00:00'
    },
    {
      id: 1,
      text: '01:00'
    },
    {
      id: 2,
      text: '02:00'
    },
    {
      id: 3,
      text: '03:00'
    },
    {
      id: 4,
      text: '04:00'
    },
    {
      id: 5,
      text: '05:00'
    },
    {
      id: 6,
      text: '06:00'
    },
    {
      id: 7,
      text: '07:00'
    },
    {
      id: 8,
      text: '08:00'
    },
    {
      id: 9,
      text: '09:00'
    },
    {
      id: 10,
      text: '10:00'
    },
    {
      id: 11,
      text: '11:00'
    },
    {
      id: 12,
      text: '12:00'
    },
    {
      id: 13,
      text: '13:00'
    },
    {
      id: 14,
      text: '14:00'
    },
    {
      id: 15,
      text: '15:00'
    },
    {
      id: 16,
      text: '16:00'
    },
    {
      id: 17,
      text: '17:00'
    },
    {
      id: 18,
      text: '18:00'
    },
    {
      id: 19,
      text: '19:00'
    },
    {
      id: 20,
      text: '20:00'
    },
    {
      id: 21,
      text: '21:00'
    },
    {
      id: 22,
      text: '22:00'
    },
    {
      id: 23,
      text: '23:00'
    }
  ];

  public readonly NOTIFICATION_PERIOD_HOURS_TO: NotificationPeriodItem[] = [
    {
      id: 1,
      text: '01:00'
    },
    {
      id: 2,
      text: '02:00'
    },
    {
      id: 3,
      text: '03:00'
    },
    {
      id: 4,
      text: '04:00'
    },
    {
      id: 5,
      text: '05:00'
    },
    {
      id: 6,
      text: '06:00'
    },
    {
      id: 7,
      text: '07:00'
    },
    {
      id: 8,
      text: '08:00'
    },
    {
      id: 9,
      text: '09:00'
    },
    {
      id: 10,
      text: '10:00'
    },
    {
      id: 11,
      text: '11:00'
    },
    {
      id: 12,
      text: '12:00'
    },
    {
      id: 13,
      text: '13:00'
    },
    {
      id: 14,
      text: '14:00'
    },
    {
      id: 15,
      text: '15:00'
    },
    {
      id: 16,
      text: '16:00'
    },
    {
      id: 17,
      text: '17:00'
    },
    {
      id: 18,
      text: '18:00'
    },
    {
      id: 19,
      text: '19:00'
    },
    {
      id: 20,
      text: '20:00'
    },
    {
      id: 21,
      text: '21:00'
    },
    {
      id: 22,
      text: '22:00'
    },
    {
      id: 23,
      text: '23:00'
    },
    {
      id: 0,
      text: '23:59'
    },
  ];

  public readonly DADATA_EXCLUDED_FIELDS = [
    'apartmentCheckbox',
    'apartmentCheckboxClosed',
    'houseCheckbox',
    'houseCheckboxClosed'
  ];

  public readonly DADATA_ADDRSTR_EXCLUDED_FIELDS = [
    ...this.DADATA_EXCLUDED_FIELDS,
    'house',
    'building1',
    'building2',
    'apartment'
  ];

  public readonly DADATA_DEPENDENCIES = {
    3: [4],
    4: [3],
    5: [3, 4],
    6: [3, 4, 5],
    7: [3, 4, 5, 6, 90, 91],
    90: [3, 4, 5, 6, 7, 91],
    91: [3, 4, 5, 6, 7, 90]
  };
  public readonly DADATA_ERROR_DEPENDENCIES = {
    1: [3, 4, 6, 7, 11, 12, 13, 14, 100],
    3: [6, 7, 11, 14, 100],
    4: [6, 7, 11, 14, 100],
    5: [7, 11, 14, 100],
    6: [7, 11, 14, 100],
    7: [11, 14, 100],
    11: [11, 14],
    12: [12, 13],
    14: [14],
    90: [11, 14, 100],
    91: [11, 14, 100]
  };
  public readonly DADATA_LEVEL_MAP = {
    1: 'region',
    4: 'city',
    3: 'district',
    6: 'town',
    5: 'inCityDist',
    7: 'street',
    90: 'additionalArea',
    91: 'additionalStreet',
    11: 'house',
    12: 'building1',
    13: 'building2',
    14: 'apartment',
    100: 'index'
  };

  public readonly MAIL_DELIVERY_FIRST_SUBSCRIBE_STATUSES = ['REMIND_LATER', 'NOT_SUBSCRIBED', 'DENY_SUBSCRIPTION'];
  public readonly MAIL_DELIVERY_SUBSCRIBED_STATUS = 'SUBSCRIBED';

  public readonly INTEGRATION_MODULE_QUERY = 50;
  public readonly INTEGRATION_MODULE_APPROVE = 51;
  public readonly INTEGRATION_MODULE_REJECTED = 52;
  public readonly INTEGRATION_MODULE_EXPIRED = 53;
  public readonly INTEGRATION_MODULE_ERROR = 54;

  public readonly DOCUMENT_TYPES: {
    [key: string]: DocumentType
  } = {
    MEDICAL_POLICY: 'MDCL_PLCY',
    FOREIGN_PASSPORT: 'FRGN_PASS',
    DRIVING_LICENCE: 'RF_DRIVING_LICENSE',
    PASSPORT: 'RF_PASSPORT',
    FID_DOC: 'FID_DOC',
    RSDNC_PERMIT: 'RSDNC_PERMIT',
    RFG_CERT: 'RFG_CERT',
    CERT_REG_IMM: 'CERT_REG_IMM',
    BIRTH_CERTIFICATE: 'BRTH_CERT',
    KID_ACT_RECORD: 'KID_ACT_RECORD',
    BIRTH_CERTIFICATE_KID_RF: 'KID_RF_BRTH_CERT',
    BIRTH_CERTIFICATE_RF: 'RF_BRTH_CERT',
    BIRTH_CERTIFICATE_FID: 'FID_BRTH_CERT',
    BIRTH_CERTIFICATE_OLD: 'OLD_BRTH_CERT',
    MEDICAL_BIRTH_CERTIFICATE: 'MDCL_BRTH_CERT',
    MILITARY_ID: 'MLTR_ID',
    INN: 'INN',
    SNILS: 'SNILS',
    KID_SNILS: 'KID_SNILS',
    OTHER_DOC: 'DOCS',
    ORGANIZATION_INFO: 'ORG_INFO',
    BRANCH_INFO: 'BRANCH_INFO',
    CHILD: 'CHILD',
    VEHICLE: 'VEHICLE',
    CRIMINAL_STATEMENT: 'NO_CRIMINAL_INQUIRY',
    DRUGS_STATEMENT: 'DRUGS_INQUIRY',
    NAME_CHANGE_CERT: 'NAME_CHANGE_CERT',
    FATHERHOOD_CERT: 'FATHERHOOD_CERT',
    MARRIED_CERT: 'MARRIED_CERT',
    DIVORCE_CERT: 'DIVORCE_CERT'
  };

  public readonly FID_DOCUMENT_TYPES = [
    this.DOCUMENT_TYPES.FID_DOC, this.DOCUMENT_TYPES.RSDNC_PERMIT,
    this.DOCUMENT_TYPES.RFG_CERT, this.DOCUMENT_TYPES.CERT_REG_IMM
  ];

  public readonly BIRTH_CERTIFICATES = ['BRTH_CERT', 'RF_BRTH_CERT', 'FID_BRTH_CERT', 'OLD_BRTH_CERT'];

  public readonly DOCUMENT_SORT_BY_LVL = {
    PVD: [
      this.DOCUMENT_TYPES.PASSPORT,
      this.DOCUMENT_TYPES.SNILS,
      this.DOCUMENT_TYPES.INN,
      this.DOCUMENT_TYPES.MEDICAL_POLICY,
      this.DOCUMENT_TYPES.FOREIGN_PASSPORT,
      ...this.BIRTH_CERTIFICATES,
      this.DOCUMENT_TYPES.NAME_CHANGE_CERT,
      this.DOCUMENT_TYPES.MILITARY_ID
    ],
    PCD: [
      this.DOCUMENT_TYPES.PASSPORT,
      this.DOCUMENT_TYPES.SNILS,
      this.DOCUMENT_TYPES.INN,
      this.DOCUMENT_TYPES.MEDICAL_POLICY,
      this.DOCUMENT_TYPES.FOREIGN_PASSPORT,
      ...this.BIRTH_CERTIFICATES,
      this.DOCUMENT_TYPES.NAME_CHANGE_CERT,
      this.DOCUMENT_TYPES.MILITARY_ID
    ]
  };

  public readonly ID_DOC_TYPES = [
    this.DOCUMENT_TYPES.PASSPORT,
    this.DOCUMENT_TYPES.FOREIGN_PASSPORT,
    this.DOCUMENT_TYPES.FID_DOC,
    this.DOCUMENT_TYPES.RSDNC_PERMIT,
    this.DOCUMENT_TYPES.RFG_CERT,
    this.DOCUMENT_TYPES.CERT_REG_IMM
  ];

  public readonly CERTIFICATE_TITLE = {
    NAME_CHANGE_CERT: 'PROFILE.NAME_CHANGE_CERT.TITLE',
    MARRIED_CERT: 'FAMILY.DOCS.MARRIED_CERT',
    DIVORCE_CERT: 'FAMILY.DOCS.DIVORCE_CERT',
    FATHERHOOD_CERT: 'FAMILY.DOCS.FATHERHOOD_CERT'
  };

  public readonly GENDER = {
    MALE: 'M',
    FEMALE: 'F'
  };

  public readonly BIRTHDAY_COUNTRIES = {
    BRTH_CERT: 'BIRTHDAY.COUNTRIES.OTHERS',
    RF_BRTH_CERT: 'BIRTHDAY.COUNTRIES.RUSSIA',
    FID_BRTH_CERT: 'BIRTHDAY.COUNTRIES.OTHERS',
    OLD_BRTH_CERT: 'BIRTHDAY.COUNTRIES.USSR'
  };

  public readonly ADDRESS_TYPE: {
    [key: string]: 'PLV' | 'PRG' | 'OPS' | 'OLG'
  } = {
    PLV: 'PLV',
    PRG: 'PRG',
    OPS: 'OPS',
    OLG: 'OLG'
  };

  public readonly ELECTION_COMMON_DATE_FORMAT = 'DD.MM.YYYY';
  public readonly ELECTION_NSI_DATE_FORMAT: 'YYYY-MM-DD';

  public readonly DRIVING_LICENSE_CATEGORIES = [
    'A', 'A1', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'BE', 'CE', 'C1E', 'DE', 'D1E', 'M', 'Tm', 'Tb'
  ];

  public readonly FILE_TYPES = {
    'text/xml': 'XML',
    'text/html': 'HTML',
    'image/jpeg': 'JPG',
    'image/gif': 'GIF',
    'image/png': 'PNG',
    'application/msword': 'DOC',
    'application/rtf': 'RTF',
    'application/pdf': 'PDF',
    'application/x-excel': 'XLS',
    'text/csv': 'CSV',
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR',
    'application/x-tar': 'TAR',
    'text/plain': 'TXT',
  };

}
