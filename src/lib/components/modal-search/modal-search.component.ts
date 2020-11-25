import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Modal } from '../../models/modal-container';
import { SearchService } from '../../services/search/search.service';
import { LoadService } from '../../services/load/load.service';
import { Router } from '@angular/router';
import { SearchSuggestion } from '../../models/search';
import { ListItem, ListItemConverter } from '../../models/dropdown.model';
import { LookupComponent } from '../lookup/lookup.component';

@Component({
  selector: 'lib-modal-search',
  templateUrl: './modal-search.component.html',
  styleUrls: ['./modal-search.component.scss']
})

@Modal()

export class ModalSearchComponent implements OnInit, AfterViewInit {
  public searchItem: SearchSuggestion;
  private destroy: () => void;

  public searchProvider = this.searchService;
  public converter = new ListItemConverter<SearchSuggestion>((item: SearchSuggestion, ctx: { [name: string]: any}): ListItem => {
    return new ListItem({ id: '' + ctx.index, text: item.header, icon: item.favicon || '', url: item.url}, item);
  }, (item: ListItem): SearchSuggestion => {
    return item.originalItem;
  });

  @ViewChild('searchBox') private searchBox;
  @ViewChild('lookup') public lookup: LookupComponent;

  @HostListener('document:keydown', ['$event']) public onKeydownComponent(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.destroy();
    }
  }

  @HostListener('document:click', ['$event']) public onClickOut(event) {
    if (event.target.classList.contains('modal-overlay')) {
      this.destroy();
    }
  }

  @HostListener('document:scroll') public onScroll() {
    if (window.pageYOffset > 50) {
      this.searchBox.nativeElement.classList.add('scrolled');
    } else {
      this.searchBox.nativeElement.classList.remove('scrolled');
    }
  }

  constructor(private searchService: SearchService,
              private loadService: LoadService,
              private router: Router) { }

  public ngOnInit() { }

  public ngAfterViewInit() {
    this.onScroll();
  }

  public formatter(item) {
    if (!item) {
      return;
    }
    if (item.originalItem.favicon) {
      return `<div class="item-wrapper">
                <div class="icon" style="background-image: url(${item.originalItem.favicon});"></div>
                <div class="suggestion with-icon">${item.text}</div>
              </div>`;
    } if (item.originalItem.name) {
      return `<div class="item-wrapper">
                <div *ngIf="item.originalItem.image" class="icon" style="background-image: url(${item.originalItem.image});"></div>
                <div class="suggestion with-icon with-original-name">${item.originalItem.name}</div>
              </div>`;
    } else {
      return `<div class="item-wrapper">
                    <div class="suggestion">${item.text}</div>
              </div>`;
    }
  }

  public onSearch() {
    const query = this.lookup.query ? this.lookup.query.trim() : '';
    if (this.searchItem && this.searchItem.url && query === this.searchItem.header) {
      document.location.href = this.searchItem.url;
    } else {
      document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(query);
    }
  }

  public onCancel() {
    this.destroy();
  }
}
