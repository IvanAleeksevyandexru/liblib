import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'lib-paging-controls',
  templateUrl: 'paging-controls.component.html',
  styleUrls: ['./paging-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagingControlsComponent implements OnInit, OnChanges {

  // показываем пред/след кнопки (может быть использовано вместе с numericButtons или само по себе)
  // если true показываем, дизейблим когда достигнут конец
  @Input() public prevNextButtons = true;
  @Input() public numericButtons = true;  // блок ссылок на страницы по номерам. показывать или нет
  @Input() public classList: string;
  @Input() public numericButtonsNeighboursThreshold = 1;  // количество страниц-соседей (вправо и влево от текущей) которые показывать
  @Input() public numericButtonsTailsThreshold = 1;  // количество страниц-соседей первой и последней которые показывать

  // привязка к размеру/общей длине массива итемов, дсотупных для отображения
  @Input() public count = 0;
  @Input() public pageSize = 5;
  @Input() public pageSizeList = [5, 10, 15, 20, 25, 50, 100, 150, 200, 500, 1000];
  // внешняя привязка к activePage, внутренняя страница пассивна и следует за изменениями страницы из вне
  @Input() public activePage = 1;

  @Input() public showPageSizeControl = false;
  @Input() public showTotalInfo = false;

  @Output() private pageChanged = new EventEmitter<any>(true);
  @Output() private pageSizeChanged = new EventEmitter<any>();

  // внутренняя activePage
  public currentPage = this.activePage;
  public innerPageSize = this.pageSize;
  public innerPageSizeList = this.pageSizeList;
  public isOpenedList = false;
  public lastPage = 1;
  public numericControlStructure: Array<number> = [];

  public ngOnInit() {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'numericButtonsNeighboursThreshold':
        case 'numericButtonsTailsThreshold': {
          this.updateControls();
          break;
        }
        case 'count': {
          this.updatePageSizeList();
          this.updateCount();
          break;
        }
        case 'pageSize': {
          this.innerPageSize = this.pageSize;
          this.updatePageSize();
          break;
        }
        case 'activePage': {
          this.currentPage = this.activePage;
          this.updateControls();
          break;
        }
        case 'pageSizeList': {
          this.updatePageSizeList();
        }
      }
    }
  }

  public update() {
    this.updatePageSize();
    this.updateCurrentPage();
  }

  public updateCount() {
    this.updateControls();
    if (!this.checkPage(this.currentPage)) {
      this.setPage(1);
    }
  }

  public updatePageSize() {
    this.updateCount();
  }

  public updateCurrentPage() {
    this.currentPage = this.activePage;
    this.updateControls();
  }

  // вызывается из темплейта
  public setPage(value: number) {
    if (this.checkPage(value) && value !== this.activePage) {
      this.pageChanged.emit({page: value});
    }
  }

  public checkPage(value: number) {
    return value >= 1 && value <= this.lastPage;
  }

  public setPageIf(value: number, conditionMet: boolean) {
    if (conditionMet) {
      this.setPage(value);
    }
  }

  private updatePageSizeList(): void {
    let lastFilterIndex = 0;
    this.innerPageSizeList = this.pageSizeList.filter((item, index) => {
      if (item < this.count){
        lastFilterIndex = index;
        return true;
      } else if (lastFilterIndex > 0 && lastFilterIndex === index - 1) {
        return true;
      }
    });
    this.updateControls();
  }

  private updateControls() {
    // visibleItemsLength - Общее количество элементов для отображения с учетом отступов от начала/конца и от выбранной страницы
    // BASIS - минимальное количество отображаемых элементов в пагинаторе
    const BASIS = 3;

    let lastPage = this.lastPage = this.pageSize ? Math.ceil(this.count / this.pageSize) : 1;
    if (!lastPage || isNaN(lastPage) || lastPage <= 0) {
      lastPage = this.lastPage = 1;
    }

    const visibleItemsLength = BASIS + this.numericButtonsTailsThreshold * 2 + this.numericButtonsNeighboursThreshold * 2;
    let pages = [];
    if (lastPage <= visibleItemsLength) {
      for (let i = 0; i < this.lastPage; i++) {
        pages[i] = i + 1;
      }
    } else {
      // текущая страница слева от центральной позиции (показывается одно '...' у правого конца)
      if (this.currentPage < BASIS + this.numericButtonsNeighboursThreshold + this.numericButtonsTailsThreshold) {
        const fillIndex = visibleItemsLength - (this.numericButtonsTailsThreshold + 1);
        for (let i = 0; i < fillIndex; i++) {
          pages[i] = i + 1;
        }
        pages[fillIndex] = -1;
        if (this.numericButtonsTailsThreshold >= 1) {
          for (let i = visibleItemsLength - 1; i >= fillIndex + 1; i--) {
            if (i === visibleItemsLength - 1) {
              pages[i] = lastPage;
            } else {
              pages[i] = pages[i + 1] - 1;
            }
          }
        }
      // текущая страница справа от центральной позиции (показывается одно '...' у левого конца)
      } else if (this.currentPage > lastPage - (BASIS + this.numericButtonsTailsThreshold) - (this.numericButtonsNeighboursThreshold - 1)) {
        if (this.numericButtonsTailsThreshold >= 1) {
          for (let i = 0; i < this.numericButtonsTailsThreshold; i++) {
            if (i === 0) {
              pages[i] = 1;
            } else {
              pages[i] = pages[i - 1] + 1;
            }
          }
        }

        pages[this.numericButtonsTailsThreshold] = -1;
        for (let i = visibleItemsLength - 1; i >= this.numericButtonsTailsThreshold + 1; i--) {
          if (i === visibleItemsLength - 1) {
            pages[i] = lastPage;
          } else {
            pages[i] = pages[i + 1] - 1;
          }
        }
      // текущая страница справа в центре (показывается два '...' вокруг центральной позиции с расчетом соседей)
      } else {
        for (let i = 0; i < this.numericButtonsTailsThreshold; i++) {
          pages.push(i + 1);
        }
        pages.push(-1);
        let start = this.currentPage - this.numericButtonsNeighboursThreshold - 1;
        for (let i = 0; i <= this.numericButtonsNeighboursThreshold * 2; i++) {
          pages.push(start += 1);
        }
        pages.push(-1);
        for (let i = 0; i < this.numericButtonsTailsThreshold; i++) {
          pages.push(lastPage - i);
        }
      }
    }

    this.numericControlStructure = pages;
  }

  public togglePageSizeList(event?: Event): void {
    event?.preventDefault();
    this.isOpenedList = !this.isOpenedList;
  }

  public setPageSize(pageSize: number): void {
    this.pageSizeChanged.emit(pageSize);
    this.togglePageSizeList();
  }
}
