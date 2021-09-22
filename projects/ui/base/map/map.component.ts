import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { YaMapService } from '@epgu/ui/services/ya-map';
import { LoadService } from '@epgu/ui/services/load';
import { SputnikMapService } from '@epgu/ui/services/sputnik-map';

@Component({
  selector: 'lib-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges {

  @Input() public elementId: string;
  @Input() public center: number[];
  @Input() public controls: string[];
  @Input() public zoom: number;
  @Input() public redraw = false;
  @Input() public iconLayout: string;
  @Input() public iconImageHref: string;
  @Input() public iconImageSize: number[];
  @Input() public iconOffset: number[];
  @Input() public selectAddress = false;
  @Input() public externalMode = false;
  @Input() public enterpriseYandexMapsEnabled = false;
  @Input() public yandexMapsApiKey = '';

  public staticDomain = this.loadService.config.staticDomain;
  public sputnikMapEnabled = this.loadService.config.sputnikMapEnabled;

  constructor(
    private yaMapService: YaMapService,
    private sputnikMapService: SputnikMapService,
    private loadService: LoadService
  ) {
  }

  public ngOnInit() {
    this.staticDomain = this.externalMode ? '' : this.loadService.config.staticDomain;
  }

  private initMap(): void {
    const mapService = !this.sputnikMapEnabled ?
                        this.yaMapService.loadMap.bind(this.yaMapService) :
                        this.sputnikMapService.loadMap.bind(this.sputnikMapService);
    const controlsConfig = {
      controls: this.controls || [],
      center: this.center || [37.64, 55.76],
      zoom: this.zoom || 9
    };
    const layoutConfig = {
      iconLayout: this.iconLayout || 'default#image',
      iconImageHref: this.iconImageHref || `${this.staticDomain}/lib-assets/svg/blue-ya-marker.svg`,
      iconImageSize: this.iconImageSize || [27, 30],
      iconOffset: this.iconOffset || (this.sputnikMapEnabled ? [14, 30] : [0, 15]),
    };
    mapService('map', controlsConfig, layoutConfig);
  }

  public ngOnChanges({center}: SimpleChanges): void {
    /*
      если получаем еоординаты через REST то передаем redraw = true чтобы карта перерисовалась повторно
      с нужными координатами
     */
    if (center && center.currentValue && this.redraw || !this.redraw) {
      this.initMap();
    }
  }

}
