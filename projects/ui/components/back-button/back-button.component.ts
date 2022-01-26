import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { Location } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import { CountersService } from '@epgu/ui/services/counters';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';


@Component({
  selector: 'lib-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit, OnDestroy {

  @Input() public view?: 'link' | 'button' | 'custom' | 'custom-button' = 'link';
  @Input() public handle?: string;
  @Input() public updateCounters?: boolean;
  @Input() public title?: string; // вместо дефолтного с переводом через appTranslate

  @Output() public customClick = new EventEmitter<void>();

  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);
  private backUrl?: string;
  private backUrl$: Observable<string> = this.route.params.pipe(
    takeUntil(this.destroy),
    map(result => result.back_url || '')
  );

  constructor(
    private location: Location,
    private router: Router,
    private countersService: CountersService,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit(): void {
    this.backUrl$.subscribe(
      url => {
        this.backUrl = url;
      }
    );
  }

  public ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

  public goBack(event: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.updateCounters) {
      this.update();
    }
    if (this.backUrl) {
      window.location.href = this.backUrl;
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

