import { Component, OnInit } from '@angular/core';
import { SliderImage } from '../../models/slider-image';

@Component({
  selector: 'lib-slider-images-modal',
  templateUrl: './slider-images-modal.component.html',
  styleUrls: ['./slider-images-modal.component.scss']
})
export class SliderImagesModalComponent implements OnInit {

  public images: SliderImage[];
  public skin?: string;
  public imageIndex = 1;
  public destroy: () => {};
  public imageWidth: number;
  public imageHeight: number;
  constructor() { }

  public ngOnInit() {
    this.imageWidth = this.getWindowSize().layout !== 'sm' ? 522 : 280;
    this.imageHeight = this.getWindowSize().layout !== 'sm' ? 418 : 280;
  }

  public onCancel(e: Event): void {
    this.destroy();
  }

  public getWindowSize() {
    let size = 'na';
    if ((window as any).innerWidth < 768) {
      size = 'sm';
    } else if ((window as any).innerWidth < 1200) {
      size = 'md';
    } else {
      size = 'lg';
    }
    return {
      height: window.innerHeight,
      width: window.innerWidth,
      layout: size
    };
  }
}
