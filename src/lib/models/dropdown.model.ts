import { Observable, of } from 'rxjs';

/* dropdown and lookup items */
export class ListItem {

  constructor(itemLike: any, originalItem?: any) {
    this.id = itemLike && itemLike.id;
    this.text = itemLike && itemLike.text;
    this.hidden = itemLike && itemLike.hidden;
    this.originalItem = originalItem || itemLike;
  }

  public id: number | string;
  public text: string;
  public formatted: string;
  public hidden?: boolean;
  public originalItem: any;

  public static compare(a: ListItem, b: ListItem) {
    if (a && b) {
      return a.id === b.id;
    } else {
      return !a && !b;
    }
  }

  public compare(anotherValue: ListItem) {
    return ListItem.compare(this, anotherValue);
  }
}

/* autocomplete list items */
export class AutocompleteSuggestion {

  constructor(value: string | any, originalItem: any) {
    this.text = typeof value === 'string' || value instanceof String ? value : value.text;
    this.originalItem = originalItem || value;
  }

  public text: string;
  public originalItem: any;
}

/* lookup list items with additonal highlight info */
export class SubstringHighlightedItem extends ListItem {

  constructor(item: ListItem, pre: string, post: string, highlighted: string) {
    super(item, item.originalItem);
    this.pre = pre;
    this.post = post;
    this.highlighted = highlighted;
  }

  public pre?: string;
  public highlighted?: string;
  public post?: string;

}

export class ListItemConverter<T = any> {

  constructor(inputConverter: (input: T, index?: number) => ListItem, outputConverter: (ListItem) => T) {
    this.inputConverter = inputConverter;
    this.outputConverter = outputConverter;
  }

  public inputConverter: (input: T, index?: number) => ListItem;
  public outputConverter: (ListItem) => T;
}

export interface LookupProvider<T = any> {

  search: (query: string, configuration?: { [name: string]: any }) => Promise<Array<T>> | Observable<Array<T>>;
}

export interface AutocompleteSuggestionProvider {

  search: (query: string, configuration?: { [name: string]: any }) =>
    Promise<Array<string | any>> | Observable<Array<string | any>>;
}

