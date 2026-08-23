// @ts-nocheck
// 处理国际化
export class I18n {
  private _locale: string;

  private langMap: Map<string, any> = new Map();

  constructor(locale: string) {
    this._locale = locale;
  }

  public getLocale(): string {
    return this._locale;
  }

  public setLocale(locale: string): void {
    this._locale = locale;
  }

  public getLangMap(): Map<string, any> {
    return this.langMap;
  }
}
