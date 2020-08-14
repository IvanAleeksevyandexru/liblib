import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YaMapService {

  private isLoaded = false;
  public map: any;
  public address = new BehaviorSubject('');

  constructor() {
  }

  private createMap(el: string, params, marks) {
    if ((window as any).ymaps.Map) {
      const map = new (window as any).ymaps.Map(
        el,
        {
          controls: params.controls,
          center: params.center,
          zoom: params.zoom
        },
        {
          balloonMaxWidth: 270
        }
      );
      if (params.selectAddress) {
        this.createSelectAddressMap(map);
      } else {
        if (marks) {
          const placemark = new (window as any).ymaps.Placemark(params.center, {},
            {
              iconLayout: marks.iconLayout,
              iconImageHref: marks.iconImageHref,
              iconImageSize: marks.iconImageSize,
            });
          map.geoObjects.add(placemark);
        }
      }
      this.map = map;
      return map;
    }
  }

  private createSelectAddressMap(map): void {
    let addressLine = '';
    map.events.add('click', (e) => {
      const coords = e.get('coords');
      (window as any).ymaps.geocode(coords).then((res) => {
        addressLine = res.geoObjects.get(0).getAddressLine();
        map.balloon.close();
        map.balloon.open(coords, {
          contentBody: '<div style="padding:10px"><p style="font-size: 16px;line-height: 24px;">' + addressLine + '</p>' +
            '<p style="margin-top: 24px;text-align: center;"><button id="balloon-button" class="balloon-button" type="button">Выбрать</button></p></div>',
        });
      });
    });
    map.balloon.events
      .add('open', () => {
        const button = document.getElementById('balloon-button');
        button.addEventListener('click', (e) => {
          button.removeEventListener('click', null);
          map.balloon.close();
          this.address.next(addressLine);
        });
      });
  }

  public loadMap(el: string, params, marks) {
    const scriptYmaps = document.createElement('script');
    const urlPart = '2.1/?coordorder=longlat&lang=ru-RU';
    let host = '//api-maps.yandex.ru/' + urlPart;

    if (params.enterpriseYandexMapsEnabled && params.yandexMapsApiKey) {
      host = '//enterprise.api-maps.yandex.ru/' + urlPart + '&apikey=' + params.yandexMapsApiKey;
    }

    scriptYmaps.src = host;
    if (!this.map) {
      document.head.appendChild(scriptYmaps);
    } else {
      this.map.destroy();
      this.createMap(el, params, marks);
    }
    scriptYmaps.onload = () => {
      (window as any).ymaps.ready(() => {
        this.createMap(el, params, marks);
        this.isLoaded = true;
      });
    };
  }
}
