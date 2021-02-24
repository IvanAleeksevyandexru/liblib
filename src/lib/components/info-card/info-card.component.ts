import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { LoadService } from '../../services/load/load.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';
import { InfoCardState, InfoCardView } from '../../models/info-card-view';
import { Router } from '@angular/router';
import { ConstantsService } from '../../services/constants.service';

@Component({
  selector: 'lib-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent implements OnInit, OnChanges {

  @Input() public data: any = {}; // Входные данные. TODO: описать интерфейс
  @Input() public cardType: 'common' | 'empty' | 'modify' = 'common';
  @Input() public state: InfoCardState = '';
  @Input() public addPath: string;
  @Input() public editPath: string;
  @Input() public editQueryParam: { [key: string]: string };
  @Input() public externalLink: string;
  @Input() public refreshError: boolean;
  @Input() public stateText: string;
  @Input() public isIdDoc: boolean;
  @Input() public isNew: boolean | string = false;
  @Output() public deleteEmitter = new EventEmitter();
  @Output() public changeTypeEmitter = new EventEmitter();
  @Output() public cancelReqEmitter = new EventEmitter();
  @Output() public repeatReqEmitter = new EventEmitter();

  public object: InfoCardView; // для вывода основных данных карточки
  public informer: {
    type: string,
    caption: string,
    subtitle: string,
    link: string,
    linkText: string
  }; // для вывода уведомлений о просрочке и т.д.

  constructor(public loadService: LoadService,
              public profileService: ProfileService,
              private router: Router,
              private yaMetricService: YaMetricService,
              private constants: ConstantsService) {
  }

  public ngOnInit() {
    this.initCard(this.data);
  }

  public ngOnChanges({data, cardType}: SimpleChanges): void {
    if (data) {
      if (!data.firstChange && data.currentValue) {
        this.initCard(data.currentValue);
      } else if (data && cardType && !cardType.firstChange && data.currentValue) {
        this.initCard(data.currentValue);
      }
    }
  }

  private initCard(data): void {
    this.data.idDoc = this.isIdDoc;

    this.object = this.profileService.createCardObject(data);

    if (data.informerStatus) {
      this.informer = {
        type: data.informerStatus,
        caption: data.expireWarning,
        subtitle: data.subText,
        link: data.formLink ? this.loadService.config.betaUrl + data.formLink : data.faqLink,
        linkText: data.linkText
      };
    }
  }

  public isNotificationShow(): boolean {
    if (this.state !== 'process' && this.state !== 'error') {
      return !!this.object.notification;
    }
  }

  public isExpiredDocDetails(): boolean {
    const typeArray: string[] = this.constants.FID_DOCUMENT_TYPES;
    return typeArray.includes(this.object.type);
  }

  public isPassportNotification(): boolean {
    return (this.object.type === 'RF_PASSPORT' || this.object.type === 'FRGN_PASS') &&
      this.state === 'verified' && this.object.notification && !this.object.expired;
  }

  public showRepeatButton(): boolean {
    return !this.refreshError && this.state === 'error' && this.externalLink && this.object.canRepeat;
  }

  public showDetailButton(): boolean {
    if (this.object.type !== 'RF_PASSPORT') {
      return this.object.canDetails && this.state !== 'process' && this.state !== 'error' && !!this.object.detailsPath;
    } else {
      return this.state !== 'process' && this.state !== 'error' && !this.object.notification;
    }
  }

  public delete(): void {
    this.yaMetricService.callReachGoal('docs', {
      deleteDoc: 'show',
      typeDoc: this.data.type
    });

    this.deleteEmitter.emit();
  }

  public cancelReq(): void {
    this.yaMetricService.callReachGoal('docs', {
      cancelCheck: 'show',
      typeDoc: this.data.type
    });

    this.cancelReqEmitter.emit();
  }

  public repeatReq(): void {
    this.yaMetricService.callReachGoal('docs', {
      repeatCheck: 'show',
      typeDoc: this.data.type
    });

    this.repeatReqEmitter.emit();
  }

  public toggleForm(): void {
    if (this.object.detailsPath) {
      this.router.navigate([this.object.detailsPath], {queryParams: this.object.detailsQueryParam});
    } else {
      this.changeTypeEmitter.emit();
    }
  }

  public editableInternal(): boolean {
    return this.object.canEdit && !this.externalLink;
  }

  public editableExternal(): boolean {
    return this.object.canEdit && !!this.externalLink && this.state !== 'process'
      || this.object.type === 'RF_PASSPORT' && this.state === 'error'
      || this.object.type === 'RF_PASSPORT' && this.state !== 'process' && !!this.object.notification;
  }

  public toExternalLink(): void {
    this.yaMetricService.callReachGoal('docs', {
      editBaseInfo: 'show',
      from: 'docs',
      typeDoc: this.data.type
    });

    this.router.navigate([this.externalLink]);
  }

  public toOrder(): void {
    if (this.object.metric && this.object.metric.order) {
      this.yaMetricService.callReachGoal(this.object.metric.order);
    } else {
      this.yaMetricService.callReachGoal('docs', {
        orderServices: 'show',
        typeDoc: this.data.type
      });
    }

    setTimeout(() => { // данные должны успеть попасть в метрику
      window.location.href = this.loadService.config.betaUrl + this.object.serviceUrl;
    });
  }

  public typeOf(input: any): string {
    return typeof input;
  }

}
