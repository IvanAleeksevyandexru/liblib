import { Injectable } from '@angular/core';
import { LoadAsyncStaticService } from '../load-async-static/load-async-static.service';
import { LoadService } from '../load/load.service';


@Injectable({
  providedIn: 'root'
})
export class SputnikMapService {

  public loaded = false;

  constructor(
    private loadAsyncService: LoadAsyncStaticService,
    private loadService: LoadService,
  ) {
  }

  private createMap(el: string, params, marks) {
    const coords = (window as any).L.GeoJSON.coordsToLatLng(params.center);
    (window as any).L.sm.apiKey = this.loadService.config.sputnikMapApiKey;
    const map = (window as any).L.sm.map('map', {
      center: coords,
      zoom: params.zoom
    });
    const markerIcon = (window as any).L.icon({
      iconUrl: marks.iconImageHref,
      iconSize: marks.iconImageSize,
      iconAnchor: marks.iconOffset,
    });
    const mapMarkerIcon = (window as any).L.sm.marker(coords, {
      icon: markerIcon
    });
    mapMarkerIcon.addTo(map);
    return map;
  }

  public loadMap(el: string, params, marks) {

    if (!this.loaded) {
      this.loadAsyncService.loadCSSAsync(' https://maps-js.apissputnik.ru/v0.3/sputnik_maps_bundle.min.css');
      this.loadAsyncService.loadScriptAsync('https://maps-js.apissputnik.ru/v0.3/sputnik_maps_bundle.min.js', true, () => {
        this.createMap(el, params, marks);
        this.loaded = true;
      });
    } else {
      this.createMap(el, params, marks);
    }
  }
}
