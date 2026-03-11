import {
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private static readonly STORAGE_KEY: string = 'theme';
  private static readonly DEFAULT_THEME: Theme = Theme.LIGHT;

  private readonly _theme: WritableSignal<Theme>;

  constructor() {
    const storageValue = localStorage.getItem(
      ThemeService.STORAGE_KEY,
    ) as Theme;

    this._theme = signal<Theme>(
      storageValue !== null ? storageValue : ThemeService.DEFAULT_THEME,
    );

    effect(() => {
      localStorage.setItem(ThemeService.STORAGE_KEY, this._theme());
    });
  }

  public theme(): Signal<Theme> {
    return this._theme.asReadonly();
  }

  public setTheme(theme: Theme): void {
    this._theme.set(theme);
  }
}
