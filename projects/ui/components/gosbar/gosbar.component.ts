import { Component, OnInit } from '@angular/core';
import { GosbarService } from '@epgu/ui/services/gosbar';
import { LoadAsyncStaticService } from '@epgu/ui/services/load-async-static';
import { LoadService } from '@epgu/ui/services/load';

@Component({
  selector: 'lib-gosbar',
  templateUrl: './gosbar.component.html',
  styleUrls: ['./gosbar.component.scss']
})
export class GosbarComponent implements OnInit {

  constructor(
    private loadService: LoadService,
    private loadAsyncStaticService: LoadAsyncStaticService,
    private gosbarService: GosbarService
  ) { }

  public ngOnInit() {
    this.initGosbar();
  }

  private initGosbar() {
    const gosbarUrl = this.loadService.config.gosbarUrl + '/widget.js?' + this.loadService.config.gosbarResourceVersion;
    (window as any)._govWidget = {
      manualInitMode: true
    };
    this.loadAsyncStaticService.loadScriptAsync(gosbarUrl, true, () => {
      this.gosbarService.initGosbar();
    });
  }
}
