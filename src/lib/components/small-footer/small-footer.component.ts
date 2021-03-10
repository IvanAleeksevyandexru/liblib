import { Component, Input, OnInit } from '@angular/core';
import { LoadService } from '../../services/load/load.service';
import { MainFooter } from '../../models/main-page.model';
import { MainPageService } from '../../services/main-page/main-page.service';

@Component({
  selector: 'lib-small-footer',
  templateUrl: './small-footer.component.html',
  styleUrls: ['./small-footer.component.scss']
})
export class SmallFooterComponent implements OnInit {

  @Input() public needFooterData: boolean;
  @Input() public footer: MainFooter;

  public config = this.loadService.config;
  public staticDomainLibAssetsPath = this.loadService.config.staticDomainLibAssetsPath;
  public applications = {
    android: {
      url: this.config.appStores.googlePlay,
      icon: `${this.staticDomainLibAssetsPath}svg/mp-buttons/googleplay-white.svg`,
      name: 'Google Play'
    },
    ios: {
      url: this.config.appStores.appStore,
      icon: `${this.staticDomainLibAssetsPath}svg/mp-buttons/appstore-white.svg`,
      name: 'App Store'
    },
    huawei: {
      url: this.config.appStores.appGallery,
      name: 'App Gallery'
    },
  };

  constructor(
    public loadService: LoadService,
    private mainPageService: MainPageService
  ) {
  }

  public ngOnInit(): void {
    this.getFooter();
    this.footer = {
      "socialLinks": true,
      "blocks": [
        {
          "title": "Вопросы и ответы",
          "links": [
            {
              "title": "Вход и регистрация",
              "url": "https://www.gosuslugi.ru/help/faq/c-1"
            },
            {
              "title": "Оплата",
              "url": "https://www.gosuslugi.ru/help/faq/voprosy_po_oplate"
            },
            {
              "title": "Личный кабинет",
              "url": "https://www.gosuslugi.ru/help/faq/lichnyy_kabinet"
            },
            {
              "title": "Автовладельцам",
              "url": "https://www.gosuslugi.ru/help/faq/avtovladelcam"
            },
            {
              "title": "Центры обслуживания",
              "url": "https://map.gosuslugi.ru/co",
              "newTab": true
            }
          ]
        },
        {
          "title": "О портале",
          "links": [
            {
              "title": "Новости",
              "url": "https://www.gosuslugi.ru/help/news"
            },
            {
              "title": "Информация о платежах",
              "url": "https://www.gosuslugi.ru/help/payment"
            },
            {
              "title": "Правовая информация",
              "url": "https://www.gosuslugi.ru/pgu/cms/content/isr/list/00000000000/121/"
            }
          ]
        },
        {
          "title": "Партнёрам",
          "links": [
            {
              "title": "Государственным органам",
              "url": "https://partners.gosuslugi.ru/catalog/",
              "newTab": true
            },
            {
              "title": "Коммерческим организациям",
              "url": "https://partners.gosuslugi.ru/catalog/",
              "newTab": true
            },
            {
              "title": "Документы",
              "url": "https://partners.gosuslugi.ru/docs",
              "newTab": true
            }
          ]
        },
        {
          "title": "Скачайте приложение:",
          "hideMobile": true,
          "apps": [
            "android",
            "ios"
          ]
        }
      ]
    };
  }

  private getFooter(): void {
    if (this.needFooterData) {
      this.mainPageService.getFooterData().subscribe((data: any) => {
        // пока на моке, как доработают бэк - надо будет доделать
        if (data?.footer) {
          this.footer = data.footer as MainFooter;
        }
      });
    }
  }

}
