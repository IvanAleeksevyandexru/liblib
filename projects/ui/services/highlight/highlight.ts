import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  constructor(
    private route: ActivatedRoute
  ) {
  }

  /**
   * метод поиска и выделения текста
   */
  private static doHighlight(text: string, color = '#FEF0CC'): void {
    const win = (window as any);
    if (win.find && win.getSelection) {
      if (win.find(text, false, true)) {
        document.designMode = 'on';
        const sel = win.getSelection();
        sel.collapseToEnd();
        while (win.find(text, false, true)) {
          document.execCommand('hiliteColor', false, color);
        }
        sel.collapseToStart();
        document.designMode = 'off';
      }
    }
  }

  /** для всех страниц в приложении или большом компоненте */
  public highlightTextFromQueryParam(paramName?: string | null, color?: string) {
    paramName = paramName || 'highlight';
    const text = this.route.snapshot.queryParamMap.get(paramName);
    if (text) {
      setTimeout(() => {
        this.highlight(text, color);
      });
    }
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
