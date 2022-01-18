import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-paging-controls',
  templateUrl: 'paging-controls.component.html',
  styleUrls: ['./paging-controls.component.scss']
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
  @Input() public pageSize = 20;
  @Input() public pageSizeList = [20];
  // внешняя привязка к activePage, внутренняя страница пассивна и следует за изменениями страницы из вне
  @Input() public activePage = 1;

  @Input() public showPageSizeControl = true;
  @Input() public showPageInfo = true;

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
          this.innerPageSizeList = this.pageSizeList.filter(item => item < this.count);
          this.updateControls();
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

  private updateControls() {
    let lastPage = this.lastPage = this.pageSize ? Math.ceil(this.count / this.pageSize) : 1;
    if (!lastPage || isNaN(lastPage) || lastPage <= 0) {
      lastPage = this.lastPage = 1;
    }
    const pagesToBeAvailable = [];
    const push = (value: number) => {
      if (value >= 1 && value <= lastPage && !pagesToBeAvailable.includes(value)) {
        pagesToBeAvailable.push(value);
      }
    };

    for (let tailPage = 1; tailPage <= this.numericButtonsTailsThreshold; tailPage++) {
      push(tailPage);
    }

    for (let tailPage = lastPage - this.numericButtonsTailsThreshold + 1; tailPage <= lastPage; tailPage++) {
      push(tailPage);
    }

    for (let neighbourPage = this.currentPage - this.numericButtonsNeighboursThreshold;
         neighbourPage <= this.currentPage + this.numericButtonsNeighboursThreshold; neighbourPage++) {
      push(neighbourPage);
    }

    pagesToBeAvailable.sort((a, b) => a - b);

    const controlStructure = pagesToBeAvailable.length ? [pagesToBeAvailable[0]] : [];

    for (let pageIndex = 1; pageIndex < pagesToBeAvailable.length; pageIndex++) {
      const page = pagesToBeAvailable[pageIndex];
      const prevPage = pagesToBeAvailable[pageIndex - 1];
      if (page !== prevPage + 1) {
        controlStructure.push(-1);
      }
      controlStructure.push(page);
    }

    this.numericControlStructure = controlStructure;
  }

  public togglePageSizeList(): void {
    this.isOpenedList = !this.isOpenedList;
  }

  public setPageSize(pageSize: number): void {
    this.pageSizeChanged.emit(pageSize);
    this.togglePageSizeList();
  }
}
