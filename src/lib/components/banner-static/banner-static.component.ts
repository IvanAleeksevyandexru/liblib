import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Banner, BannerGroup } from '../../models/main-page.model';
import { LoadService } from '../../services/load/load.service';
import { YaMetricService } from '../../services/ya-metric/ya-metric.service';

@Component({
  selector: 'lib-static-banner',
  templateUrl: 'banner-static.component.html',
  styleUrls: ['./banner-static.component.scss']
})
export class StaticBannerComponent implements OnInit, OnChanges {

  // path должен включать имя группы ('group' поле структуры) и имя баннера в ней (свойство mnemonic) разделенные точкой
  @Input() public banners: Array<BannerGroup> = [];
  @Input() public path = '';
  @Input() public closable = undefined;

  @Input() public fixedHeight?: number = undefined;
  @Input() public noBorder = true;
  @Input() public noBorderRadius = true;
  @Input() public noPadding = true;
  @Input() public needContainer = true;
  @Input() public borderColor = '';
  @Input() public isGeps = false;

  @Output() private close = new EventEmitter();

  public groupName: string;
  public mnemonic: string;
  public content: string;
  public closeDisplay = false;
  public backgroundColor?: string;
  public backgroundImage?: string;
  public closed = false;
  public activeBanner: Banner = null;
  public get activeBannerTracable() {
    return this.activeBanner;
  }
  public set activeBannerTracable(value: Banner) {
    this.activeBanner = value;
    this.content = value ? value.content : '';
    if (value && value.bgImage) {
      if (value.bgImage.indexOf('http') !== -1) {
        this.backgroundImage = (value.bgImage.indexOf('url') !== -1 ? value.bgImage : 'url(' + value.bgImage + ')') + ' 0 0 / cover no-repeat';
      } else {
        this.backgroundColor = value.bgImage;
      }
    }
    this.updateCloseButton();
  }

  constructor(
    private loadService: LoadService,
    public yaMetricService: YaMetricService
  ) {
  }

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      const change = changes[propName];
      switch (propName) {
        case 'banners': {
          this.findAndSetBanner();
          break;
        }
        case 'path': {
          this.setGroupNameAndMnemonic();
          this.findAndSetBanner();
          break;
        }
        case 'closable': {
          this.updateCloseButton();
        }
      }
    }
  }

  public update() {
    // применяет все измененные свойства ngOnChanges разом
    this.setGroupNameAndMnemonic();
    this.findAndSetBanner();
    this.updateCloseButton();
  }

  public setGroupNameAndMnemonic() {
    if (this.path && this.path.includes('.')) {
      this.groupName = this.path.split('.')[0];
      this.mnemonic = this.path.split('.')[1];
    } else {
      this.groupName = this.path;
      const group = (this.banners || []).find((bannerGroup: BannerGroup) => bannerGroup.group === this.groupName);
      this.mnemonic = group && group.banners && group.banners.length === 1 ? group.banners[0].mnemonic : '';
    }
  }

  public findAndSetBanner() {
    const activeGroup: BannerGroup = (this.banners || []).find((group: BannerGroup) => group.group === this.groupName);
    if (activeGroup) {
      let banner = (activeGroup.banners || []).find((groupBanner: Banner) => groupBanner.mnemonic === this.mnemonic);
      if (!banner && !this.mnemonic && activeGroup.banners.length === 1) {
        banner = activeGroup.banners[0];
      }
      this.activeBannerTracable = banner;
    } else {
      this.activeBannerTracable = null;
    }
  }

  public updateCloseButton() {
    if (this.closable !== undefined) {
      this.closeDisplay = this.closable;
    } else {
      this.closeDisplay = this.activeBanner ? this.activeBanner.closable : true;
    }
  }

  public closeBanner() {
    this.closed = true;
    this.close.emit();
  }

  public onBannerClick(): void {
    if (this.loadService.config.yaCounter) {
      this.yaMetricService.bannerClickYaMetric(this.mnemonic, this.isGeps);
    }
  }
}
