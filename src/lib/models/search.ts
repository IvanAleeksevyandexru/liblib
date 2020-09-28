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

export interface SearchSputnikSuggests {
  services?: SimpleSputnikSuggest[],
  info?: SimpleSputnikSuggest[],
  departments?: SimpleSputnikSuggest[],
  faq?: SimpleSputnikSuggest[],
  situations?: SimpleSputnikSuggest[],
  news?: SimpleSputnikSuggest[],
  other?: SimpleSputnikSuggest[],
  suggests?: SimpleSputnikSuggest[]
}

export interface SimpleSputnikSuggest {
  name: string;
  image: string | null;
  link: string | null;
}
