import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoadService } from '@epgu/ui/services/load';

@Component({
  selector: 'lib-social-links',
  templateUrl: './social-links.component.html',
  styleUrls: ['./social-links.component.scss']
})
export class SocialLinksComponent implements OnInit {

  @Input() public footerSocial = false;

  @Output() public footerClickEmitter = new EventEmitter();

  public config = this.loadService.config;

  constructor(
    public loadService: LoadService
  ) { }

  public ngOnInit(): void {
  }

  public openSocial(event: Event, socialType: 'vk' | 'ok' | 'facebook' | 'youtube' | 'tg'): void {
    if (this.footerSocial) {
      event.preventDefault();
      this.footerClickEmitter.emit({
        title: socialType,
        url: this.config.socialNetworks[socialType === 'facebook' ? 'fb' : socialType],
        target: '_blank'
      });
    }
  }

}
