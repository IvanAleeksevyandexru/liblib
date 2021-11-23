import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IButton } from '@epgu/ui/models';

@Component({
  selector: 'lib-button',
  templateUrl: 'button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit, AfterViewChecked, IButton {
  @Input() public type: 'button' | 'anchor' | 'search' | 'new-search' = 'button';
  @Input() public size: 'md' | 'lg' | '' = '';
  @Input() public fontSize: number | null;
  @Input() public color: 'white' | 'transparent' | '' = '';
  @Input() public width: 'wide' | '' = '';
  @Input() public height: 'dynamic' | '' = '';
  @Input() public disabled = false;
  @Input() public link = '';

  @Input() public target: '_blank' | '_self' | '_parent' | '_top' = '_self';
  @Input() public internalLink = '';
  @Input() public showLoader = false;
  @Input() public theme: 'light' | 'light left-btn' | 'light right-btn' | '' = '';
  @Input() public buttonType: 'submit' | 'reset' | 'button' = 'button';

  @ViewChild('contentData', {static: false}) public content: ElementRef;

  public active = false;
  public smallPaddings = false;

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  public ngOnInit() {

  }

  public ngAfterViewChecked() {
    if (this.content?.nativeElement && !this.smallPaddings) {
      this.smallPaddings = this.content.nativeElement.innerHTML.length > 16;
      this.cd.detectChanges();
    }
  }

  public onClick(event: Event): void {
    if (this.disabled || this.showLoader) {
      event.stopPropagation();
    }
  }

  public setActive(active: boolean) {
    this.active = active;
  }

}
