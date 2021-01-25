import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Modal } from '../../models/modal-container';
import { SearchService } from '../../services/search/search.service';
import { LoadService } from '../../services/load/load.service';
import { SearchSputnikComponent } from '../search-sputnik/search-sputnik.component';

@Component({
  selector: 'lib-modal-search',
  templateUrl: './modal-search.component.html',
  styleUrls: ['./modal-search.component.scss']
})

@Modal()

export class ModalSearchComponent implements OnInit, AfterViewInit {
  private destroy: () => void;

  @ViewChild('searchBox') private searchBox;
  @ViewChild('searchSputnik') public searchSputnik: SearchSputnikComponent;

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
              private loadService: LoadService) { }

  public ngOnInit() { }

  public ngAfterViewInit() {
    this.onScroll();
  }

  public onSearch() {
    const query = this.searchSputnik &&
    this.searchSputnik.lookup &&
    this.searchSputnik.lookup.query ? this.searchSputnik.lookup.query.trim() : '';
    document.location.href = this.loadService.config.betaUrl + '/search?query=' + encodeURIComponent(query);
  }

  public onCancel() {
    this.destroy();
  }
}
