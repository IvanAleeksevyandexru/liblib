import { Component, HostListener, OnInit } from '@angular/core';
import { PsoService } from '@epgu/ui/services/pso';
import { filter, takeUntil } from 'rxjs/operators';
import { LoadService } from '@epgu/ui/services/load';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-pso',
  templateUrl: './pso.component.html',
  styleUrls: ['./pso.component.scss']
})
export class PsoComponent implements OnInit {

  private footer: HTMLElement | null;
  private widgetPSO: HTMLElement | null;

  private destroy$ = new Subject();

  constructor(
    public psoService: PsoService,
    public loadService: LoadService
  ) {
    this.psoService.isPlaced$.pipe(
      takeUntil(this.destroy$),
      filter(isPlaced => isPlaced),
    ).subscribe(() => this.onScroll());
  }

  public ngOnInit() {
  }

  @HostListener('document:scroll') public onScroll() {
    if (this.loadService.attributes.deviceType === 'mob') {
      return;
    }
    this.footer = this.footer || document.getElementById('footer-wrapper');
    this.widgetPSO = this.widgetPSO || document.getElementById('pso-widget');
    if (this.footer && this.widgetPSO) {
      const widgetBottom = this.widgetPSO.getBoundingClientRect().bottom;
      const footerTop = this.footer.getBoundingClientRect().top;
      const shouldBeAbsolute = widgetBottom + 1 >= footerTop && footerTop < window.innerHeight;
      const isAbsolute = (this.widgetPSO as any).style.position === 'absolute';
      if (shouldBeAbsolute && !isAbsolute) {
        (this.widgetPSO as any).style.position = 'absolute';
      } else if (!shouldBeAbsolute && isAbsolute) {
        (this.widgetPSO as any).style.position = '';
      }
    }
  }

}
