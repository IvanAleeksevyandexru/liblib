import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadAsyncStaticService {

  private readyState: string;
  private scripts = [];

  constructor() {
  }

  public loadScriptAsync(scripts, rerun, callback): void {
    if (!(scripts instanceof Array)) {
      scripts = [scripts];
    }
    scripts.forEach((src) => {
      const s: any = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;

      function afterLoad(clb) {
        if (clb && typeof clb === 'function') {
          clb.call(clb);
        }
      }

      s.onload = () => {
        if (this.scripts.indexOf(src) === -1 || rerun) {
          afterLoad(callback);
          this.scripts.push(src);
        }
      };
      s.onerror = () => {
        if (this.scripts.indexOf(src) === -1 || rerun) {
          this.scripts.push(src);
        }
      };
      s.onreadystatechange = () => {
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
          setTimeout(() => {
            s.onload();
          }, 0);
        }
      };
      s.src = src;
      const x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    });
  }

  public loadCSSAsync(filename): void {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('link');
    style.href = filename;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
  }
}
