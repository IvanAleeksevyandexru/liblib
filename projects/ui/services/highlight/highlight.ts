import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  constructor(
    private route: ActivatedRoute
  ) {
  }

  /**
   * метод поиска и выделения текста,
   * при отсутствии значения - повторный поиск выполняется на протяжении
   * двух секунд, на случай если искомый текст приходит от сервиса
   */
  private static doHighlight(text: string, color = '#DDF5E7'): void {
    const win = (window as any);
    if (win.find && win.getSelection) {
      const check = () => {                    
        if (win.find(text)) {
          document.designMode = 'on';
          const sel = win.getSelection();
          sel.collapse(document.body, 0);
          while (win.find(text)) {
            document.execCommand('hiliteColor', false, color);
          }
          sel.collapseToStart();
          document.designMode = 'off';
        }
      };
      check();
    }
  }

  /** для всех страниц в приложении или большом компоненте */
  public highlightTextFromQueryParam(paramName?: string | null, color?: string): Subscription {
    paramName = paramName || 'highlight';
    return this.route.queryParams.subscribe(params => {
      const text = params[paramName];
      if (text) {          
        this.highlight(text, color);
      }
    });
  }

  /** найти и подсветить текст на странице */
  public highlight(text: string, color?: string): void {
    HighlightService.doHighlight(text, color);
  }

  /** найти и убрать подсветку текста на странице */
  public unhighlight(text: string): void {
    HighlightService.doHighlight(text, 'transparent');
  }
}
