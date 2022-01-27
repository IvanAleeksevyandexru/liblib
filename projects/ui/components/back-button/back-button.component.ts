import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CountersService} from '@epgu/ui/services/counters';


@Component({
  selector: 'lib-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  @Input() public view?: 'link' | 'button' | 'custom' | 'custom-button' = 'link';
  @Input() public handle?: string;
  @Input() public updateCounters?: boolean;
  @Input() public title?: string; // вместо дефолтного с переводом через appTranslate

  @Output() public customClick = new EventEmitter<void>();

  constructor(
    private location: Location,
    private router: Router,
    private countersService: CountersService,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit(): void {
  }


  public goBack(event: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.updateCounters) {
      this.update();
    }
    const backUrl = this.route.snapshot.queryParamMap.get('back_url') || '';
    if (backUrl) {
      window.location.href = backUrl;
    } else {
      if (this.handle) {
        this.router.navigateByUrl(this.handle);
      } else if (this.view.indexOf('custom') >= 0) {
        this.customClick.emit();
      } else {
        this.location.back();
      }
    }
  }

  private update() {
    this.countersService.doCountersApiRequest()
      .subscribe((data) => {
        this.countersService.setCounters(data);
      });
  }
}

