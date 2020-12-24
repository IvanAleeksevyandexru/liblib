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
  help?: SimpleSputnikSuggest[],
  info?: SimpleSputnikSuggest[],
  news?: SimpleSputnikSuggest[],
  other?: SimpleSputnikSuggest[],
  service?: SimpleSputnikSuggest[],
  situation?: SimpleSputnikSuggest[],
  structure?: SimpleSputnikSuggest[],
  suggest?: SimpleSputnikSuggest[]
}

export interface SimpleSputnikSuggest {
  name: string;
  image: string | null;
  link: string | null;
  children?: SimpleSputnikSuggest[];
  lineBreak?: string;
  query?: string;
}


export interface SearchSputnikConfig {
  url: string;
  request: {
    _: string;
    query?: string;
    q?: string;
    serviceRecipient?: string;
  };
}
