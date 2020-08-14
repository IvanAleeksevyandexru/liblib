export interface SearchSuggests {
  suggests: Array<SearchSuggestion>;
}

export interface SearchSuggestion {
  description?: string;
  favicon?: string;
  header?: string;
  type?: string;
  url?: string;
}
