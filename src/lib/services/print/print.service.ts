import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  private printPath: string;
  private renderer: Renderer2;

  constructor(
    private router: Router,
    private rendererFactory: RendererFactory2,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  public static printAvailable(): boolean {
    return typeof window.print === 'function';
  }

  public print(url) {
    this.printPath = url;
    this.router.navigate([url, { outlets: { print: ['print'] }}], {skipLocationChange: true});
  }

  public onDataReady() {
    const unlistenBeforePrint = this.renderer.listen('window', 'beforeprint', () => {
      document.body.classList.add('isPrinting');
      unlistenBeforePrint();
    });

    const unlistenAfterPrint = this.renderer.listen('window', 'afterprint', () => {
      setTimeout(() => {
        document.body.classList.remove('isPrinting');
        this.removeOutlet();
        this.renderer.destroy();
      }, 2000);
      unlistenAfterPrint();
    });

    window.print();
  }

  public removeOutlet() {
    if (this.printPath) {
      this.router.navigate([this.printPath, { outlets: { print: null }}], {skipLocationChange: true});
      this.printPath = undefined;
    }
  }
}
