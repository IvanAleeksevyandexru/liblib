import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {

  public version = 'v=1.0';
  public metaUrl: string;
  public metaTitle: string;
  public metaDescription: string;
  public metaImg: string;

  private static popup(url: string) {
    (window as any).open(url, '', 'toolbar=0,status=0,width=626,height=436');
  }

  constructor(meta: Meta) {
    // TODO: Ранее предполагалось, что meta-аттрибуты обязательно будут на странице. Если это так, убрать костыль
    const empty = { content: '' };

    this.metaUrl = (meta.getTag('property="og:url"') || empty).content;
    this.metaTitle = (meta.getTag('property="og:title"') || empty).content;
    this.metaDescription = (meta.getTag('property="og:description"') || empty).content;
    this.metaImg = (meta.getTag('property="og:image"') || empty).content;

    if (this.metaUrl.indexOf('#') > 0) { // url нужен до #
      this.metaUrl = this.metaUrl.substr(0, this.metaUrl.indexOf('#'));
    }
  }

  public vkontakte(href: string, title?: string) {
    let url = 'http://vkontakte.ru/share.php?';
    url += 'url=' + encodeURIComponent(href || this.metaUrl);
    url += '&title=' + encodeURIComponent(title || this.metaTitle);
    url += '&description=' + encodeURIComponent(this.metaDescription);
    url += '&image=' + encodeURIComponent(this.metaImg); // 80 * 80
    url += '&noparse=true';

    SocialShareService.popup(url);
  }

  public facebook(href: string, title?: string) {
    const url  = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(href || this.metaUrl);
    // url += '&p[title]=' + encodeURIComponent(title || this.metaTitle);
    // url += '&p[summary]=' + encodeURIComponent(this.metaDescription);
    // url += '&p[url]=' + encodeURIComponent(href || this.metaUrl);
    // url += '&p[images][0]=' + encodeURIComponent(this.metaImg); // 158 * 158

    SocialShareService.popup(url);
  }

  public odnoklassniki(href: string, title?: string) {
    const url  = 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=' + encodeURIComponent(href || this.metaUrl);
    // url += '&st.comments=' + encodeURIComponent(title);

    SocialShareService.popup(url);
  }

  public twitter(href: string, title?: string) {
    let url  = 'http://twitter.com/share?' + this.version;
    url += 'text=' + encodeURIComponent(title || this.metaTitle);
    url += '&url=' + encodeURIComponent(href || this.metaUrl);
    url += '&counturl=' + encodeURIComponent(this.metaUrl);

    SocialShareService.popup(url);
  }

  public telegram(href: string, title?: string) {
    let url  = 'https://t.me/share/url?';
    url += 'url=' + encodeURIComponent(href || this.metaUrl);
    url += '&text=' + encodeURIComponent(title || this.metaTitle);

    SocialShareService.popup(url);
  }
}
