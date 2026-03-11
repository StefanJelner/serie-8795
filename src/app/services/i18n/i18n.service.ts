import {
  Injectable,
  Signal,
  WritableSignal,
  computed,
  effect,
  signal,
} from '@angular/core';
import i18next, { Resource, i18n } from 'i18next';

/**
 * # I18nService
 *
 * Service for handling i18n/locale information.
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private static readonly STORAGE_KEY: string = 'locale';
  private static readonly DEFAULT_LOCALE: string = 'en';

  private readonly _locale: WritableSignal<string>;
  private readonly _data: WritableSignal<Resource> = signal({
    [I18nService.DEFAULT_LOCALE]: { translation: {} },
  });
  private readonly _refresh = signal<number>(0);
  private _i18next: i18n;
  private readonly _defaultOptions = {
    fallbackLng: I18nService.DEFAULT_LOCALE,
  };

  constructor() {
    const storageValue = localStorage.getItem(I18nService.STORAGE_KEY);

    this._locale = signal<string>(
      storageValue !== null && this._isLocale(storageValue) === true
        ? storageValue
        : I18nService.DEFAULT_LOCALE,
    );

    this._i18next = i18next.createInstance({
      ...this._defaultOptions,
      lng: this._locale(),
      resources: this._data(),
    });

    this._i18next.init();

    effect(() => {
      localStorage.setItem(I18nService.STORAGE_KEY, this._locale());

      this._i18next.changeLanguage(this._locale());

      this.refresh();
    });

    effect(() => {
      this._i18next = i18next.createInstance({
        ...this._defaultOptions,
        lng: this._i18next.language,
        resources: this._data(),
      });

      this._i18next.init();

      this.refresh();
    });
  }

  /**
   * Returns the locale specific string - with placeholders replaced - a readonly signal.
   *
   * @param key the key of the translation
   * @param variables variable values (for placeholders inside the translations)
   * @returns the locale specific string as a readonly signal
   */
  public translate(
    key: string,
    variables?: Record<string, unknown>,
  ): Signal<string> {
    return computed(() => {
      // We do not really use the refresh signal here. It is only there to trigger the computed signal, whenever
      // the refresh signal becomes set.
      this._refresh();
      return this._i18next.t(
        [
          key,
          // Providing an empty string as the fallback results in i18next showing an empty string, if a key cannot
          // be found inspite of the key itself
          '',
        ],
        variables,
      );
    });
  }

  /**
   * Refreshes all translation computed signals.
   */
  public refresh(): void {
    this._refresh.set(+Date.now());
  }

  /**
   * Provides the locale as a readonly signal.
   *
   * @returns the locale as a readonly signal
   */
  public locale(): Signal<string> {
    return this._locale.asReadonly();
  }

  /**
   * Sets the locale.
   *
   * @param locale the locale
   */
  public setLocale(locale: string): void {
    if (this._isLocale(locale) === true) {
      this._locale.set(locale);
    } else {
      throw `The locale "${locale}" does not exist.`;
    }
  }

  /**
   * Provides the data as a readonly signal.
   *
   * @returns the data as a readonly signal
   */
  public data(): Signal<Resource> {
    return this._data.asReadonly();
  }

  /**
   * Sets the data.
   *
   * @param data the data
   */
  public setData(data: Resource): void {
    if (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data) === false
    ) {
      // The data has to contain at least the default locale, because this is the fallback locale
      if (Object.keys(data).indexOf(I18nService.DEFAULT_LOCALE) !== -1) {
        this._data.set(data);
      } else {
        throw `The default locale "${I18nService.DEFAULT_LOCALE}" is not provided in the data.`;
      }
    } else {
      throw 'The provided data is not an object.';
    }
  }

  /**
   * Checks whether a given value is a valid locale.
   *
   * @param locale the potential locale value
   * @returns whether a given value is a valid locale
   */
  private _isLocale(locale: string): boolean {
    // Locales usually consist of two lowercase alpha characters
    return /^[a-z]{2}$/.test(locale);
  }
}
