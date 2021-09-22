import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CountersService } from '@epgu/ui/services/counters';


@Component({
  selector: 'lib-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  @Input() public view?: 'link' | 'button' | 'custom' | 'custom-button' = 'link';
  @Input() public handle?: string;
  @Input() public updateCounters?: boolean;

  @Output() public customClick = new EventEmitter<void>();

  constructor(
    private location: Location,
    private router: Router,
    private countersService: CountersService
  ) {
  }

  public ngOnInit() {
  }

  public goBack(event: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.updateCounters) {
      this.update();
    }
    if (this.handle) {
      this.router.navigateByUrl(this.handle);
    } else if (this.view.indexOf('custom') >= 0) {
      this.customClick.emit();
    } else {
      this.location.back();
    }
  }

  private update() {
    this.countersService.doCountersApiRequest()
      .subscribe((data) => {
        this.countersService.setCounters(data);
      });
  }
}
