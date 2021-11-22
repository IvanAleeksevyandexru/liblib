import {
  Component, Input, Output, OnInit, OnChanges, SimpleChanges, ViewChild,
  ElementRef, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { MonthYear } from '@epgu/ui/models/date-time';
import { endOfYear, startOfYear } from 'date-fns';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lib-month-year-select',
  templateUrl: 'month-year-select.component.html',
  styleUrls: ['./month-year-select.component.scss']
})
export class MonthYearSelectComponent implements OnInit, OnChanges {

  constructor(private changeDetector: ChangeDetectorRef) {}

  @Input() public contextClass?: string;
  @Input() public activeMonthYear: MonthYear = MonthYear.fromDate(new Date());

  @Input() public disabled = false;
  @Input() public minDate: Date;
  @Input() public maxDate: Date;
  @Input() public joinedView = false;
  @Input() public simplifiedView = false;

  @Output() public navigated = new EventEmitter<MonthYear>();
  @Output() public navigatedPrevMonth = new EventEmitter<void>();
  @Output() public navigatedNextMonth = new EventEmitter<void>();

  public monthExpanded = false;
  public yearExpanded = false;
  public joinedExpanded = false;
  public yearsList: Array<number> = [];
  public monthsList: Array<MonthYear> = [];
  public selectedYear: number;
  public supposed: MonthYear;
  public minimum: MonthYear = MonthYear.fromDate(startOfYear(new Date()));
  public maximum: MonthYear = MonthYear.fromDate(endOfYear(new Date()));
  public nextMonthAvailable = true;
  public prevMonthAvailable = true;

  @ViewChild('container') private container: ElementRef;

  private commit: (value: MonthYear) => void;
  private onTouchedCallback: () => void;

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'minDate':
        case 'maxDate': {
          this.update();
          break;
        }
        case 'activeMonthYear': {
          this.updateValue();
          break;
        }
      }
    }
  }

  public update() {
    this.close();
    this.minimum = MonthYear.fromDate(this.minDate || startOfYear(new Date()));
    this.maximum = MonthYear.fromDate(this.maxDate || endOfYear(new Date()));
    if (this.maximum.firstDay() < this.minimum.firstDay()) {
      this.maximum = this.minimum.next();
    }
    this.rebuild();
  }

  public rebuild() {
    this.yearsList = Array.from(Array(this.maximum.year - this.minimum.year + 1).keys()).map((yearFromMinYear) => {
      return this.minimum.year + yearFromMinYear;
    });
    const activeYear = this.selectedYear || this.activeMonthYear && this.activeMonthYear.year;
    if (this.yearsList.includes(activeYear)) {
      const monthes = Array.from(Array(12).keys()).map((month) => new MonthYear(month, activeYear));
      this.monthsList = monthes.filter((month: MonthYear) =>
        month.firstDay() >= this.minimum.firstDay() && month.firstDay() <= this.maximum.firstDay());
    } else {
      this.monthsList = [];
    }
    this.updateButtons();
    this.changeDetector.detectChanges();
  }

  public setYear(year: number) {
    if (this.joinedView) {
      this.selectedYear = year;
      this.rebuild();
    } else {
      this.navigated.emit(new MonthYear(this.activeMonthYear.month, year));
      this.close();
    }
    this.changeDetector.detectChanges();
  }

  public setMonth(month: number) {
    this.navigated.emit(new MonthYear(month, this.selectedYear || this.activeMonthYear.year));
    this.close();
    this.changeDetector.detectChanges();
  }

  public prevMonth() {
    if (this.prevMonthAvailable && this.activeMonthYear) {
      this.navigatedPrevMonth.emit();
    }
    this.changeDetector.detectChanges();
  }

  public nextMonth() {
    if (this.nextMonthAvailable && this.activeMonthYear) {
      this.navigatedNextMonth.emit();
    }
    this.changeDetector.detectChanges();
  }

  public updateValue() {
    this.close();
    this.updateButtons();
  }

  public close() {
    this.monthExpanded = this.yearExpanded = this.joinedExpanded = false;
  }

  public toggle(monthOrYear?: boolean) {
    if (!this.disabled) {
      let opening = false;
      if (this.joinedView) {
        opening = (this.joinedExpanded = !this.joinedExpanded);
        this.selectedYear = null;
      } else {
        if (monthOrYear) {
          opening = (this.monthExpanded = !this.monthExpanded);
          this.yearExpanded = false;
        } else {
          opening = (this.yearExpanded = !this.yearExpanded);
          this.monthExpanded = false;
        }
      }
      if (opening) {
        this.rebuild();
        this.scrollToSelected();
      }
    }
  }

  public updateButtons() {
    this.prevMonthAvailable = this.activeMonthYear && !MonthYear.equals(this.activeMonthYear, this.minimum);
    this.nextMonthAvailable = this.activeMonthYear && !MonthYear.equals(this.activeMonthYear, this.maximum);
  }

  public scrollToSelected() {
    this.changeDetector.detectChanges();
    const selected = this.container.nativeElement.querySelector('.dropdown.expanded .items-list .item.selected');
    if (selected) {
      const containerElements = selected.parentElement.children;
      let selectedIndex = 0;
      for (let i = 0; i < containerElements.length; i++) {
        if (containerElements[i] === selected) {
          selectedIndex = i;
        }
      }
      const scrollableArea = selected.closest('.ps');
      if (scrollableArea) {
        // высота итема списка 20, паддинги верх-низ у joinedView 8, у stdView 12, 110 отступ от верха (центровка)
        setTimeout(() => scrollableArea.scrollTop = selectedIndex * (this.joinedView ? 36 : 44) - 110);
      }
    }
  }
}
