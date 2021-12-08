import { ChangeDetectionStrategy, Component, Input, NgModuleRef, OnInit } from '@angular/core';
import { SliderImage } from '@epgu/ui/models/slider-image';
import { SliderImagesModalComponent } from './slider-images-modal/slider-images-modal.component';
import { ModalService } from '@epgu/ui/services/modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss'],
})
export class ImageSliderComponent implements OnInit {
  @Input() public slidesOffset: number;
  @Input() public slidesWidth: number;
  @Input() public slidesHeight: number;

  @Input() public images: SliderImage[] = [];
  @Input() public links: Array<string> = [];
  @Input() public limit = 3;
  @Input() public showByIndex: number;
  @Input() public showModal = false;
  @Input() public enterImages = false;
  @Input() public view: 'payment-fines-popup' | 'simple' | 'card' | 'logos' = 'simple';
  @Input() public showTitle = false;
  @Input() public showBullet = true;
  @Input() public target = false;

  constructor(
    private modalService: ModalService,
    private moduleRef: NgModuleRef<any>,
  ) {
  }

  public ngOnInit() {
  }

  public showImageSliderModal(i: number): void {
    if (this.showModal) {
      this.modalService.popupInject(SliderImagesModalComponent, this.moduleRef, {
        images: this.images,
        imageIndex: i
      });
    }
  }

}
