import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAgentService {

  public userAgent = window.navigator.userAgent;

  constructor() {  }

  public isIE(): boolean {
    return /trident|msie/i.test(this.userAgent);
  }

  public isMozillaFirefox(): boolean {
    return /Firefox/i.test(this.userAgent);
  }

  public changeGridForIE(): void {
    if (this.isIE()) {
      const gridElements: NodeList = document.querySelectorAll('.grid-row, .grid-row-md, .grid-row-lg');

      gridElements.forEach((element: HTMLDivElement | any) => {
        const elementHtml = element as HTMLElement;

        if (elementHtml.className.indexOf('ie-grid') === -1) {
          const col = {lg: 0, md: 0, sm: 0};
          const row = {lg: 1, md: 1, sm: 1};
          const countColInRow = {lg: 1, md: 1, sm: 1};
          const maxCol = {lg: 23, md: 11, sm: 5};

          elementHtml.classList.add('ie-grid');

          elementHtml.childNodes.forEach((elem: HTMLDivElement | any) => {
            const el = elem as HTMLElement;

            if (el.classList) {
              const push = {lg: 0, md: 0, sm: 0};
              el.classList.forEach((className: string) => {
                if (className.indexOf('push-') !== -1) {
                  push.lg = className.indexOf('push-lg-') !== -1 ?
                    +className.substr(className.lastIndexOf('-') + 1) :
                    push.lg !== 0 ? push.lg : 0;
                  push.md = className.indexOf('push-md-') !== -1 ?
                    +className.substr(className.lastIndexOf('-') + 1) :
                    push.md !== 0 ? push.md : 0;
                  push.sm = className.indexOf('push-sm-') !== -1 ?
                    +className.substr(className.lastIndexOf('-') + 1) :
                    push.sm !== 0 ? push.sm : 0;
                }
              });

              el.classList.forEach((className: string) => {

                const addClassAndRecalc = (prefix: string) => {
                  let pushCount: number;

                  if (prefix === 'lg') {
                    pushCount = push.lg || push.md || push.sm;
                  } else if (prefix === 'md') {
                    pushCount = push.md || push.sm;
                  } else {
                    pushCount = push.sm || 0;
                  }

                  const colLength = +className.substr(className.lastIndexOf('-') + 1) * 2 - 1; // сколько колонок занимает в ие
                  const allColLength = col[prefix] + colLength + (countColInRow[prefix] === 1 && maxCol[prefix] !== colLength ? 1 : 0);

                  if (allColLength > maxCol[prefix] || pushCount) {
                    row[prefix]++;
                    col[prefix] = pushCount ? pushCount * 2 : 0;
                    countColInRow[prefix] =  1;
                  }

                  el.classList.add(`-ms-row-${prefix}-${row[prefix]}`);
                  el.classList.add(`-ms-start-${prefix}-${col[prefix] === 0 ? 1 : col[prefix] + 1}`);

                  countColInRow[prefix]++;
                  col[prefix] += colLength + 1;
                };

                if (className.indexOf('col-') !== -1) {
                  if (className.indexOf('col-lg-') !== -1) {
                    addClassAndRecalc('lg');
                  } else if (className.indexOf('col-md-') !== -1) {
                    addClassAndRecalc('md');
                  } else {
                    addClassAndRecalc('sm');
                  }
                }
              });
            }
          });
        }
      });
    }
  }
}
