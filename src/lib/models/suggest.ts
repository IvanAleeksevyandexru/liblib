export interface Suggest {
  value: string;
  mnemonic: string;
  hints?: Hint[];
}

export interface Hint {
  value: string;
  mnemonic: string;
}
